import type { TemplateDefinition } from "../../types";
import { MUSLIM_SECTIONS } from "./sections";

/** ORIENTAL — vert profond, or chaud, la fraîcheur d’un patio. */
export const zellige: TemplateDefinition = {
  id: "zellige",
  name: "Zellige",
  tagline: "Vert profond, or chaud, la fraîcheur d’un patio.",
  category: "oriental",
  supportedWeddingTypes: ["musulman"],
  preview: { from: "#E4E1CD", to: "#1E4034", accent: "#BE9A52" },
  colors: {
    background: "#F2EFE1",
    surface: "#FBF9F0",
    ink: "#1E4034",
    inkSoft: "#5C7568",
    line: "#DCD7C2",
    accent: "#BE9A52",
    accentSoft: "#EBDFC2",
    plateFrom: "#E4E1CD",
    plateTo: "#1E4034",
  },
  typography: {
    script: "great-vibes",
    display: "amiri",
    sans: "marcellus",
    heroScale: "clamp(2.8rem, 12cqw, 8rem)",
    eyebrowTracking: "0.38em",
    namesItalic: true,
    namesSeparator: "&",
  },
  sections: MUSLIM_SECTIONS,
  animations: { envelope: true, curtain: true, revealDuration: 1.2, stagger: 0.13, parallax: true },
};
