import type { CeremonyInfoValues } from "@/lib/validation/schemas";
import type { EventKind, Invitation, InvitationWithPhotos, WeddingEvent, WeddingType } from "@/types/database";
import { CEREMONIES_BY_TYPE, sortedEvents } from "./events";

/* ═══════════════════════════════════════════════════════════════
   Le formulaire parle de « coutumier, civil, religieux, walima ».
   La base stocke un tableau d’événements. Ces fonctions font la
   traduction dans les deux sens, quel que soit le type de mariage.
   ═══════════════════════════════════════════════════════════════ */

const EMPTY_EVENT = { date: "", time: "", venue: "", address: "" };

export function emptyCeremonyInfo(weddingType: WeddingType): CeremonyInfoValues {
  return {
    weddingType,
    bride_name: "",
    groom_name: "",
    bride_family: "",
    groom_family: "",
    description: "",
    story: "",
    religieux: { ...EMPTY_EVENT },
    walima: { ...EMPTY_EVENT },
    civil: { ...EMPTY_EVENT },
    coutumier: { ...EMPTY_EVENT },
    hasCivil: false,
    hasCoutumier: false,
  };
}

/** Les cérémonies effectivement retenues, dans l’ordre du formulaire. */
function activeKinds(values: CeremonyInfoValues): EventKind[] {
  const plan = CEREMONIES_BY_TYPE[values.weddingType];
  const optional = plan.optional.filter((kind) =>
    kind === "civil" ? values.hasCivil : kind === "coutumier" ? values.hasCoutumier : false,
  );
  return [...plan.required, ...optional];
}

/** Formulaire → colonnes de la table `invitations`. */
export function ceremonyValuesToDraft(values: CeremonyInfoValues) {
  const events: WeddingEvent[] = [];
  activeKinds(values).forEach((kind) => {
    const raw = values[kind as keyof CeremonyInfoValues] as typeof EMPTY_EVENT | undefined;
    if (!raw?.date || !raw?.venue) return;
    events.push({
      kind,
      date: raw.date,
      time: raw.time ?? "",
      venue: raw.venue,
      address: raw.address || null,
    });
  });

  /* La date de référence — cartes, partage, compte à rebours — est
     celle de la première cérémonie une fois le tri fait. */
  const ordered = sortedEvents({ events });
  const first = ordered[0];
  const closing =
    ordered.find((event) => event.kind === "walima") ??
    ordered.find((event) => event.kind === "religieux") ??
    first;

  return {
    bride_name: values.bride_name,
    groom_name: values.groom_name,
    bride_family: values.bride_family,
    groom_family: values.groom_family,
    title: `${values.bride_name} & ${values.groom_name}`,
    description: values.description || null,
    story: values.story || null,
    events,
    wedding_date: first?.date ?? null,
    wedding_time: first?.time || null,
    venue: closing?.venue ?? null,
    address: closing?.address ?? null,
  };
}

/** Invitation existante → valeurs du formulaire. */
export function invitationToCeremonyValues(
  invitation: Invitation | InvitationWithPhotos,
): CeremonyInfoValues {
  const pick = (kind: EventKind) => {
    const found = (invitation.events ?? []).find((event) => event.kind === kind);
    return found
      ? {
          date: found.date ?? "",
          time: found.time ?? "",
          venue: found.venue ?? "",
          address: found.address ?? "",
        }
      : { ...EMPTY_EVENT };
  };

  const civil = pick("civil");
  const coutumier = pick("coutumier");

  return {
    weddingType: invitation.type ?? "chretien",
    bride_name: invitation.bride_name ?? "",
    groom_name: invitation.groom_name ?? "",
    bride_family: invitation.bride_family ?? "",
    groom_family: invitation.groom_family ?? "",
    description: invitation.description ?? "",
    story: invitation.story ?? "",
    religieux: pick("religieux"),
    walima: pick("walima"),
    civil,
    coutumier,
    hasCivil: Boolean(civil.date && civil.venue),
    hasCoutumier: Boolean(coutumier.date && coutumier.venue),
  };
}
