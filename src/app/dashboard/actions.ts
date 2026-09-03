"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/services/session";
import {
  MigrationManquante,
  createInvitation,
  deleteInvitation,
  duplicateInvitation,
  isSlugAvailable,
  publishInvitation,
  replacePhotos,
  unpublishInvitation,
  updateInvitation,
  type InvitationDraft,
} from "@/lib/services/invitations";
import { updateProfile } from "@/lib/services/profiles";
import {
  emailSchema,
  invitationInfoSchema,
  ceremonyInfoSchema,
  passwordSchema,
  profileSchema,
  slugSchema,
  weddingTypeSchema,
  birthdayInfoSchema,
  albumSchema,
  programSchema,
} from "@/lib/validation/schemas";
import { isSupabaseConfigured } from "@/lib/config";
import { createServerSupabase } from "@/lib/supabase/server";
import { templateExists, DEFAULT_TEMPLATE_ID } from "@/templates/registry";
import type { Invitation } from "@/types/database";
import { ceremonyValuesToDraft } from "@/lib/utils/ceremonies";
import { birthdayValuesToDraft } from "@/lib/utils/birthday";

export interface Result<T = undefined> {
  ok: boolean;
  message?: string;
  data?: T;
  /* Un code lisible par le code appelant. « La publication a échoué »
     ne dit pas s'il faut réessayer, corriger le lien, ou passer à la
     caisse — et l'écran ne pouvait donc que montrer une erreur là où
     il fallait ouvrir le paiement. */
  code?: "paiement_requis" | "lien_pris";
}

/* Le slug est unique tous produits confondus : on revalide les deux
   routes plutot que de deviner laquelle porte l'invitation. */
function refresh(slug?: string | null) {
  revalidatePath("/dashboard", "layout");
  if (slug) {
    revalidatePath(`/mariage/${slug}`);
    revalidatePath(`/anniversaire/${slug}`);
  }
}

/* ── Création ───────────────────────────────────────────────── */

export async function createInvitationAction(input: {
  product?: string;
  type?: string;
  template_id: string;
  info: unknown;
}): Promise<Result<{ id: string }>> {
  const user = await requireUser();

  const product = input.product === "anniversaire" ? "anniversaire" : "mariage";
  const template_id = templateExists(input.template_id) ? input.template_id : DEFAULT_TEMPLATE_ID;
  let draft: InvitationDraft;

  if (product === "anniversaire") {
    const info = birthdayInfoSchema.safeParse(input.info);
    if (!info.success) return { ok: false, message: "Certaines informations sont incomplètes." };
    draft = { product, template_id, ...birthdayValuesToDraft(info.data) };
  } else {
    const type = weddingTypeSchema.safeParse(input.type);
    if (!type.success) return { ok: false, message: "Choisissez un type de cérémonie." };

    /* Les deux religions passent par le même formulaire ; seules les
       cérémonies proposées diffèrent. */
    const info = ceremonyInfoSchema.safeParse(input.info);
    if (!info.success) return { ok: false, message: "Certaines informations sont incomplètes." };
    draft = { product, type: type.data, template_id, ...ceremonyValuesToDraft(info.data) };
  }

  try {
    const invitation = await createInvitation(user.id, draft);
    refresh();
    return { ok: true, data: { id: invitation.id } };
  } catch (error) {
    /* Une migration oubliee produisait un « Réessayez » qui ne menait
       nulle part : on nomme la cause. */
    if (error instanceof MigrationManquante) return { ok: false, message: error.message };
    return { ok: false, message: "L’invitation n’a pas pu être créée. Réessayez." };
  }
}

/** L’album est saisi ligne par ligne : on le valide à part, pour ne
 *  pas laisser passer une année incomplète dans le jsonb. */
export async function saveAlbumAction(id: string, entries: unknown): Promise<Result> {
  const user = await requireUser();
  const parsed = albumSchema.safeParse(entries);
  if (!parsed.success) return { ok: false, message: "Vérifiez les années saisies." };

  try {
    const updated = await updateInvitation(id, user.id, {
      album: parsed.data.map((entry) => ({
        year: entry.year,
        age: entry.age,
        url: entry.url || null,
        caption: entry.caption || null,
      })),
    });
    refresh(updated.slug);
    return { ok: true };
  } catch {
    return { ok: false, message: "L’album n’a pas pu être enregistré." };
  }
}

/** Le programme est saisi ligne par ligne : on le valide à part,
 *  comme l'album, pour ne rien laisser passer d'incomplet dans le
 *  jsonb. */
