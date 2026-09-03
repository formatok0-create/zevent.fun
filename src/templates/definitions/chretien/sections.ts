import type { TemplateSection } from "../../types";

/* Le déroulé d’une invitation de mariage chrétien. Même ossature
   que le musulman : seules les cérémonies proposées changent. */
export const CHRISTIAN_SECTIONS: TemplateSection[] = [
  { id: "hero" },
  { id: "couple" },
  { id: "familles" },
  { id: "story", optional: true },
  { id: "ceremonies" },
  { id: "countdown" },
  { id: "gallery", optional: true },
  { id: "closing" },
];
