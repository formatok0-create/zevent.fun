import type { TemplateDefinition } from "../../types";
import { CHRISTIAN_SECTIONS } from "./sections";

/** MINIMAL — Presque rien. Du blanc, un filet, deux prénoms. */
export const lin: TemplateDefinition = {
  id: "lin",
  name: "Lin",
  tagline: "Presque rien. Du blanc, un filet, deux prénoms.",
  category: "minimal",
  supportedWeddingTypes: ["chretien"],
  preview: { from: "#F2F2F0", to: "#D6D6D2", accent: "#9C9C96" },
  colors: {
    background: "#FBFBFA",
    surface: "#FFFFFF",
    ink: "#26262A",
    inkSoft: "#84858A",
    line: "#E7E7E6",
    accent: "#9C9C96",
    accentSoft: "#EFEFED",
    plateFrom: "#F2F2F0",
    plateTo: "#D6D6D2",
  },
  typography: {
    script: "pinyon",
    display: "italiana",
    sans: "outfit",
    heroScale: "clamp(2.5rem, 10cqw, 6.5rem)",
    eyebrowTracking: "0.44em",
    namesItalic: false,
    namesSeparator: "—",
  },
  sections: CHRISTIAN_SECTIONS,
  animations: { envelope: true, curtain: true, revealDuration: 1.2, stagger: 0.13, parallax: true },
};
