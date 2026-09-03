"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/services/session";
import {
  listPlans,
  savePlan,
  saveSettings,
  setUserName,
  setUserRole,
  setUserStatus,
  unpublishAllFor,
} from "@/lib/services/admin";
import type { PaymentProviderId } from "@/types/admin";

/* Chaque action rappelle `requireAdmin()`. Ce n'est pas redondant avec
   la garde du layout : une action serveur est une route à part entière,
   appelable directement, et le rendu de la page ne la protège pas. */

type Resultat = { ok: boolean; message: string };

export async function toggleProviderAction(
  provider: PaymentProviderId,
  enabled: boolean,
): Promise<Resultat> {
  await requireAdmin();
  await saveSettings(provider, { enabled });
  revalidatePath("/admin/paiements");
  return {
    ok: true,
    message: enabled ? "Fournisseur activé." : "Fournisseur désactivé.",
  };
}

export async function saveProviderAction(
  provider: PaymentProviderId,
  formData: FormData,
): Promise<Resultat> {
  await requireAdmin();

  const texte = (cle: string) => {
    const valeur = String(formData.get(cle) ?? "").trim();
    return valeur || null;
  };

  /* Un champ secret laissé vide ne veut pas dire « efface le secret » :
     l'administration ne le réaffiche jamais, donc le champ est vide à
     chaque ouverture. On ne remplace que ce qui a été saisi. */
  const environnement = formData.get("environment") === "live" ? "live" : "test";
  const champs: Record<string, unknown> = {
    environment: environnement,
    product_id: texte("product_id"),
  };
  const cle = texte("api_key");
  const secret = texte("webhook_secret");

  /* SasPay ne change pas d'URL entre test et production : il distingue
     les deux par le préfixe de la clé. Le menu déroulant ne protégeait
     donc de rien — une clé sk_live_ enregistrée en « Test » encaissait
     pour de vrai. On refuse la combinaison ici, avant l'écriture. */
  if (cle && provider === "saspay") {
    const { coherenceCle } = await import("@/lib/payments/types");
    const controle = coherenceCle(cle, environnement);
    if (!controle.ok) return { ok: false, message: controle.message };
  }

  if (cle) champs.api_key = cle;
  if (secret) champs.webhook_secret = secret;

  await saveSettings(provider, champs);
  revalidatePath("/admin/paiements");
  return { ok: true, message: "Réglages enregistrés." };
}

export async function savePlanAction(id: string, formData: FormData): Promise<Resultat> {
  await requireAdmin();

  const montant = Number(formData.get("amount"));
  if (!Number.isFinite(montant) || montant < 0) {
    return { ok: false, message: "Le montant doit être un nombre positif." };
  }

  await savePlan(id, {
    name: String(formData.get("name") ?? "").trim() || "Sans nom",
    description: String(formData.get("description") ?? "").trim() || null,
    /* Unité entière : 15000 XOF. Un tarif saisi avec des décimales est
       arrondi ici plutôt que de traîner un flottant jusqu'en base. */
    amount: Math.round(montant),
    currency: String(formData.get("currency") ?? "XOF").trim().toUpperCase().slice(0, 3),
    chariow_product_id: String(formData.get("chariow_product_id") ?? "").trim() || null,
    active: formData.get("active") === "on",
  });
  revalidatePath("/admin/tarifs");
  return { ok: true, message: "Tarif enregistré." };
}

export async function setUserStatusAction(
  userId: string,
  statut: "active" | "blocked",
): Promise<Resultat> {
  await requireAdmin();
  await setUserStatus(userId, statut);
  revalidatePath("/admin/utilisateurs");
  return {
    ok: true,
    message: statut === "blocked" ? "Compte bloqué." : "Compte réactivé.",
  };
}

export async function setUserRoleAction(
  userId: string,
  role: "user" | "admin",
): Promise<Resultat> {
  const moi = await requireAdmin();
  /* Se retirer soi-même le rôle ferme la porte derrière soi : s'il n'y
     a qu'un administrateur, plus personne ne peut la rouvrir depuis
     l'application. */
  if (moi.id === userId && role === "user") {
    return { ok: false, message: "Vous ne pouvez pas retirer votre propre rôle d’administrateur." };
  }
  await setUserRole(userId, role);
  revalidatePath("/admin/utilisateurs");
  return { ok: true, message: role === "admin" ? "Rôle accordé." : "Rôle retiré." };
}

export async function renameUserAction(userId: string, formData: FormData): Promise<Resultat> {
  await requireAdmin();
  await setUserName(
    userId,
    String(formData.get("first_name") ?? "").trim(),
    String(formData.get("last_name") ?? "").trim(),
  );
  revalidatePath("/admin/utilisateurs");
  return { ok: true, message: "Profil modifié." };
}

export async function revokeUserAction(userId: string): Promise<Resultat> {
  await requireAdmin();
  const compte = await unpublishAllFor(userId);
  revalidatePath("/admin/utilisateurs");
  return {
    ok: true,
    message:
      compte === 0
        ? "Aucune invitation en ligne à retirer."
        : `${compte} invitation${compte > 1 ? "s" : ""} retirée${compte > 1 ? "s" : ""} du public.`,
  };
}

export async function listPlansAction() {
  await requireAdmin();
  return listPlans();
}
