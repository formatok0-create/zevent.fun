import type { AlbumEntry, Invitation } from "@/types/database";
import type { BirthdayInfoValues } from "@/lib/validation/schemas";

/* Le pont entre le formulaire de la fête et les colonnes de la
   table. Tant que la base reste mariage-native, la date et l’heure
   de la soirée passent par wedding_date / wedding_time. */

export function emptyBirthdayInfo(): BirthdayInfoValues {
  return {
    celebrant_name: "",
    celebrant_age: 1,
    party_date: "",
    party_time: "15:00",
    venue: "",
    address: "",
    description: "",
    story: "",
  };
}

export function invitationToBirthdayValues(invitation: Invitation): BirthdayInfoValues {
  return {
    celebrant_name: invitation.celebrant_name ?? invitation.bride_name ?? "",
    celebrant_age: invitation.celebrant_age ?? 1,
    party_date: invitation.wedding_date ?? "",
    party_time: invitation.wedding_time?.slice(0, 5) ?? "15:00",
    venue: invitation.venue ?? "",
    address: invitation.address ?? "",
    description: invitation.description ?? "",
    story: invitation.story ?? "",
  };
}

export function birthdayValuesToDraft(values: BirthdayInfoValues) {
  return {
    celebrant_name: values.celebrant_name.trim(),
    celebrant_age: values.celebrant_age,
    wedding_date: values.party_date || null,
    wedding_time: values.party_time || null,
    venue: values.venue.trim(),
    address: values.address?.trim() || null,
    description: values.description?.trim() || null,
    story: values.story?.trim() || null,
  };
}

/** Une entrée par âge, sur la plage demandée. On ne prépare que les
 *  années que la personne veut remplir : à trente ans, personne ne
 *  cherche une photo de sa deuxième année. Les photos et légendes
 *  déjà saisies sont conservées quand la plage change. */
export function buildAlbumSkeleton(
  fromAge: number,
  toAge: number,
  age: number,
  partyDate: string,
  existing: AlbumEntry[] = [],
): AlbumEntry[] {
  const partyYear = Number(partyDate?.slice(0, 4)) || new Date().getFullYear();
  const start = Math.max(1, Math.min(fromAge, toAge));
  const end = Math.min(Math.max(fromAge, toAge), age || 120);
  const count = Math.min(end - start + 1, 30);
  if (count < 1) return [];

  return Array.from({ length: count }, (_, index) => {
    const entryAge = start + index;
    const previous = existing.find((e) => e.age === entryAge);
    return {
      year: partyYear - age + entryAge,
      age: entryAge,
      url: previous?.url ?? null,
      caption: previous?.caption ?? null,
    };
  });
}

/** La plage proposée d'office : les dix dernières années, jamais plus. */
export function defaultAlbumRange(age: number): { from: number; to: number } {
  const to = Math.max(1, age);
  return { from: Math.max(1, to - 9), to };
}
