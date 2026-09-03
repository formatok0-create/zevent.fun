import type { TemplateDefinition } from "../../types";
import { BIRTHDAY_SECTIONS } from "./sections";

/** SOBRE — Noir profond, une cravate rouge pour seule couleur. */
export const smoking: TemplateDefinition = {
  id: "smoking",
  name: "Smoking",
  tagline: "Noir profond, une seule couleur. Tenue correcte exigée.",
  category: "sobre",
  product: "anniversaire",
  supportedWeddingTypes: [],
  audience: "adulte",
  ageRange: "18 ans et plus",
  preview: { from: "#302F2F", to: "#070607", accent: "#B4232A" },
  colors: {
    background: "#0B0A0A",
    surface: "#141212",
    ink: "#F2EEEC",
    inkSoft: "#9C9391",
    line: "#241F1F",
    accent: "#B4232A",
    accentSoft: "#170F10",
    plateFrom: "#302F2F",
    plateTo: "#070607",
  },
  typography: {
    script: "bodoni",
    display: "bodoni",
    sans: "jost",
    heroScale: "clamp(2.6rem, 10cqw, 5rem)",
    eyebrowTracking: "0.3em",
    namesItalic: false,
    namesSeparator: "&",
  },
  sections: BIRTHDAY_SECTIONS,
  animations: { envelope: true, curtain: true, revealDuration: 1.1, stagger: 0.1, parallax: true },
};
