import "server-only";
import { isSupabaseConfigured } from "@/lib/config";
import { createServerSupabase } from "@/lib/supabase/server";
import { createPrivilegedSupabase } from "@/lib/supabase/admin";
import type {
  AdminUser,
  Payment,
  PaymentProviderId,
  PaymentProviderSettings,
  Plan,
  UserRole,
  UserStatus,
} from "@/types/admin";

/* ═══════════════════════════════════════════════════════════════
   SERVICES D'ADMINISTRATION
   Chaque fonction a deux corps : Supabase, et le magasin en memoire.
   Aucune ne verifie le role — c'est `requireAdmin()` qui garde la
   porte, une fois, a l'entree de /admin.
   ═══════════════════════════════════════════════════════════════ */

/* ── Les reglages des fournisseurs ─────────────────────────────── */

export async function listSettings(): Promise<PaymentProviderSettings[]> {
  if (isSupabaseConfigured) {
    /* Client de service : la table est réservée aux administrateurs,
       or c'est un client ordinaire qui a besoin de savoir quels
       moyens de paiement existent au moment de publier. Rien de ce
       qui est lu ici ne redescend au navigateur : seuls les
       identifiants de fournisseur en ressortent. */
    const supabase = await createPrivilegedSupabase();
    const { data } = await supabase.from("payment_settings").select("*");
    return (data ?? []) as PaymentProviderSettings[];
  }
  const { dbAdmin } = await import("@/lib/demo/store");
  return dbAdmin.reglages;
}

export async function getSettings(
  provider: PaymentProviderId,
): Promise<PaymentProviderSettings | null> {
  const tout = await listSettings();
  return tout.find((r) => r.provider === provider) ?? null;
}

export async function saveSettings(
  provider: PaymentProviderId,
  champs: Partial<Omit<PaymentProviderSettings, "provider" | "updated_at">>,
): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = await createServerSupabase();
    await supabase
      .from("payment_settings")
      .update({ ...champs, updated_at: new Date().toISOString() })
      .eq("provider", provider);
    return;
  }
  const { dbAdmin } = await import("@/lib/demo/store");
  const ligne = dbAdmin.reglages.find((r) => r.provider === provider);
  if (ligne) Object.assign(ligne, champs, { updated_at: new Date().toISOString() });
}

/* ── Les tarifs ────────────────────────────────────────────────── */

export async function listPlans(seulementActifs = false): Promise<Plan[]> {
  if (isSupabaseConfigured) {
    const supabase = await createServerSupabase();
    let requete = supabase.from("plans").select("*").order("sort_order");
    if (seulementActifs) requete = requete.eq("active", true);
    const { data } = await requete;
    return (data ?? []) as Plan[];
  }
  const { dbAdmin } = await import("@/lib/demo/store");
  const tout = [...dbAdmin.plans].sort((a, b) => a.sort_order - b.sort_order);
  return seulementActifs ? tout.filter((p) => p.active) : tout;
}

export async function savePlan(
  id: string,
  champs: Partial<Pick<Plan, "name" | "description" | "amount" | "currency" | "active" | "chariow_product_id">>,
): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = await createServerSupabase();
    await supabase
      .from("plans")
      .update({ ...champs, updated_at: new Date().toISOString() })
      .eq("id", id);
    return;
  }
  const { dbAdmin } = await import("@/lib/demo/store");
  const plan = dbAdmin.plans.find((p) => p.id === id);
  if (plan) Object.assign(plan, champs, { updated_at: new Date().toISOString() });
}

/* ── Les utilisateurs ──────────────────────────────────────────── */

