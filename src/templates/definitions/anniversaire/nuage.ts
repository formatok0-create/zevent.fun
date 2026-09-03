import type { TemplateDefinition } from "../../types";
import { BIRTHDAY_SECTIONS } from "./sections";

/** TENDRE — Ciel rose, papillons et petits cœurs. */
export const nuage: TemplateDefinition = {
  id: "nuage",
  name: "Nuage",
  tagline: "Ciel rose, papillons et petits cœurs.",
  category: "tendre",
  product: "anniversaire",
  supportedWeddingTypes: [],
  audience: "jeune-ado-fille",
  ageRange: "11 – 14 ans",
  preview: { from: "#FBB9D6", to: "#E8579E", accent: "#4A1533" },
  colors: {
    background: "#FFF3F8",
    surface: "#FFFFFF",
    ink: "#5A1F3E",
    inkSoft: "#9C6A85",
    line: "#F8DCE9",
    accent: "#E84E93",
    accentSoft: "#FDE9F2",
    plateFrom: "#FBB9D6",
    plateTo: "#E8579E",
  },
  typography: {
    script: "baloo",
    display: "baloo",
    sans: "jost",
    heroScale: "clamp(2.5rem, 10.5cqw, 5.25rem)",
    eyebrowTracking: "0.24em",
    namesItalic: false,
    namesSeparator: "&",
  },
  sections: BIRTHDAY_SECTIONS,
  animations: { envelope: true, curtain: false, revealDuration: 1, stagger: 0.1, parallax: true },
};
