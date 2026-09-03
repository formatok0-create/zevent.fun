import type { TemplateDefinition } from "../../types";
import { CHRISTIAN_SECTIONS } from "./sections";

/** TRADITIONNEL — Pierre claire, or discret, la solennité d’une nef. */
export const chapelle: TemplateDefinition = {
  id: "chapelle",
  name: "Chapelle",
  tagline: "Pierre claire, or discret, la solennité d’une nef.",
  category: "traditionnel",
  supportedWeddingTypes: ["chretien"],
  preview: { from: "#EFEADC", to: "#C6B995", accent: "#A8905C" },
  colors: {
    background: "#F7F4ED",
    surface: "#FFFDF8",
    ink: "#3B342A",
    inkSoft: "#877E6F",
    line: "#E5DFD1",
    accent: "#A8905C",
    accentSoft: "#EDE5D2",
    plateFrom: "#EFEADC",
    plateTo: "#C6B995",
  },
  typography: {
    script: "pinyon",
    display: "cinzel",
    sans: "cormorant",
    heroScale: "clamp(2.6rem, 10cqw, 6.5rem)",
    eyebrowTracking: "0.4em",
    namesItalic: false,
    namesSeparator: "et",
  },
  sections: CHRISTIAN_SECTIONS,
  animations: { envelope: true, curtain: true, revealDuration: 1.2, stagger: 0.13, parallax: true },
};
