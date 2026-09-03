import type { TemplateDefinition } from "../../types";
import { CHRISTIAN_SECTIONS } from "./sections";

/** ROMANTIQUE — Blanc, ciel pâle, nuages. La légèreté d’un matin. */
export const dolce: TemplateDefinition = {
  id: "dolce",
  name: "Dolce",
  tagline: "Blanc, ciel pâle, nuages. La légèreté d’un matin.",
  category: "romantique",
  supportedWeddingTypes: ["chretien"],
  preview: { from: "#E4EEF6", to: "#B9CFE0", accent: "#6E9CBB" },
  colors: {
    background: "#FBFCFE",
    surface: "#FFFFFF",
    ink: "#2E3A44",
    inkSoft: "#778794",
    line: "#DEE7EF",
    accent: "#6E9CBB",
    accentSoft: "#DFEBF4",
    plateFrom: "#E4EEF6",
    plateTo: "#B9CFE0",
  },
  typography: {
    script: "great-vibes",
    display: "cormorant",
    sans: "cormorant",
    heroScale: "clamp(2.9rem, 12cqw, 7.5rem)",
    eyebrowTracking: "0.32em",
    namesItalic: true,
    namesSeparator: "&",
  },
  sections: CHRISTIAN_SECTIONS,
  animations: { envelope: true, curtain: true, revealDuration: 1.2, stagger: 0.13, parallax: true },
};
