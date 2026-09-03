import type { TemplateDefinition } from "../../types";
import { MUSLIM_SECTIONS } from "./sections";

/** MINIMALISTE — presque rien. Du blanc, un filet, deux prénoms. */
export const nacre: TemplateDefinition = {
  id: "nacre",
  name: "Nacre",
  tagline: "Presque rien. Du blanc, un filet, deux prénoms.",
  category: "minimal",
  supportedWeddingTypes: ["musulman"],
  preview: { from: "#F2EFE7", to: "#DAD4C7", accent: "#A79A83" },
  colors: {
    background: "#FAF8F4",
    surface: "#FFFFFF",
    ink: "#2B2822",
    inkSoft: "#8B857A",
    line: "#E9E5DC",
    accent: "#A79A83",
    accentSoft: "#F0ECE3",
    plateFrom: "#F2EFE7",
    plateTo: "#DAD4C7",
  },
  typography: {
    script: "pinyon",
    display: "cormorant",
    sans: "jost",
    heroScale: "clamp(2.5rem, 10cqw, 6.5rem)",
    eyebrowTracking: "0.46em",
    namesItalic: false,
    namesSeparator: "et",
  },
  sections: MUSLIM_SECTIONS,
  animations: { envelope: true, curtain: false, revealDuration: 1.05, stagger: 0.1, parallax: false },
};
