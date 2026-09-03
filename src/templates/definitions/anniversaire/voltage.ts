import type { TemplateDefinition } from "../../types";
import { BIRTHDAY_SECTIONS } from "./sections";

/** POP — Éclair tramé, orange franc. La plus bruyante des trois. */
export const voltage: TemplateDefinition = {
  id: "voltage",
  name: "Voltage",
  tagline: "Éclair tramé, orange franc. Impossible à rater.",
  category: "pop",
  product: "anniversaire",
  supportedWeddingTypes: [],
  audience: "jeune-ado",
  ageRange: "11 – 14 ans",
  preview: { from: "#F2AD41", to: "#E4551F", accent: "#23150A" },
  colors: {
    background: "#FFF6EC",
    surface: "#FFFFFF",
    ink: "#23150A",
    inkSoft: "#7A6250",
    line: "#F0DFCB",
    accent: "#E4551F",
    accentSoft: "#FDEADC",
    plateFrom: "#F2AD41",
    plateTo: "#E4551F",
  },
  typography: {
    script: "baloo",
    display: "outfit",
    sans: "outfit",
    heroScale: "clamp(2.6rem, 11cqw, 5.5rem)",
    eyebrowTracking: "0.18em",
    namesItalic: false,
    namesSeparator: "&",
  },
  sections: BIRTHDAY_SECTIONS,
  animations: { envelope: true, curtain: false, revealDuration: 0.85, stagger: 0.1, parallax: true },
};
