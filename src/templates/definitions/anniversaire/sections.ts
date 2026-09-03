import type { TemplateSection } from "../../types";

/* Le déroulé d’une invitation d’anniversaire. L’album vient tout de
   suite après le hero : c’est l’argument de la page, pas un bonus
   qu’on découvre en bas. */
export const BIRTHDAY_SECTIONS: TemplateSection[] = [
  { id: "heroFete" },
  { id: "motFete", optional: true },
  { id: "album", optional: true },
  { id: "countdown" },
  { id: "details" },
  { id: "program", optional: true },
  { id: "galleryFete", optional: true },
  { id: "closingFete" },
];
