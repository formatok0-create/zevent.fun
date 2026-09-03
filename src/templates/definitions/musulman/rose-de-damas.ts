import type { TemplateDefinition } from "../../types";
import { MUSLIM_SECTIONS } from "./sections";

/** ROMANTIQUE — rose poudré, ivoire, or pâle. La douceur d’un pétale. */
export const roseDeDamas: TemplateDefinition = {
  id: "rose-de-damas",
  name: "Rose de Damas",
  tagline: "Rose poudré, ivoire, or pâle. La douceur d’un pétale.",
  category: "romantique",
  supportedWeddingTypes: ["musulman"],
  preview: { from: "#F5DED5", to: "#D9AC9B", accent: "#B9846F" },
  colors: {
    background: "#F8E9E2",
    surface: "#FDF6F3",
    ink: "#7A4A3E",
    inkSoft: "#A3796C",
    line: "#E7CFC6",
    accent: "#B9846F",
    accentSoft: "#F1DDD5",
    plateFrom: "#F5DED5",
    plateTo: "#D9AC9B",
  },
  typography: {
    script: "great-vibes",
    display: "cormorant",
    sans: "cormorant",
    heroScale: "clamp(2.9rem, 12cqw, 7.5rem)",
    eyebrowTracking: "0.34em",
    namesItalic: true,
    namesSeparator: "&",
  },
  sections: MUSLIM_SECTIONS,
  animations: { envelope: true, curtain: true, revealDuration: 1.25, stagger: 0.14, parallax: true },
};
