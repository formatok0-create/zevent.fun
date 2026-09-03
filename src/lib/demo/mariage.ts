import type { InvitationWithPhotos, WeddingType } from "@/types/database";

/* Une invitation fictive, en mémoire : elle sert à montrer la première
   page d'une collection dans la vitrine, sans base de données ni
   compte. Les prénoms sont ceux des maquettes de la maison. */

export function demoWeddingInvitation(
  templateId: string,
  type: WeddingType = "chretien",
): InvitationWithPhotos {
  const now = new Date();
  const jour = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 96);

  /* Aicha et Yassine sous une croix, ca ne va pas : chaque rite a ses
     prenoms et son lieu. */
  const musulman = type === "musulman";
  const mariee = musulman ? "Aïcha" : "Emma";
  const marie = musulman ? "Yassine" : "Nathan";

  return {
    id: "vitrine",
    user_id: "vitrine",
    type,
    template_id: templateId,
    slug: null,
    title: null,
    bride_name: mariee,
    groom_name: marie,
    celebrant_name: null,
    celebrant_age: null,
    album: null,
    wedding_date: jour.toISOString().slice(0, 10),
    wedding_time: "15:00",
    venue: musulman ? "Résidence Konan" : "Domaine des Palmiers",
    address: "Bingerville, Abidjan",
    description: "Vous êtes invité",
    story: null,
    music_url: null,
    music_title: null,
    cover_image_url: null,
    bride_family: musulman ? "Famille Koné" : "Famille Aka",
    groom_family: musulman ? "Famille Diallo" : "Famille Kouassi",
    bride_photo_url: null,
    groom_photo_url: null,
    events: null,
    program: null,
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
