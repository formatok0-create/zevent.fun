import type { TemplateDefinition } from "../../types";
import { BIRTHDAY_SECTIONS } from "./sections";

/** NOCTURNE — Bleu profond, ballons d'argent. Sobre pour son âge. */
export const nuitBleue: TemplateDefinition = {
  id: "nuit-bleue",
  name: "Nuit bleue",
  tagline: "Bleu profond et ballons d’argent. Sobre pour son âge.",
  category: "nocturne",
  product: "anniversaire",
  supportedWeddingTypes: [],
  audience: "jeune-ado",
  ageRange: "11 – 14 ans",
  preview: { from: "#19355A", to: "#08142A", accent: "#8FBEF0" },
  colors: {
    background: "#0A1B37",
    surface: "#102646",
    ink: "#EAF1FC",
    inkSoft: "#93A6C4",
    line: "#1D3157",
    accent: "#8FBEF0",
    accentSoft: "#0D2140",
    plateFrom: "#19355A",
    plateTo: "#08142A",
  },
  typography: {
    script: "baloo",
    display: "outfit",
    sans: "jost",
    heroScale: "clamp(2.5rem, 10.5cqw, 5.25rem)",
    eyebrowTracking: "0.24em",
    namesItalic: false,
    namesSeparator: "&",
  },
  sections: BIRTHDAY_SECTIONS,
  animations: { envelope: true, curtain: true, revealDuration: 1.0, stagger: 0.1, parallax: true },
};
