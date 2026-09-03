import type { TemplateDefinition } from "../../types";
import { BIRTHDAY_SECTIONS } from "./sections";

/** FÉERIQUE — Un château rose posé sur les nuages. */
export const chateau: TemplateDefinition = {
  id: "chateau",
  name: "Château",
  tagline: "Un château rose posé sur les nuages.",
  category: "feerique",
  product: "anniversaire",
  supportedWeddingTypes: [],
  audience: "ado-fille",
  ageRange: "15 – 17 ans",
  preview: { from: "#F9C6D9", to: "#E38FB4", accent: "#56223A" },
  colors: {
    background: "#FFF4F7",
    surface: "#FFFFFF",
    ink: "#56223A",
    inkSoft: "#9A6C80",
    line: "#F8DEE7",
    accent: "#E36BA0",
    accentSoft: "#FDEBF2",
    plateFrom: "#F9C6D9",
    plateTo: "#E38FB4",
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