export async function saveProgramAction(id: string, entries: unknown): Promise<Result> {
  const user = await requireUser();
  const parsed = programSchema.safeParse(entries);
  if (!parsed.success) return { ok: false, message: "Vérifiez les moments saisis." };

  try {
    const updated = await updateInvitation(id, user.id, {
      program: parsed.data
        .map((entry) => ({
          time: entry.time,
          title: entry.title.trim(),
          note: entry.note?.trim() || undefined,
        }))
        /* L'ordre d'affichage est l'ordre des heures, jamais celui
           de la saisie. */
        .sort((a, b) => a.time.localeCompare(b.time)),
    });
    refresh(updated.slug);
    return { ok: true };
  } catch {
    return { ok: false, message: "Le programme n’a pas pu être enregistré." };
  }
}

/* ── Mise à jour ────────────────────────────────────────────── */

export async function updateInvitationAction(
  id: string,
  patch: Partial<Invitation>,
): Promise<Result> {
  const user = await requireUser();

  const allowed: (keyof Invitation)[] = [
    "type", "template_id", "title", "groom_name", "bride_name", "wedding_date",
    "wedding_time", "venue", "address", "description", "story", "music_url",
    "music_title", "cover_image_url", "bride_family", "groom_family",
    "bride_photo_url", "groom_photo_url", "events",
    /* ── La fête ── */
    "product", "celebrant_name", "celebrant_age", "album", "program",
  ];
  const safePatch = Object.fromEntries(
    Object.entries(patch).filter(([key]) => allowed.includes(key as keyof Invitation)),
  );

  if (!Object.keys(safePatch).length) return { ok: true };

  try {
    const updated = await updateInvitation(id, user.id, safePatch);
    refresh(updated.slug);
    return { ok: true, message: "Modifications enregistrées." };
  } catch {
    return { ok: false, message: "L’enregistrement a échoué. Réessayez." };
  }
}

export async function savePhotosAction(id: string, urls: string[]): Promise<Result> {
  const user = await requireUser();
  try {
    await replacePhotos(id, user.id, urls.slice(0, 24));
    refresh();
    return { ok: true };
  } catch {
    return { ok: false, message: "Les photos n’ont pas pu être enregistrées." };
  }
}

/* ── Publication ────────────────────────────────────────────── */

export async function publishInvitationAction(id: string): Promise<Result<{ slug: string }>> {
  const user = await requireUser();
  try {
    const invitation = await publishInvitation(id, user.id);
    refresh(invitation.slug);
    return { ok: true, data: { slug: invitation.slug! } };
  } catch (error) {
    console.error("[publish]", error);
    const detail = error instanceof Error ? error.message : "";

    /* Le péage. Ce n'est pas un échec : c'est une étape qui manque.
       L'appelant a de quoi ouvrir la caisse au lieu d'afficher
       « Action impossible ». */
    if (detail.includes("payée")) {
      return {
        ok: false,
        code: "paiement_requis",
        message: "Cette invitation doit être payée avant d’être publiée.",
      };
    }

    if (detail.includes("duplicate") || detail.includes("unique")) {
      return {
        ok: false,
        code: "lien_pris",
        message: "Ce lien est déjà utilisé. Modifiez-le puis republiez.",
      };
    }

    return { ok: false, message: "La publication a échoué. Réessayez dans un instant." };
  }
}

export async function unpublishInvitationAction(id: string): Promise<Result> {
  const user = await requireUser();
  try {
    const invitation = await unpublishInvitation(id, user.id);
    refresh(invitation.slug);
    return { ok: true, message: "Invitation retirée du web." };
  } catch {
    return { ok: false, message: "Le retrait a échoué. Réessayez." };
  }
}

export async function updateSlugAction(id: string, slug: string): Promise<Result<{ slug: string }>> {
  const user = await requireUser();
  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };

  if (!(await isSlugAvailable(parsed.data, id))) {
    return { ok: false, message: "Ce lien est déjà pris. Essayez une autre variante." };
  }

  try {
    await updateInvitation(id, user.id, { slug: parsed.data });
    refresh(parsed.data);
    return { ok: true, data: { slug: parsed.data }, message: "Lien mis à jour." };
  } catch {
    return { ok: false, message: "Le lien n’a pas pu être modifié." };
  }
}

/* ── Duplication et suppression ─────────────────────────────── */

export async function duplicateInvitationAction(id: string): Promise<Result<{ id: string }>> {
  const user = await requireUser();
  try {
    const copy = await duplicateInvitation(id, user.id);
    refresh();
    return { ok: true, data: { id: copy.id }, message: "Copie créée." };
  } catch {
    return { ok: false, message: "La duplication a échoué." };
  }
}