export async function listUsers(): Promise<AdminUser[]> {
  if (isSupabaseConfigured) {
    const supabase = await createServerSupabase();
    const { data: profils } = await supabase
      .from("profiles")
      .select("user_id, first_name, last_name, role, status, created_at, last_seen_at")
      .order("created_at", { ascending: false });

    /* Une seule requete pour tous les comptes : compter invitation par
       invitation ferait une requete par ligne du tableau. */
    const { data: invitations } = await supabase
      .from("invitations")
      .select("user_id, status");

    const parUtilisateur = new Map<string, { total: number; publiees: number }>();
    for (const inv of invitations ?? []) {
      const entree = parUtilisateur.get(inv.user_id) ?? { total: 0, publiees: 0 };
      entree.total += 1;
      if (inv.status === "published") entree.publiees += 1;
      parUtilisateur.set(inv.user_id, entree);
    }

    return (profils ?? []).map((p) => {
      const compte = parUtilisateur.get(p.user_id) ?? { total: 0, publiees: 0 };
      return {
        id: p.user_id,
        /* L'adresse vit dans `auth.users`, hors de portee du client
           anonyme. Sans clef de service, on affiche ce qu'on a. */
        email: "",
        firstName: p.first_name,
        lastName: p.last_name,
        role: (p.role ?? "user") as UserRole,
        status: (p.status ?? "active") as UserStatus,
        invitations: compte.total,
        published: compte.publiees,
        createdAt: p.created_at,
        lastSeenAt: p.last_seen_at ?? null,
      };
    });
  }

  const { db, dbAdmin } = await import("@/lib/demo/store");
  return db.users.map((u) => {
    const profil = db.profiles.find((p) => p.user_id === u.id);
    const siennes = db.invitations.filter((i) => i.user_id === u.id);
    return {
      id: u.id,
      email: u.email,
      firstName: profil?.first_name ?? null,
      lastName: profil?.last_name ?? null,
      role: dbAdmin.roles[u.id] ?? "user",
      status: dbAdmin.statuts[u.id] ?? "active",
      invitations: siennes.length,
      published: siennes.filter((i) => i.status === "published").length,
      createdAt: profil?.created_at ?? new Date().toISOString(),
      lastSeenAt: null,
    };
  });
}

