import type { TemplateDefinition } from "../../types";
import { CHRISTIAN_SECTIONS } from "./sections";

/** MODERNE — Vert feuille et blanc, un jardin en plein air. */
export const roseraie: TemplateDefinition = {
  id: "roseraie",
  name: "Roseraie",
  tagline: "Vert feuille et blanc, un jardin en plein air.",
  category: "moderne",
  supportedWeddingTypes: ["chretien"],
  preview: { from: "#E6EFE3", to: "#B4C8AC", accent: "#7E9A72" },
  colors: {
    background: "#F7FAF6",
    surface: "#FFFFFF",
    ink: "#2C3A2E",
    inkSoft: "#77877A",
    line: "#DEE8DD",
    accent: "#7E9A72",
    accentSoft: "#E3EDDF",
    plateFrom: "#E6EFE3",
    plateTo: "#B4C8AC",
  },
  typography: {
    script: "great-vibes",
    display: "marcellus",
    sans: "jost",
    heroScale: "clamp(2.8rem, 11cqw, 7rem)",
    eyebrowTracking: "0.34em",
    namesItalic: false,
    namesSeparator: "&",
  },
  sections: CHRISTIAN_SECTIONS,
  animations: { envelope: true, curtain: true, revealDuration: 1.2, stagger: 0.13, parallax: true },
};