export async function deleteInvitationAction(id: string): Promise<Result> {
  const user = await requireUser();
  try {
    await deleteInvitation(id, user.id);
    refresh();
    return { ok: true, message: "Invitation supprimée." };
  } catch {
    return { ok: false, message: "La suppression a échoué." };
  }
}

/* ── Profil ─────────────────────────────────────────────────── */

export async function updateProfileAction(input: unknown): Promise<Result> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Vérifiez les informations saisies." };

  try {
    await updateProfile(user.id, {
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name || null,
    });
    revalidatePath("/dashboard", "layout");
    return { ok: true, message: "Profil mis à jour." };
  } catch {
    return { ok: false, message: "Le profil n’a pas pu être enregistré." };
  }
}

export async function updateAvatarAction(url: string | null): Promise<Result> {
  const user = await requireUser();
  try {
    await updateProfile(user.id, { avatar_url: url });
    revalidatePath("/dashboard", "layout");
    return { ok: true, message: "Photo de profil mise à jour." };
  } catch {
    return { ok: false, message: "La photo n’a pas pu être enregistrée." };
  }
}

/* ── Compte ─────────────────────────────────────────────────── */

export async function changeEmailAction(email: string): Promise<Result> {
  await requireUser();
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };

  if (!isSupabaseConfigured) {
    const { db } = await import("@/lib/demo/store");
    const { cookies } = await import("next/headers");
    const { DEMO_COOKIE } = await import("@/lib/demo/cookie");
    const id = (await cookies()).get(DEMO_COOKIE)?.value;
    const user = db.users.find((u) => u.id === id);
    if (!user) return { ok: false, message: "Session expirée. Reconnectez-vous." };
    user.email = parsed.data;
    revalidatePath("/dashboard", "layout");
    return { ok: true, message: "Adresse e-mail mise à jour." };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.updateUser({ email: parsed.data });
  if (error) return { ok: false, message: "Cette adresse n’a pas pu être enregistrée." };

  return {
    ok: true,
    message: "Un lien de confirmation vient d’être envoyé à votre nouvelle adresse.",
  };
}

export async function changePasswordAction(password: string): Promise<Result> {
  await requireUser();
  const parsed = passwordSchema.safeParse(password);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };

  if (!isSupabaseConfigured) {
    const { db } = await import("@/lib/demo/store");
    const { cookies } = await import("next/headers");
    const { DEMO_COOKIE } = await import("@/lib/demo/cookie");
    const id = (await cookies()).get(DEMO_COOKIE)?.value;
    const user = db.users.find((u) => u.id === id);
    if (!user) return { ok: false, message: "Session expirée. Reconnectez-vous." };
    user.password = parsed.data;
    return { ok: true, message: "Mot de passe mis à jour." };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.updateUser({ password: parsed.data });
  if (error) return { ok: false, message: "Le mot de passe n’a pas pu être modifié." };
  return { ok: true, message: "Mot de passe mis à jour." };
}

export async function updateLocaleAction(locale: string): Promise<Result> {
  const user = await requireUser();
  const value = locale === "en" ? "en" : "fr";
  try {
    await updateProfile(user.id, { locale: value });
    revalidatePath("/dashboard", "layout");
    return { ok: true, message: "Préférence enregistrée." };
  } catch {
    return { ok: false, message: "La préférence n’a pas pu être enregistrée." };
  }
}

/** Suppression définitive : toutes les données de l’utilisateur
 *  partent avec le compte (cascade côté base). */
export async function deleteAccountAction(): Promise<Result> {
  const user = await requireUser();

  if (!isSupabaseConfigured) {
    const { db } = await import("@/lib/demo/store");
    db.invitations = db.invitations.filter((i) => i.user_id !== user.id);
    db.photos = [];
    db.history = db.history.filter((h) => h.user_id !== user.id);
    db.profiles = db.profiles.filter((p) => p.user_id !== user.id);
    db.users = db.users.filter((u) => u.id !== user.id);
    const { cookies } = await import("next/headers");
    const { DEMO_COOKIE } = await import("@/lib/demo/cookie");
    (await cookies()).delete(DEMO_COOKIE);
    revalidatePath("/", "layout");
    return { ok: true, message: "Compte supprimé." };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc("delete_own_account");
  if (error) return { ok: false, message: "Le compte n’a pas pu être supprimé. Contactez-nous." };

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  return { ok: true, message: "Compte supprimé." };
}
