import "server-only";
import { isSupabaseConfigured } from "@/lib/config";
import { createServerSupabase } from "@/lib/supabase/server";
import { buildBirthdaySlug, buildCoupleSlug, resolveSlugCollision } from "@/lib/utils/slug";
import { DEFAULT_TEMPLATE_ID } from "@/templates/registry";
import type {
  AlbumEntry,
  HistoryAction,
  Invitation,
  InvitationProduct,
  InvitationWithPhotos,
  WeddingType,
} from "@/types/database";

/** Une ligne sans `product` precede la migration 003. On ne la
 *  suppose pas mariage pour autant : si elle porte un prenom de
 *  celebrant, c'est un anniversaire, et son lien public doit pointer
 *  vers /anniversaire. Sans ce repli, une invitation creee avant la
 *  migration se retrouvait annoncee sur /mariage/<slug>, ou elle
 *  n'existe pas — d'ou la page « invitation introuvable ». */
export function productOfInvitation(
  invitation: Pick<Invitation, "product"> & Partial<Pick<Invitation, "celebrant_name">>,
): InvitationProduct {
  if (invitation.product) return invitation.product;
  return invitation.celebrant_name?.trim() ? "anniversaire" : "mariage";
}

export interface InvitationDraft {
  product?: InvitationProduct;
  /** Uniquement pour un mariage. */
  type?: WeddingType | null;
  template_id?: string;
  title?: string | null;
  groom_name?: string | null;
  bride_name?: string | null;
  celebrant_name?: string | null;
  celebrant_age?: number | null;
  album?: AlbumEntry[] | null;
  wedding_date?: string | null;
  wedding_time?: string | null;
  venue?: string | null;
  address?: string | null;
  description?: string | null;
  story?: string | null;
  music_url?: string | null;
  music_title?: string | null;
  cover_image_url?: string | null;
  bride_family?: string | null;
  groom_family?: string | null;
  bride_photo_url?: string | null;
  groom_photo_url?: string | null;
  events?: import("@/types/database").WeddingEvent[] | null;
}

const SELECT = "*, photos:invitation_photos(*)";

/** PostgREST renvoie 42703 quand une colonne n'existe pas. C'est le
 *  symptome exact d'une migration non jouee : autant le dire. */
export class MigrationManquante extends Error {}

function missingColumnError(error: { code?: string; message?: string }): Error | null {
  const looksMissing =
    error?.code === "42703" || /column .* does not exist/i.test(error?.message ?? "");
  if (!looksMissing) return null;
  return new MigrationManquante(
    "La base n'a pas la colonne attendue. Jouez supabase/migration-003-anniversaire.sql dans le SQL Editor, puis reessayez.",
  );
}
const iso = () => new Date().toISOString();

function sortPhotos<T extends InvitationWithPhotos>(invitation: T): T {
  invitation.photos = [...(invitation.photos ?? [])].sort((a, b) => a.position - b.position);
  return invitation;
}

/* ── Lecture ────────────────────────────────────────────────── */

export async function listInvitations(
  userId: string,
  product?: InvitationProduct,
): Promise<InvitationWithPhotos[]> {
  const keep = (rows: InvitationWithPhotos[]) =>
    product ? rows.filter((row) => productOfInvitation(row) === product) : rows;

  if (isSupabaseConfigured) {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("invitations")
      .select(SELECT)
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return keep((data as InvitationWithPhotos[]).map(sortPhotos));
  }

  const { db } = await import("@/lib/demo/store");
  return keep(
    db.invitations
      .filter((i) => i.user_id === userId)
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
      .map((i) => sortPhotos({ ...i, photos: db.photos.filter((p) => p.invitation_id === i.id) })),
  );
}

export async function getInvitation(
  id: string,
  userId: string,
  /* Le webhook n'a pas de session : sans le client de service il lit
     `null` et l'invitation payée n'est jamais publiée. Le filtre sur
     `user_id` reste en place — c'est lui qui fait le cloisonnement,
     pas RLS. */
  privilegie = false,
): Promise<InvitationWithPhotos | null> {
  if (isSupabaseConfigured) {
    const supabase = privilegie
      ? await (await import("@/lib/supabase/admin")).createPrivilegedSupabase()
      : await createServerSupabase();
    const { data } = await supabase
      .from("invitations")
      .select(SELECT)
      .eq("id", id)
      .eq("user_id", userId)
      .maybeSingle();
    return data ? sortPhotos(data as InvitationWithPhotos) : null;
  }

  const { db } = await import("@/lib/demo/store");
  const found = db.invitations.find((i) => i.id === id && i.user_id === userId);
  if (!found) return null;
  return sortPhotos({ ...found, photos: db.photos.filter((p) => p.invitation_id === id) });
}

