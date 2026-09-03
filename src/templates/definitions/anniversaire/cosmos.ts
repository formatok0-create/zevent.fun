import type { TemplateDefinition } from "../../types";
import { BIRTHDAY_SECTIONS } from "./sections";

/** COSMIQUE — Nuit d’encre, planètes et fusée. La seule collection
 *  sombre de la fête : les bougies s’y voient mieux. */
export const cosmos: TemplateDefinition = {
  id: "cosmos",
  name: "Cosmos",
  tagline: "Nuit d’encre, planètes et fusée. Le compte à rebours commence.",
  category: "cosmique",
  product: "anniversaire",
  supportedWeddingTypes: [],
  audience: "garcon",
  ageRange: "5 – 10 ans",
  decor: "cosmos",
  preview: { from: "#2C2F63", to: "#12142B", accent: "#F5B93B" },
  colors: {
    background: "#12142B",
    surface: "#1B1E3C",
    ink: "#F1EFFA",
    inkSoft: "#A29FC6",
    line: "#2E3160",
    accent: "#F5B93B",
    accentSoft: "#1A1D3A",
    plateFrom: "#2C2F63",
    plateTo: "#12142B",
  },
  typography: {
    script: "baloo",
    display: "outfit",
    sans: "outfit",
    heroScale: "clamp(2.6rem, 11cqw, 5.5rem)",
    eyebrowTracking: "0.3em",
    namesItalic: false,
    namesSeparator: "&",
  },
  sections: BIRTHDAY_SECTIONS,
  animations: { envelope: true, curtain: true, revealDuration: 1, stagger: 0.11, parallax: true },
};
