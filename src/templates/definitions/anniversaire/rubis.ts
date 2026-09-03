import type { TemplateDefinition } from "../../types";
import { BIRTHDAY_SECTIONS } from "./sections";

/** SOBRE — Roses rouges et néon, sur fond de nuit. */
export const rubis: TemplateDefinition = {
  id: "rubis",
  name: "Rubis",
  tagline: "Roses rouges et néon, sur fond de nuit.",
  category: "sobre",
  product: "anniversaire",
  supportedWeddingTypes: [],
  audience: "adulte-femme",
  ageRange: "18 ans et plus",
  preview: { from: "#6E1424", to: "#150609", accent: "#E23B57" },
  colors: {
    background: "#17070B",
    surface: "#210C12",
    ink: "#F7EAEE",
    inkSoft: "#B4949C",
    line: "#31151C",
    accent: "#E23B57",
    accentSoft: "#1D0910",
    plateFrom: "#6E1424",
    plateTo: "#150609",
  },
  typography: {
    script: "bodoni",
    display: "bodoni",
    sans: "jost",
    heroScale: "clamp(2.5rem, 10.5cqw, 5.25rem)",
    eyebrowTracking: "0.24em",
    namesItalic: false,
    namesSeparator: "&",
  },
  sections: BIRTHDAY_SECTIONS,
  animations: { envelope: true, curtain: true, revealDuration: 1, stagger: 0.1, parallax: true },
};