/** Page publique : aucune authentification, statut publié uniquement.
 *  Le produit est vérifié ici : /mariage/x ne doit jamais afficher un
 *  anniversaire, et inversement. */
export async function getPublishedInvitation(
  slug: string,
  product?: InvitationProduct,
): Promise<InvitationWithPhotos | null> {
  /* Trois conditions pour qu'un lien réponde : la bonne nature, le
     statut publié, et une échéance non dépassée. La vérification vit
     ici plutôt que dans chaque page — l'image de partage et les deux
     routes publiques passent toutes par cette fonction. */
  const keep = (row: InvitationWithPhotos | null) => {
    if (!row) return null;
    if (product && productOfInvitation(row) !== product) return null;
    if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) return null;
    return row;
  };

  if (isSupabaseConfigured) {
    const supabase = await createServerSupabase();
    const { data } = await supabase
      .from("invitations")
      .select(SELECT)
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    return keep(data ? sortPhotos(data as InvitationWithPhotos) : null);
  }

  const { db } = await import("@/lib/demo/store");
  const found = db.invitations.find((i) => i.slug === slug && i.status === "published");
  if (!found) return null;
  return keep(sortPhotos({ ...found, photos: db.photos.filter((p) => p.invitation_id === found.id) }));
}

/** Tous les slugs déjà pris — publiés ou non. La colonne est unique
 *  en base : ne compter que les publiés provoquait des collisions. */
export async function listAllSlugs(): Promise<string[]> {
  if (isSupabaseConfigured) {
    const supabase = await createServerSupabase();
    const { data } = await supabase.from("invitations").select("slug").not("slug", "is", null);
    return (data ?? []).map((row) => row.slug).filter((s): s is string => Boolean(s));
  }
  const { db } = await import("@/lib/demo/store");
  return db.invitations.filter((i) => i.slug).map((i) => i.slug!);
}

/* ── Écriture ───────────────────────────────────────────────── */

export async function createInvitation(
  userId: string,
  draft: InvitationDraft,
): Promise<Invitation> {
  const product = draft.product ?? "mariage";
  const title =
    draft.title ??
    (product === "anniversaire"
      ? `${draft.celebrant_name ?? "Invitation"} — ${draft.celebrant_age ?? "?"} ans`
      : `${draft.bride_name} & ${draft.groom_name}`);

  const payload = {
    user_id: userId,
    template_id: draft.template_id ?? DEFAULT_TEMPLATE_ID,
    title,
    status: "draft" as const,
    ...draft,
    product,
  };

  if (isSupabaseConfigured) {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase.from("invitations").insert(payload).select().single();
    if (error) throw missingColumnError(error) ?? error;
    await recordHistory(userId, data.id, "invitation.created", { title: data.title });
    return data as Invitation;
  }

  const { db, uid, pushHistory } = await import("@/lib/demo/store");
  const invitation: Invitation = {
    id: uid("inv"),
    type: null,
    groom_name: null,
    bride_name: null,
    celebrant_name: null,
    celebrant_age: null,
    album: [],
    bride_family: null,
    groom_family: null,
    bride_photo_url: null,
    groom_photo_url: null,
    events: null,
    program: null,
    slug: null,
    wedding_date: null,
    wedding_time: null,
    venue: null,
    address: null,
    description: null,
    story: null,
    music_url: null,
    music_title: null,
    cover_image_url: null,
    published_at: null,
    created_at: iso(),
    updated_at: iso(),
    ...payload,
  } as Invitation;
  db.invitations.unshift(invitation);
  pushHistory(userId, invitation.id, "invitation.created", { title: invitation.title });
  return invitation;
}

