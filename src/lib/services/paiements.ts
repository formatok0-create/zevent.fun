import "server-only";
import { isSupabaseConfigured } from "@/lib/config";
import { createPrivilegedSupabase } from "@/lib/supabase/admin";
import { listPlans } from "@/lib/services/admin";
import type { Invitation, InvitationWithPhotos } from "@/types/database";
import type { Plan } from "@/types/admin";

/* ═══════════════════════════════════════════════════════════════
   QUEL TARIF POUR QUELLE INVITATION
   Le mariage a un prix unique. L'anniversaire en a un par tranche
   d'age, et c'est l'age du celebre qui tranche — pas la collection
   choisie, qu'on peut changer librement apres paiement.
   ═══════════════════════════════════════════════════════════════ */

export function planCodeFor(invitation: {
  product?: string | null;
  celebrant_age?: number | null;
}): string {
  if ((invitation.product ?? "mariage") !== "anniversaire") return "mariage";
  const age = invitation.celebrant_age ?? 0;
  if (age <= 10) return "anniversaire-enfant";
  if (age <= 14) return "anniversaire-jeune-ado";
  if (age <= 17) return "anniversaire-ado";
  return "anniversaire-adulte";
}

export async function planFor(invitation: {
  product?: string | null;
  celebrant_age?: number | null;
}): Promise<Plan | null> {
  const code = planCodeFor(invitation);
  const plans = await listPlans(true);
  return plans.find((p) => p.code === code) ?? null;
}

/** Payée une fois, l'invitation le reste. */
export function estPayee(invitation: { paid_at?: string | null }): boolean {
  return Boolean(invitation.paid_at);
}

/* ═══════════════════════════════════════════════════════════════
   L'ÉCHÉANCE
   « Jusqu'à la fin du compte à rebours » : le lien vit jusqu'à
   l'événement, plus une marge. Sans cette marge, une invitation
   deviendrait inaccessible pendant la fête elle-meme — c'est
   precisement le moment ou les invites la rouvrent.
   ═══════════════════════════════════════════════════════════════ */

const JOURS_DE_GRACE = 15;

export function calculerEcheance(invitation: {
  wedding_date?: string | null;
}): string | null {
  if (!invitation.wedding_date) return null;
  const jour = new Date(`${invitation.wedding_date}T23:59:59`);
  if (Number.isNaN(jour.getTime())) return null;
  jour.setDate(jour.getDate() + JOURS_DE_GRACE);
  return jour.toISOString();
}

export function estExpiree(invitation: { expires_at?: string | null }): boolean {
  if (!invitation.expires_at) return false;
  return new Date(invitation.expires_at).getTime() < Date.now();
}

/* ═══════════════════════════════════════════════════════════════
   MARQUER UNE INVITATION COMME PAYÉE
   Appelé par le webhook, jamais par le navigateur : un paiement ne
   se declare pas depuis le client.
   ═══════════════════════════════════════════════════════════════ */

export async function marquerPayee(
  invitationId: string,
  planCode: string,
): Promise<Invitation | null> {
  if (isSupabaseConfigured) {
    const supabase = await createPrivilegedSupabase();
    const { data } = await supabase
      .from("invitations")
      .update({ paid_at: new Date().toISOString(), plan_code: planCode, updated_at: new Date().toISOString() })
      .eq("id", invitationId)
      .select("*")
      .maybeSingle();
    return (data as Invitation) ?? null;
  }
  const { db } = await import("@/lib/demo/store");
  const invitation = db.invitations.find((i) => i.id === invitationId);
  if (!invitation) return null;
  invitation.paid_at = new Date().toISOString();
  invitation.plan_code = planCode;
  invitation.updated_at = new Date().toISOString();
  return invitation;
}

export async function invitationDuPaiement(
  provider: string,
  reference: string,
): Promise<{ invitationId: string | null; userId: string | null }> {
  if (isSupabaseConfigured) {
    const supabase = await createPrivilegedSupabase();
    const { data } = await supabase
      .from("payments")
      .select("invitation_id, user_id")
      .eq("provider", provider)
      .eq("provider_reference", reference)
      .maybeSingle();
    return { invitationId: data?.invitation_id ?? null, userId: data?.user_id ?? null };
  }
  const { dbAdmin } = await import("@/lib/demo/store");
  const ligne = dbAdmin.paiements.find(
    (p) => p.provider === provider && p.provider_reference === reference,
  );
  return { invitationId: ligne?.invitation_id ?? null, userId: ligne?.user_id ?? null };
}

export type { InvitationWithPhotos };

/* ═══════════════════════════════════════════════════════════════
   LE DERNIER MAILLON
   Le webhook confirme un paiement ; encore faut-il que l'invitation
   le sache et parte en ligne. Sans ca, le client paie et reste
   devant un bouton « Payer » — le pire scenario possible.
   ═══════════════════════════════════════════════════════════════ */

/** Marque l'invitation payée et la publie. Idempotent : un webhook
 *  rejoué ne republie pas une invitation que son auteur a retirée. */
export async function encaisserEtPublier(invitationId: string): Promise<void> {
  const { publishInvitationInterne } = await import("@/lib/services/invitations");

  if (isSupabaseConfigured) {
    const supabase = await createPrivilegedSupabase();
    const { data } = await supabase
      .from("invitations")
      .select("id, paid_at")
      .eq("id", invitationId)
      .maybeSingle();
    if (!data) return;
    /* Déjà payée : le webhook est un rejeu, on ne touche à rien. */
    if (data.paid_at) return;

    await supabase
      .from("invitations")
      .update({ paid_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", invitationId);
  } else {
    const { db } = await import("@/lib/demo/store");
    const invitation = db.invitations.find((i) => i.id === invitationId);
    if (!invitation || invitation.paid_at) return;
    invitation.paid_at = new Date().toISOString();
  }

  /* La publication suit le paiement, comme l'annoncent les CGV :
     étape 5 paiement, étape 6 confirmation, étape 7 publication. */
  await publishInvitationInterne(invitationId);
}
