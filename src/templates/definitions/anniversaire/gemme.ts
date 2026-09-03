import type { TemplateDefinition } from "../../types";
import { BIRTHDAY_SECTIONS } from "./sections";

/** FÉERIQUE — Facettes turquoise et éclats de lumière. */
export const gemme: TemplateDefinition = {
  id: "gemme",
  name: "Gemme",
  tagline: "Facettes turquoise et éclats de lumière.",
  category: "feerique",
  product: "anniversaire",
  supportedWeddingTypes: [],
  audience: "jeune-ado-fille",
  ageRange: "11 – 14 ans",
  preview: { from: "#A9E4F2", to: "#2E8FA8", accent: "#0F3341" },
  colors: {
    background: "#F2FAFD",
    surface: "#FFFFFF",
    ink: "#0F3341",
    inkSoft: "#5E8A99",
    line: "#D7EBF2",
    accent: "#1F9CBD",
    accentSoft: "#E3F4F9",
    plateFrom: "#A9E4F2",
    plateTo: "#2E8FA8",
  },
  typography: {
    script: "baloo",
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
