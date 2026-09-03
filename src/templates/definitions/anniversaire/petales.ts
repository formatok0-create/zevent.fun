import type { TemplateDefinition } from "../../types";
import { BIRTHDAY_SECTIONS } from "./sections";

/** POÉTIQUE — Roses en suspension, nuage de pétales. */
export const petales: TemplateDefinition = {
  id: "petales",
  name: "Pétales",
  tagline: "Roses en suspension, nuage de pétales.",
  category: "poetique",
  product: "anniversaire",
  supportedWeddingTypes: [],
  audience: "ado-fille",
  ageRange: "15 – 17 ans",
  preview: { from: "#F7B9C8", to: "#D9607F", accent: "#5B2231" },
  colors: {
    background: "#FFF2F5",
    surface: "#FFFFFF",
    ink: "#5B2231",
    inkSoft: "#9C6B78",
    line: "#F7DCE3",
    accent: "#E0476E",
    accentSoft: "#FDE8EE",
    plateFrom: "#F7B9C8",
    plateTo: "#D9607F",
  },
  typography: {
    script: "outfit",
    display: "outfit",
    sans: "jost",
    heroScale: "clamp(2.5rem, 10.5cqw, 5.25rem)",
    eyebrowTracking: "0.24em",
    namesItalic: false,
    namesSeparator: "&",
  },
  sections: BIRTHDAY_SECTIONS,
  animations: { envelope: true, curtain: false, revealDuration: 1, stagger: 0.1, parallax: true },
};
