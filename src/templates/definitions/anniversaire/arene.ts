import type { TemplateDefinition } from "../../types";
import { BIRTHDAY_SECTIONS } from "./sections";

/** URBAIN — Le terrain vu d'en haut, au trait néon. Bleu de nuit et lignes qui brillent. */
export const arene: TemplateDefinition = {
  id: "arene",
  name: "Arène",
  tagline: "Le terrain vu d’en haut, au trait néon.",
  category: "urbain",
  product: "anniversaire",
  supportedWeddingTypes: [],
  audience: "jeune-ado",
  ageRange: "11 – 14 ans",
  preview: { from: "#1B3358", to: "#0A1220", accent: "#4FA9F5" },
  colors: {
    background: "#0E1626",
    surface: "#142033",
    ink: "#EAF2FF",
    inkSoft: "#93A8C6",
    line: "#23324B",
    accent: "#4FA9F5",
    accentSoft: "#132038",
    plateFrom: "#1B3358",
    plateTo: "#0A1220",
  },
  typography: {
    script: "baloo",
    display: "outfit",
    sans: "outfit",
    heroScale: "clamp(2.6rem, 11cqw, 5.5rem)",
    eyebrowTracking: "0.2em",
    namesItalic: false,
    namesSeparator: "&",
  },
  sections: BIRTHDAY_SECTIONS,
  animations: { envelope: true, curtain: false, revealDuration: 0.9, stagger: 0.1, parallax: true },
};
