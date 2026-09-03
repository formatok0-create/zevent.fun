import type { TemplateDefinition } from "../../types";
import { BIRTHDAY_SECTIONS } from "./sections";

/** TROPICAL — Hibiscus, vagues et turquoise. Pour une fête dehors,
 *  au bord de l’eau ou dans un jardin. */
export const lagon: TemplateDefinition = {
  id: "lagon",
  name: "Lagon",
  tagline: "Hibiscus, vagues et turquoise. Une fête au bord de l’eau.",
  category: "tropical",
  product: "anniversaire",
  supportedWeddingTypes: [],
  audience: "fille",
  ageRange: "1 – 10 ans",
  decor: "lagon",
  preview: { from: "#A6E3D8", to: "#22867E", accent: "#F2708C" },
  colors: {
    background: "#F3FBF9",
    surface: "#FFFFFF",
    ink: "#0F3D3E",
    inkSoft: "#5C8886",
    line: "#D7EDE8",
    accent: "#E4526F",
    accentSoft: "#FDEAEE",
    plateFrom: "#A6E3D8",
    plateTo: "#22867E",
  },
  typography: {
    script: "baloo",
    display: "baloo",
    sans: "outfit",
    heroScale: "clamp(2.6rem, 11cqw, 5.5rem)",
    eyebrowTracking: "0.26em",
    namesItalic: false,
    namesSeparator: "&",
  },
  sections: BIRTHDAY_SECTIONS,
  animations: { envelope: true, curtain: false, revealDuration: 1, stagger: 0.1, parallax: true },
};
