import type { AlbumEntry, InvitationWithPhotos } from "@/types/database";
import type { TemplateAudience } from "@/templates/types";

/* Une invitation d’anniversaire fictive, utilisée uniquement par
   l’aperçu des collections. Elle ne touche jamais la base : c’est
   un objet en mémoire, construit à la volée. */

function albumOf(age: number, currentYear: number): AlbumEntry[] {
  const captions = [
    "Premiers pas",
    "La plage",
    "Le vélo",
    "L’école",
    "Le maillot",
    "La cabane",
    "Le grand",
    "La piscine",
    "Le camp",
    "Aujourd’hui",
  ];
  return Array.from({ length: age }, (_, index) => ({
    year: currentYear - age + index + 1,
    age: index + 1,
    url: null,
    caption: captions[index] ?? null,
  }));
}

export function demoBirthdayInvitation(
  templateId: string,
  audience?: TemplateAudience,
): InvitationWithPhotos {
  const NAMES: Record<string, [string, number]> = {
    fille: ["Liliane", 7],
    garcon: ["Adrian", 7],
    "jeune-ado": ["Ismaël", 13],
    ado: ["Kevin", 16],
    adulte: ["Cheick", 30],
    "jeune-ado-fille": ["Awa", 13],
    "ado-fille": ["Fatou", 16],
    "adulte-femme": ["Aïcha", 30],
  };
  const [name, demoAge] = NAMES[audience ?? "garcon"] ?? NAMES.garcon;
  const now = new Date();
  const currentYear = now.getFullYear();
  const age = demoAge;
  const party = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 38);

  return {
    id: "apercu",
    user_id: "apercu",
    type: "chretien",
    template_id: templateId,
    slug: null,
    title: null,
    /* La table est encore mariage-native : le prénom de l’enfant
       passe par celebrant_name, bride_name sert de repli. */
    groom_name: "",
    bride_name: name,
    celebrant_name: name,
    celebrant_age: age,
    album: albumOf(age, currentYear),
    wedding_date: party.toISOString().slice(0, 10),
    wedding_time: "15:00",
    venue: "Jardin de la Riviera",
    address: "Cocody, Abidjan",
    description: "Vous êtes invité",
    story: null,
    music_url: null,
    music_title: null,
    cover_image_url: null,
    bride_family: null,
    groom_family: null,
    bride_photo_url: null,
    groom_photo_url: null,
    events: null,
    program: [
      { time: "15:00", title: "Accueil", note: "Jeux dans le jardin" },
      { time: "16:30", title: "Le gâteau", note: "Sept bougies" },
      { time: "18:00", title: "Départ", note: "Chacun repart avec sa pochette" },
    ],
    status: "published",
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    published_at: now.toISOString(),
    paid_at: null,
    plan_code: null,
    expires_at: null,
    photos: [],
  };
}
