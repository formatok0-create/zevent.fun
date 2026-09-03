import type { TemplateDefinition } from "../../types";
import { BIRTHDAY_SECTIONS } from "./sections";

/** POÉTIQUE — Perles, roses satinées et éclat nacré. */
export const perle: TemplateDefinition = {
  id: "perle",
  name: "Perle",
  tagline: "Perles, roses satinées et éclat nacré.",
  category: "poetique",
  product: "anniversaire",
  supportedWeddingTypes: [],
  audience: "jeune-ado-fille",
  ageRange: "11 – 14 ans",
  preview: { from: "#F7C9DC", to: "#D9749F", accent: "#4A2036" },
  colors: {
    background: "#FFF4F8",
    surface: "#FFFFFF",
    ink: "#4A2036",
    inkSoft: "#96687E",
    line: "#F6DDE7",
    accent: "#E4649B",
    accentSoft: "#FDECF3",
    plateFrom: "#F7C9DC",
    plateTo: "#D9749F",
  },
  typography: {
    script: "baloo",
    display: "baloo",
    sans: "outfit",
    heroScale: "clamp(2.5rem, 10.5cqw, 5.25rem)",
    eyebrowTracking: "0.24em",
    namesItalic: false,
    namesSeparator: "&",
  },
  sections: BIRTHDAY_SECTIONS,
  animations: { envelope: true, curtain: false, revealDuration: 1, stagger: 0.1, parallax: true },
};
