import type { TemplateDefinition } from "../../types";
import { CHRISTIAN_SECTIONS } from "./sections";

/** ROMANTIQUE — Rose tendre et lumière du matin. */
export const aurore: TemplateDefinition = {
  id: "aurore",
  name: "Aurore",
  tagline: "Rose tendre et lumière du matin.",
  category: "romantique",
  supportedWeddingTypes: ["chretien"],
  preview: { from: "#F7E6E6", to: "#DCB9BB", accent: "#C58F92" },
  colors: {
    background: "#FDF8F7",
    surface: "#FFFFFF",
    ink: "#4A3A3C",
    inkSoft: "#96807F",
    line: "#EEDFDE",
    accent: "#C58F92",
    accentSoft: "#F5E4E4",
    plateFrom: "#F7E6E6",
    plateTo: "#DCB9BB",
  },
  typography: {
    script: "great-vibes",
    display: "playfair",
    sans: "jost",
    heroScale: "clamp(2.8rem, 11cqw, 7rem)",
    eyebrowTracking: "0.3em",
    namesItalic: true,
    namesSeparator: "&",
  },
  sections: CHRISTIAN_SECTIONS,
  animations: { envelope: true, curtain: true, revealDuration: 1.2, stagger: 0.13, parallax: true },
};
