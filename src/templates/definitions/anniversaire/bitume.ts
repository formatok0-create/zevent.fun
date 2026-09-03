import type { TemplateDefinition } from "../../types";
import { BIRTHDAY_SECTIONS } from "./sections";

/** URBAIN — Gris béton, une seule couleur qui claque. Le style du terrain de quartier. */
export const bitume: TemplateDefinition = {
  id: "bitume",
  name: "Bitume",
  tagline: "Béton, bombe rouge, rien de plus.",
  category: "urbain",
  product: "anniversaire",
  supportedWeddingTypes: [],
  audience: "ado",
  ageRange: "15 – 17 ans",
  preview: { from: "#2A282C", to: "#131315", accent: "#E0483C" },
  colors: {
    background: "#1A1A1C",
    surface: "#222225",
    ink: "#F2F0EE",
    inkSoft: "#9A9691",
    line: "#2E2E32",
    accent: "#E0483C",
    accentSoft: "#241A19",
    plateFrom: "#2A282C",
    plateTo: "#131315",
  },
  typography: {
    script: "outfit",
    display: "outfit",
    sans: "outfit",
    heroScale: "clamp(2.6rem, 11cqw, 5.5rem)",
    eyebrowTracking: "0.22em",
    namesItalic: false,
    namesSeparator: "&",
  },
  sections: BIRTHDAY_SECTIONS,
  animations: { envelope: true, curtain: false, revealDuration: 0.8, stagger: 0.1, parallax: true },
};
