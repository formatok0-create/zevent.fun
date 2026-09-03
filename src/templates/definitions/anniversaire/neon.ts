import type { TemplateDefinition } from "../../types";
import { BIRTHDAY_SECTIONS } from "./sections";

/** NOCTURNE — Grille rose et cyan, horizon de synthèse. */
export const neon: TemplateDefinition = {
  id: "neon",
  name: "Néon",
  tagline: "Grille rose et cyan, horizon de synthèse.",
  category: "nocturne",
  product: "anniversaire",
  supportedWeddingTypes: [],
  audience: "ado",
  ageRange: "15 – 17 ans",
  preview: { from: "#231528", to: "#0A0A14", accent: "#FF4C93" },
  colors: {
    background: "#0C0C17",
    surface: "#14122A",
    ink: "#F1EDFF",
    inkSoft: "#9B93BE",
    line: "#241F3E",
    accent: "#FF4C93",
    accentSoft: "#16112B",
    plateFrom: "#231528",
    plateTo: "#0A0A14",
  },
  typography: {
    script: "outfit",
    display: "outfit",
    sans: "outfit",
    heroScale: "clamp(2.6rem, 11cqw, 5.5rem)",
    eyebrowTracking: "0.26em",
    namesItalic: false,
    namesSeparator: "&",
  },
  sections: BIRTHDAY_SECTIONS,
  animations: { envelope: true, curtain: true, revealDuration: 0.95, stagger: 0.1, parallax: true },
};
