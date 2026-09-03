import type { EventKind, Invitation, WeddingEvent } from "@/types/database";

/* ═══════════════════════════════════════════════════════════════
   LES CÉRÉMONIES
   Le couple saisit ce qu’il veut, dans l’ordre qu’il veut. C’est
   l’heure qui décide de l’ordre d’affichage : le mariage civil peut
   tomber la veille du religieux comme le lendemain de la walima.
   ═══════════════════════════════════════════════════════════════ */

export const EVENT_LABELS: Record<EventKind, { title: string; hint: string }> = {
  coutumier: { title: "Mariage coutumier", hint: "La dot, chez la famille de la mariée" },
  civil: { title: "Mariage civil", hint: "À la mairie" },
  religieux: { title: "Mariage religieux", hint: "La cérémonie religieuse" },
  walima: { title: "Réception", hint: "La walima" },
};

/**
 * Le vocabulaire dépend de la religion : un chrétien ne se marie pas
 * à la mosquée, un musulman ne se marie pas à la paroisse. Sans cette
 * table, les exemples de saisie étaient absurdes d’un côté ou de l’autre.
 */
export const EVENT_WORDING: Record<
  "chretien" | "musulman",
  Partial<Record<EventKind, { hint: string; venue: string; address: string }>>
> = {
  musulman: {
    religieux: { hint: "Le nikah, à la mosquée", venue: "Mosquée de la Riviera", address: "Riviera 3, Cocody, Abidjan" },
    walima: { hint: "La walima, où vous recevez vos invités", venue: "Palais de la Culture", address: "Treichville, Abidjan" },
    civil: { hint: "À la mairie", venue: "Mairie de Cocody", address: "Boulevard Latrille, Abidjan" },
  },
  chretien: {
    religieux: { hint: "La bénédiction, à l’église ou au temple", venue: "Paroisse Saint-Jean", address: "Cocody, Abidjan" },
    coutumier: { hint: "La dot, chez la famille de la mariée", venue: "Résidence familiale", address: "Yopougon, Abidjan" },
    civil: { hint: "À la mairie", venue: "Mairie de Cocody", address: "Boulevard Latrille, Abidjan" },
  },
};

export function wordingFor(type: "chretien" | "musulman", kind: EventKind) {
  return (
    EVENT_WORDING[type][kind] ?? {
      hint: EVENT_LABELS[kind].hint,
      venue: "",
      address: "",
    }
  );
}

/** Les cérémonies proposées selon le type de mariage. L’ordre ici
 *  est celui du formulaire ; l’affichage, lui, suit les heures. */
export const CEREMONIES_BY_TYPE: Record<"chretien" | "musulman", {
  required: EventKind[];
  optional: EventKind[];
}> = {
  musulman: { required: ["religieux", "walima"], optional: ["civil"] },
  chretien: { required: ["religieux"], optional: ["coutumier", "civil"] },
};

function timestamp(event: WeddingEvent): number {
  const value = Date.parse(`${event.date}T${event.time || "00:00"}:00`);
  return Number.isNaN(value) ? Number.MAX_SAFE_INTEGER : value;
}

/** Les cérémonies renseignées, classées du plus tôt au plus tard. */
export function sortedEvents(invitation: Pick<Invitation, "events">): WeddingEvent[] {
  return [...(invitation.events ?? [])]
    .filter((event) => event.date && event.venue)
    .sort((a, b) => timestamp(a) - timestamp(b));
}

/** La date qui sert de repère : celle de la première cérémonie. */
export function primaryEventDate(events: WeddingEvent[]): string | null {
  return events[0]?.date ?? null;
}

/** Le moment exact visé par le compte à rebours. */
export function countdownTarget(invitation: Pick<Invitation, "events" | "wedding_date" | "wedding_time">): string | null {
  const events = sortedEvents(invitation);
  if (events[0]) return `${events[0].date}T${events[0].time || "00:00"}:00`;
  if (invitation.wedding_date) {
    return `${invitation.wedding_date}T${invitation.wedding_time?.slice(0, 5) || "00:00"}:00`;
  }
  return null;
}

/**
 * Le message des familles, composé à partir des deux noms.
 * Le couple peut le remplacer par son propre texte : `description`
 * l’emporte toujours sur la proposition automatique.
 */
export function familyMessage(
  invitation: Pick<Invitation, "description" | "bride_family" | "groom_family" | "bride_name" | "groom_name">,
): string | null {
  if (invitation.description?.trim()) return invitation.description.trim();

  const bride = invitation.bride_family?.trim();
  const groom = invitation.groom_family?.trim();
  if (!bride && !groom) return null;

  const families =
    bride && groom
      ? `Les familles ${groom} et ${bride}`
      : `La famille ${groom ?? bride}`;

  return `${families} ont l’honneur de vous convier au mariage de leurs enfants ${invitation.bride_name} et ${invitation.groom_name}.`;
}

/** Proposition affichée dans le formulaire, avant toute retouche. */
export function suggestFamilyMessage(
  brideFamily: string,
  groomFamily: string,
  brideName: string,
  groomName: string,
): string {
  return (
    familyMessage({
      description: null,
      bride_family: brideFamily,
      groom_family: groomFamily,
      bride_name: brideName || "…",
      groom_name: groomName || "…",
    }) ?? ""
  );
}

/** Une date passée ne peut pas être célébrée. */
export function isFutureDate(value: string): boolean {
  if (!value) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${value}T00:00:00`);
  return !Number.isNaN(target.getTime()) && target.getTime() >= today.getTime();
}
