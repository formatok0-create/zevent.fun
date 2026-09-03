import type { TemplateDefinition } from "../../types";
import { MUSLIM_SECTIONS } from "./sections";

/** MODERNE — contraste franc, grands blancs, une seule couleur d’accent. */
export const meridien: TemplateDefinition = {
  id: "meridien",
  name: "Méridien",
  tagline: "Contraste franc, grands blancs, un seul accent.",
  category: "moderne",
  supportedWeddingTypes: ["musulman"],
  preview: { from: "#E6E3DA", to: "#26251F", accent: "#B08D3F" },
  colors: {
    background: "#F3F1EC",
    surface: "#FFFFFF",
    ink: "#1E1D1A",
    inkSoft: "#6D6A63",
    line: "#DEDBD2",
    accent: "#B08D3F",
    accentSoft: "#EDE4CE",
    plateFrom: "#E6E3DA",
    plateTo: "#26251F",
  },
  typography: {
    script: "pinyon",
    display: "italiana",
    sans: "outfit",
    heroScale: "clamp(3rem, 14cqw, 9.5rem)",
    eyebrowTracking: "0.42em",
    namesItalic: false,
    namesSeparator: "×",
  },
  sections: MUSLIM_SECTIONS,
  animations: { envelope: true, curtain: false, revealDuration: 0.9, stagger: 0.08, parallax: true },
};