export async function updateInvitation(
  id: string,
  userId: string,
  patch: Partial<Invitation>,
): Promise<Invitation> {
  const changed = Object.keys(patch);

  if (isSupabaseConfigured) {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("invitations")
      .update({ ...patch, updated_at: iso() })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();
    if (error) throw error;
    await recordHistory(userId, id, "invitation.updated", { fields: changed });
    return data as Invitation;
  }

  const { db, pushHistory } = await import("@/lib/demo/store");
  const index = db.invitations.findIndex((i) => i.id === id && i.user_id === userId);
  if (index === -1) throw new Error("Invitation introuvable");
  db.invitations[index] = { ...db.invitations[index], ...patch, updated_at: iso() };
  pushHistory(userId, id, "invitation.updated", { fields: changed });
  return db.invitations[index];
}

export async function deleteInvitation(id: string, userId: string): Promise<void> {
  const existing = await getInvitation(id, userId);

  if (isSupabaseConfigured) {
    const supabase = await createServerSupabase();
    const { error } = await supabase.from("invitations").delete().eq("id", id).eq("user_id", userId);
    if (error) throw error;
  } else {
    const { db } = await import("@/lib/demo/store");
    db.invitations = db.invitations.filter((i) => !(i.id === id && i.user_id === userId));
    db.photos = db.photos.filter((p) => p.invitation_id !== id);
  }

  await recordHistory(userId, null, "invitation.deleted", { title: existing?.title ?? null });
}

export async function duplicateInvitation(id: string, userId: string): Promise<Invitation> {
  const source = await getInvitation(id, userId);
  if (!source) throw new Error("Invitation introuvable");

  const copy = await createInvitation(userId, {
    product: productOfInvitation(source),
    type: source.type,
    celebrant_name: source.celebrant_name,
    celebrant_age: source.celebrant_age,
    album: source.album,
    template_id: source.template_id,
    title: `${source.title ?? "Invitation"} — copie`,
    groom_name: source.groom_name,
    bride_name: source.bride_name,
    wedding_date: source.wedding_date,
    wedding_time: source.wedding_time,
    venue: source.venue,
    address: source.address,
    description: source.description,
    story: source.story,
    music_url: source.music_url,
    music_title: source.music_title,
    cover_image_url: source.cover_image_url,
  });

  if (source.photos.length) {
    await replacePhotos(copy.id, userId, source.photos.map((p) => p.url));
  }

  await recordHistory(userId, copy.id, "invitation.duplicated", { from: source.title });
  return copy;
}

/* ── Publication ────────────────────────────────────────────── */

export async function publishInvitation(id: string, userId: string): Promise<Invitation> {
  const invitation = await getInvitation(id, userId);
  if (!invitation) throw new Error("Invitation introuvable");

  /* Le péage. Une invitation déjà payée reste publiable à volonté :
     dépublier pour corriger une faute puis republier ne repasse pas
     à la caisse. Les invitations antérieures à la mise en place du
     paiement portent un `paid_at` de reprise, donc elles passent. */
  const { estPayee } = await import("./paiements");
  if (!estPayee(invitation)) {
    throw new Error("Cette invitation doit être payée avant d’être publiée.");
  }

  return publierMaintenant(id, userId, invitation);
}

/** La publication elle-même, sans contrôle de paiement. Réservée à
 *  `publishInvitation` (qui vient de le vérifier) et au webhook (qui
 *  vient d'encaisser). N'appelez jamais ceci depuis une action. */
async function publierMaintenant(
  id: string,
  userId: string,
  invitation: InvitationWithPhotos,
): Promise<Invitation> {
  /* Un slug déjà attribué est conservé : republier ne doit pas
     casser un lien déjà partagé aux invités. */
  const base =
    productOfInvitation(invitation) === "anniversaire"
      ? buildBirthdaySlug(invitation.celebrant_name ?? "", invitation.celebrant_age)
      : buildCoupleSlug(invitation.bride_name ?? "", invitation.groom_name ?? "");

  const slug = invitation.slug || resolveSlugCollision(base, await listAllSlugs());

  /* « Jusqu'à la fin du compte à rebours » : l'échéance est figée à la
     publication, pas recalculée à chaque lecture. Une invitation dont
     on repousse la date après coup verrait sinon son échéance bouger
     sous les pieds des invités. */
  const { calculerEcheance } = await import("./paiements");
  const updated = await applyStatus(id, userId, {
    slug,
    status: "published",
    published_at: iso(),
    expires_at: invitation.expires_at ?? calculerEcheance(invitation),
  });
  await recordHistory(userId, id, "invitation.published", { slug });
  return updated;
}

