import type { TemplateSection } from "../../types";

/* Le déroulé d’une invitation de mariage musulman.
   Les cinq collections partagent cette structure : elles ne
   diffèrent que par les couleurs, la typographie et le mouvement. */
export const MUSLIM_SECTIONS: TemplateSection[] = [
  { id: "hero" },
  { id: "couple" },
  { id: "familles" },
  { id: "story", optional: true },
  { id: "ceremonies" },
  { id: "countdown" },
  { id: "gallery", optional: true },
  { id: "closing" },
];
