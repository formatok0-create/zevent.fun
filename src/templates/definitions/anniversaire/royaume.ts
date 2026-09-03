import type { TemplateDefinition } from "../../types";
import { BIRTHDAY_SECTIONS } from "./sections";

/** AVENTURE — Prairie, briques et champignons. Le monde qu’on
 *  traverse en sautant. Pour les garçons qui courent déjà. */
export const royaume: TemplateDefinition = {
  id: "royaume",
  name: "Royaume",
  tagline: "Prairie, briques et champignons. Le monde qu’on traverse en sautant.",
  category: "aventure",
  product: "anniversaire",
  supportedWeddingTypes: [],
  audience: "garcon",
  ageRange: "3 – 10 ans",
  decor: "royaume",
  preview: { from: "#BFE3A8", to: "#3E8F45", accent: "#E0492F" },
  colors: {
    background: "#F6FBF3",
    surface: "#FFFFFF",
    ink: "#1E3A24",
    inkSoft: "#5E7A63",
    line: "#D8E8D6",
    accent: "#E0492F",
    accentSoft: "#FCEBE4",
    plateFrom: "#BFE3A8",
    plateTo: "#3E8F45",
  },
  typography: {
    script: "baloo",
    display: "baloo",
    sans: "outfit",
    heroScale: "clamp(2.6rem, 11cqw, 5.5rem)",
    eyebrowTracking: "0.24em",
    namesItalic: false,
    namesSeparator: "&",
  },
  sections: BIRTHDAY_SECTIONS,
  animations: { envelope: true, curtain: false, revealDuration: 0.9, stagger: 0.1, parallax: true },
};