export async function setUserStatus(userId: string, statut: UserStatus, motif?: string) {
  if (isSupabaseConfigured) {
    const supabase = await createServerSupabase();
    await supabase
      .from("profiles")
      .update({
        status: statut,
        blocked_at: statut === "blocked" ? new Date().toISOString() : null,
        blocked_reason: statut === "blocked" ? (motif ?? null) : null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
    return;
  }
  const { dbAdmin } = await import("@/lib/demo/store");
  dbAdmin.statuts[userId] = statut;
}

export async function setUserRole(userId: string, role: UserRole) {
  if (isSupabaseConfigured) {
    const supabase = await createServerSupabase();
    await supabase
      .from("profiles")
      .update({ role, updated_at: new Date().toISOString() })
      .eq("user_id", userId);
    return;
  }
  const { dbAdmin } = await import("@/lib/demo/store");
  dbAdmin.roles[userId] = role;
}

export async function setUserName(userId: string, prenom: string, nom: string) {
  if (isSupabaseConfigured) {
    const supabase = await createServerSupabase();
    await supabase
      .from("profiles")
      .update({ first_name: prenom || null, last_name: nom || null, updated_at: new Date().toISOString() })
      .eq("user_id", userId);
    return;
  }
  const { db } = await import("@/lib/demo/store");
  const profil = db.profiles.find((p) => p.user_id === userId);
  if (profil) {
    profil.first_name = prenom || null;
    profil.last_name = nom || null;
  }
}

/** Retire toutes les invitations du public sans toucher au compte.
 *  C'est la mesure intermediaire entre l'avertissement et le blocage. */
export async function unpublishAllFor(userId: string): Promise<number> {
  if (isSupabaseConfigured) {
    const supabase = await createServerSupabase();
    const { data } = await supabase
      .from("invitations")
      .update({ status: "unpublished", updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("status", "published")
      .select("id");
    return data?.length ?? 0;
  }
  const { db } = await import("@/lib/demo/store");
  let compte = 0;
  for (const inv of db.invitations) {
    if (inv.user_id === userId && inv.status === "published") {
      inv.status = "unpublished";
      compte += 1;
    }
  }
  return compte;
}

/* ── Les paiements ─────────────────────────────────────────────── */

export async function listPayments(limite = 50): Promise<Payment[]> {
  if (isSupabaseConfigured) {
    const supabase = await createServerSupabase();
    const { data } = await supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limite);
    return (data ?? []) as Payment[];
  }
  const { dbAdmin } = await import("@/lib/demo/store");
  return [...dbAdmin.paiements]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, limite);
}

export async function recordPayment(paiement: Payment): Promise<void> {
  if (isSupabaseConfigured) {
    /* `payments` n'est inscriptible que par un administrateur : sans
       le client de service, la ligne n'était jamais créée et le
       webhook n'avait plus rien à quoi rattacher le paiement. */
    const supabase = await createPrivilegedSupabase();
    await supabase.from("payments").insert(paiement);
    return;
  }
  const { dbAdmin } = await import("@/lib/demo/store");
  dbAdmin.paiements.unshift(paiement);
}

/** Les paiements encore en attente pour une invitation donnee. Sert a
 *  la verification au retour : on ne verifie que ce qui pend. */
export async function paiementsEnAttente(
  invitationId: string,
  userId: string,
): Promise<Payment[]> {
  if (isSupabaseConfigured) {
    const supabase = await createPrivilegedSupabase();
    const { data } = await supabase
      .from("payments")
      .select("*")
      /* Le filtre sur `user_id` reste la, meme avec la cle de service :
         c'est lui qui cloisonne, pas RLS. */
      .eq("user_id", userId)
      .eq("invitation_id", invitationId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(5);
    return (data ?? []) as Payment[];
  }
  const { dbAdmin } = await import("@/lib/demo/store");
  return dbAdmin.paiements.filter(
    (p) => p.user_id === userId && p.invitation_id === invitationId && p.status === "pending",
  );
}

/** Marque une ligne de paiement encaissee, sans toucher a l'invitation
 *  — c'est `encaisserEtPublier` qui s'en charge, une seule fois. */
export async function marquerPaiementPaye(id: string): Promise<void> {
  const maintenant = new Date().toISOString();
  if (isSupabaseConfigured) {
    const supabase = await createPrivilegedSupabase();
    await supabase
      .from("payments")
      .update({ status: "success", paid_at: maintenant, updated_at: maintenant })
      .eq("id", id);
    return;
  }
  const { dbAdmin } = await import("@/lib/demo/store");
  const ligne = dbAdmin.paiements.find((p) => p.id === id);
  if (ligne) Object.assign(ligne, { status: "success", paid_at: maintenant, updated_at: maintenant });
}

/** Applique un evenement de webhook. Renvoie false si l'evenement a
 *  deja ete traite — un meme webhook peut arriver cinq fois. */
export async function applyPaymentEvent(
  provider: PaymentProviderId,
  reference: string,
  statut: Payment["status"],
  evenementId: string,
): Promise<boolean> {
  if (isSupabaseConfigured) {
    /* Appelé depuis un webhook : aucune session, donc aucun droit
       sans le client de service. */
    const supabase = await createPrivilegedSupabase();
    const { data: existant } = await supabase
      .from("payments")
      .select("id, last_event_id")
      .eq("provider", provider)
      .eq("provider_reference", reference)
      .maybeSingle();
    if (!existant) return false;
    if (existant.last_event_id === evenementId) return false;

    await supabase
      .from("payments")
      .update({
        status: statut,
        last_event_id: evenementId,
        paid_at: statut === "success" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existant.id);

    if (statut === "success") await encaisser(existant.id);
    return true;
  }

  const { dbAdmin } = await import("@/lib/demo/store");
  const ligne = dbAdmin.paiements.find(
    (p) => p.provider === provider && p.provider_reference === reference,
  );
  if (!ligne || ligne.last_event_id === evenementId) return false;
  ligne.status = statut;
  ligne.last_event_id = evenementId;
  ligne.paid_at = statut === "success" ? new Date().toISOString() : null;
  ligne.updated_at = new Date().toISOString();

  if (statut === "success" && ligne.invitation_id) {
    const { encaisserEtPublier } = await import("@/lib/services/paiements");
    await encaisserEtPublier(ligne.invitation_id);
  }
  return true;
}

/** Retrouve l'invitation rattachée au paiement, puis l'encaisse et la
 *  publie. Un paiement sans invitation (achat hors parcours) ne fait
 *  rien de plus que passer en « success ». */
async function encaisser(paymentId: string): Promise<void> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("payments")
    .select("invitation_id")
    .eq("id", paymentId)
    .maybeSingle();
  if (!data?.invitation_id) return;
  const { encaisserEtPublier } = await import("@/lib/services/paiements");
  await encaisserEtPublier(data.invitation_id);
}
