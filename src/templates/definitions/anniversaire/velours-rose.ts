import type { TemplateDefinition } from "../../types";
import { BIRTHDAY_SECTIONS } from "./sections";

/** NOCTURNE — Violet profond, paillettes et douceur. */
export const veloursRose: TemplateDefinition = {
  id: "velours-rose",
  name: "Velours rose",
  tagline: "Violet profond, paillettes et douceur.",
  category: "nocturne",
  product: "anniversaire",
  supportedWeddingTypes: [],
  audience: "ado-fille",
  ageRange: "15 – 17 ans",
  preview: { from: "#3A2352", to: "#150F1E", accent: "#C08CF2" },
  colors: {
    background: "#17101F",
    surface: "#211730",
    ink: "#F3ECFA",
    inkSoft: "#A497BC",
    line: "#2E2242",
    accent: "#C08CF2",
    accentSoft: "#1D1429",
    plateFrom: "#3A2352",
    plateTo: "#150F1E",
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
  animations: { envelope: true, curtain: true, revealDuration: 1, stagger: 0.1, parallax: true },
};
