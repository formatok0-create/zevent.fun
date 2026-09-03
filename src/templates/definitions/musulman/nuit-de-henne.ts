import type { TemplateDefinition } from "../../types";
import { MUSLIM_SECTIONS } from "./sections";

/** TRADITIONNEL — nuit profonde, or, la chaleur d’une soirée henné. */
export const nuitDeHenne: TemplateDefinition = {
  id: "nuit-de-henne",
  name: "Nuit de Henné",
  tagline: "Nuit profonde, or chaud, la chaleur d’une veillée.",
  category: "traditionnel",
  supportedWeddingTypes: ["musulman"],
  preview: { from: "#EDD8BC", to: "#8A5A33", accent: "#B8873F" },
  colors: {
    background: "#F6E7D5",
    surface: "#FDF6EC",
    ink: "#6B3A22",
    inkSoft: "#9A7154",
    line: "#E4CDB2",
    accent: "#B8873F",
    accentSoft: "#F0DFC5",
    plateFrom: "#EDD8BC",
    plateTo: "#8A5A33",
  },
  typography: {
    script: "great-vibes",
    display: "cinzel",
    sans: "cormorant",
    heroScale: "clamp(2.8rem, 12cqw, 8rem)",
    eyebrowTracking: "0.4em",
    namesItalic: true,
    namesSeparator: "&",
  },
  sections: MUSLIM_SECTIONS,
  animations: { envelope: true, curtain: true, revealDuration: 1.3, stagger: 0.15, parallax: true },
};
