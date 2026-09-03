/** Types miroir du schema Supabase (voir supabase/schema.sql). */

export type WeddingType = "chretien" | "musulman";
/** Les deux produits de Zevent. Une invitation appartient a l'un ou a l'autre. */
export type InvitationProduct = "mariage" | "anniversaire";
export type InvitationStatus = "draft" | "published" | "unpublished";

export type HistoryAction =
  | "invitation.created"
  | "invitation.updated"
  | "invitation.published"
  | "invitation.unpublished"
  | "invitation.duplicated"
  | "invitation.deleted";

export interface Profile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  locale: string;
  created_at: string;
  updated_at: string;
}

/** Les trois moments d’un mariage. L’ordre d’affichage n’est pas
 *  celui-ci : il est calculé à partir des dates et heures saisies,
 *  le civil pouvant tomber avant ou après le religieux. */
export type EventKind = "coutumier" | "civil" | "religieux" | "walima";

export interface WeddingEvent {
  kind: EventKind;
  date: string;
  time: string;
  venue: string;
  address?: string | null;
}

/** Une ligne du programme de la journée. */
export interface ProgramEntry {
  time: string;
  title: string;
  note?: string;
}

/** Une année de l’album : une photo, un âge, un millésime.
 *  L’album est la seule section que le mariage n’a pas — c’est le
 *  temps qui passe, et c’est le sujet même d’un anniversaire. */
export interface AlbumEntry {
  year: number;
  age: number;
  url?: string | null;
  caption?: string | null;
}

export interface Invitation {
  id: string;
  user_id: string;
  /** Absent sur les lignes anterieures a la migration 003 : elles sont des mariages. */
  product?: InvitationProduct;
  /** La confession n'existe que pour un mariage. */
  type: WeddingType | null;
  template_id: string;
  slug: string | null;
  title: string | null;
  groom_name: string | null;
  bride_name: string | null;
  wedding_date: string | null;
  wedding_time: string | null;
  venue: string | null;
  address: string | null;
  description: string | null;
  story: string | null;
  music_url: string | null;
  music_title: string | null;
  cover_image_url: string | null;
  bride_family: string | null;
  groom_family: string | null;
  bride_photo_url: string | null;
  groom_photo_url: string | null;
  events: WeddingEvent[] | null;
  program: ProgramEntry[] | null;
  /* ── Anniversaire ────────────────────────────────────────────
     Optionnels tant que la table reste mariage-native : les
     sections de la fête retombent sur les champs existants. */
  celebrant_name?: string | null;
  celebrant_age?: number | null;
  album?: AlbumEntry[] | null;
  status: InvitationStatus;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  /* Payée une fois, l'invitation le reste : le paiement s'attache à
     elle, pas à l'acte de publier. */
  paid_at: string | null;
  plan_code: string | null;
  /* Fin du compte à rebours : passé cette date le lien public cesse
     de répondre. */
  expires_at: string | null;
}

export interface InvitationPhoto {
  id: string;
  invitation_id: string;
  url: string;
  caption: string | null;
  position: number;
  created_at: string;
}

export interface InvitationHistoryEntry {
  id: string;
  invitation_id: string | null;
  user_id: string;
  action: HistoryAction;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

/** Invitation + relations, forme consommée par l’UI. */
export interface InvitationWithPhotos extends Invitation {
  photos: InvitationPhoto[];
}

export interface SessionUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
}
