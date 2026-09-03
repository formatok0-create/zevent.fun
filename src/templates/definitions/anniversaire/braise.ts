import type { TemplateDefinition } from "../../types";
import { BIRTHDAY_SECTIONS } from "./sections";

/** URBAIN — Ciel de fin de journée sur les toits. Chaud sans être criard. */
export const braise: TemplateDefinition = {
  id: "braise",
  name: "Braise",
  tagline: "Ciel de fin de journée sur les toits.",
  category: "urbain",
  product: "anniversaire",
  supportedWeddingTypes: [],
  audience: "ado",
  ageRange: "15 – 17 ans",
  preview: { from: "#6F2833", to: "#1B1319", accent: "#D9603F" },
  colors: {
    background: "#1B1319",
    surface: "#241A22",
    ink: "#F6ECE7",
    inkSoft: "#A99089",
    line: "#35262E",
    accent: "#D9603F",
    accentSoft: "#2A1A1C",
    plateFrom: "#6F2833",
    plateTo: "#1B1319",
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
  animations: { envelope: true, curtain: false, revealDuration: 0.9, stagger: 0.1, parallax: true },
};
