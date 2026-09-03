import type { TemplateDefinition } from "../../types";
import { BIRTHDAY_SECTIONS } from "./sections";

/** NOCTURNE — Néons roses, la nuit qui ne dort pas. */
export const magenta: TemplateDefinition = {
  id: "magenta",
  name: "Magenta",
  tagline: "Néons roses, la nuit qui ne dort pas.",
  category: "nocturne",
  product: "anniversaire",
  supportedWeddingTypes: [],
  audience: "adulte-femme",
  ageRange: "18 ans et plus",
  preview: { from: "#4A0D45", to: "#12040F", accent: "#FF2E9A" },
  colors: {
    background: "#170518",
    surface: "#230A25",
    ink: "#FBEBFA",
    inkSoft: "#B995B8",
    line: "#331335",
    accent: "#FF2E9A",
    accentSoft: "#1D071F",
    plateFrom: "#4A0D45",
    plateTo: "#12040F",
  },
  typography: {
    script: "outfit",
    display: "outfit",
    sans: "outfit",
    heroScale: "clamp(2.5rem, 10.5cqw, 5.25rem)",
    eyebrowTracking: "0.24em",
    namesItalic: false,
    namesSeparator: "&",
  },
  sections: BIRTHDAY_SECTIONS,
  animations: { envelope: true, curtain: false, revealDuration: 1, stagger: 0.1, parallax: true },
};
