import type { TemplateDefinition } from "../../types";
import { BIRTHDAY_SECTIONS } from "./sections";

/** NOCTURNE — Bleu d'encre et lumière ambrée. Pour un dîner, pas pour un salon. */
export const ambre: TemplateDefinition = {
  id: "ambre",
  name: "Ambre",
  tagline: "Bleu d’encre et lumière ambrée.",
  category: "nocturne",
  product: "anniversaire",
  supportedWeddingTypes: [],
  audience: "adulte",
  ageRange: "18 ans et plus",
  preview: { from: "#1B2A3D", to: "#0A0F18", accent: "#F0A81C" },
  colors: {
    background: "#101825",
    surface: "#16202F",
    ink: "#EEF2F8",
    inkSoft: "#93A2B6",
    line: "#223043",
    accent: "#F0A81C",
    accentSoft: "#15202F",
    plateFrom: "#1B2A3D",
    plateTo: "#0A0F18",
  },
  typography: {
    script: "bodoni",
    display: "bodoni",
    sans: "outfit",
    heroScale: "clamp(2.6rem, 10cqw, 5rem)",
    eyebrowTracking: "0.28em",
    namesItalic: false,
    namesSeparator: "&",
  },
  sections: BIRTHDAY_SECTIONS,
  animations: { envelope: true, curtain: false, revealDuration: 1.0, stagger: 0.1, parallax: true },
};
