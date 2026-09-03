import type { TemplateDefinition } from "../../types";
import { BIRTHDAY_SECTIONS } from "./sections";

/** SOBRE — Velours vert et filet d'or. La plus habillée des trois. */
export const emeraude: TemplateDefinition = {
  id: "emeraude",
  name: "Émeraude",
  tagline: "Velours vert et filet d’or. La plus habillée.",
  category: "sobre",
  product: "anniversaire",
  supportedWeddingTypes: [],
  audience: "adulte",
  ageRange: "18 ans et plus",
  preview: { from: "#1E443B", to: "#081512", accent: "#C6A05C" },
  colors: {
    background: "#0D1F1B",
    surface: "#132C26",
    ink: "#EDF4F0",
    inkSoft: "#8FA9A0",
    line: "#1D3C34",
    accent: "#C6A05C",
    accentSoft: "#10261F",
    plateFrom: "#1E443B",
    plateTo: "#081512",
  },
  typography: {
    script: "bodoni",
    display: "bodoni",
    sans: "jost",
    heroScale: "clamp(2.5rem, 9.5cqw, 4.75rem)",
    eyebrowTracking: "0.32em",
    namesItalic: false,
    namesSeparator: "&",
  },
  sections: BIRTHDAY_SECTIONS,
  animations: { envelope: true, curtain: true, revealDuration: 1.15, stagger: 0.1, parallax: true },
};