/** Publie après encaissement, sans repasser par le contrôle : le
 *  webhook n'a pas de session utilisateur, il ne peut pas appeler
 *  `publishInvitation`. Le paiement vient d'être confirmé par une
 *  signature vérifiée, ce qui vaut autorisation. */
export async function publishInvitationInterne(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    /* Chemin du webhook : pas de session, donc client de service. */
    const { createPrivilegedSupabase } = await import("@/lib/supabase/admin");
    const supabase = await createPrivilegedSupabase();
    const { data } = await supabase
      .from("invitations")
      .select("user_id, status")
      .eq("id", id)
      .maybeSingle();
    if (!data) return;
    /* L'auteur a pu retirer son invitation entre-temps : un webhook
       rejoué ne doit pas la remettre en ligne dans son dos. */
    if (data.status === "unpublished") return;
    const invitation = await getInvitation(id, data.user_id, true);
    if (invitation) await publierMaintenant(id, data.user_id, invitation);
    return;
  }

  const { db } = await import("@/lib/demo/store");
  const ligne = db.invitations.find((i) => i.id === id);
  if (!ligne || ligne.status === "unpublished") return;
  const invitation = await getInvitation(id, ligne.user_id);
  if (invitation) await publierMaintenant(id, ligne.user_id, invitation);
}

export async function unpublishInvitation(id: string, userId: string): Promise<Invitation> {
  const updated = await applyStatus(id, userId, { status: "unpublished" });
  await recordHistory(userId, id, "invitation.unpublished", {});
  return updated;
}

async function applyStatus(id: string, userId: string, patch: Partial<Invitation>) {
  if (isSupabaseConfigured) {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("invitations")
      .update({ ...patch, updated_at: iso() })
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();
    if (error) throw error;
    return data as Invitation;
  }

  const { db } = await import("@/lib/demo/store");
  const index = db.invitations.findIndex((i) => i.id === id && i.user_id === userId);
  if (index === -1) throw new Error("Invitation introuvable");
  db.invitations[index] = { ...db.invitations[index], ...patch, updated_at: iso() };
  return db.invitations[index];
}

/** Vérifie qu’un slug choisi manuellement reste disponible. */
export async function isSlugAvailable(slug: string, exceptId?: string): Promise<boolean> {
  if (isSupabaseConfigured) {
    const supabase = await createServerSupabase();
    const { data } = await supabase.from("invitations").select("id").eq("slug", slug);
    return (data ?? []).every((row) => row.id === exceptId);
  }
  const { db } = await import("@/lib/demo/store");
  return db.invitations.every((i) => i.slug !== slug || i.id === exceptId);
}

/* ── Photos ─────────────────────────────────────────────────── */

export async function replacePhotos(
  invitationId: string,
  userId: string,
  urls: string[],
): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = await createServerSupabase();
    await supabase.from("invitation_photos").delete().eq("invitation_id", invitationId);
    if (urls.length) {
      await supabase
        .from("invitation_photos")
        .insert(urls.map((url, position) => ({ invitation_id: invitationId, url, position })));
    }
    return;
  }

  const { db, uid } = await import("@/lib/demo/store");
  db.photos = db.photos.filter((p) => p.invitation_id !== invitationId);
  urls.forEach((url, position) => {
    db.photos.push({
      id: uid("photo"),
      invitation_id: invitationId,
      url,
      caption: null,
      position,
      created_at: iso(),
    });
  });
}

/* ── Historique ─────────────────────────────────────────────── */

export async function recordHistory(
  userId: string,
  invitationId: string | null,
  action: HistoryAction,
  metadata: Record<string, unknown>,
): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = await createServerSupabase();
    await supabase
      .from("invitation_history")
      .insert({ user_id: userId, invitation_id: invitationId, action, metadata });
    return;
  }
  const { pushHistory } = await import("@/lib/demo/store");
  pushHistory(userId, invitationId, action, metadata);
}
