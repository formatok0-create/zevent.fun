import type { TemplateDefinition } from "../../types";
import { BIRTHDAY_SECTIONS } from "./sections";

/** POÉTIQUE — Papillons, fleurs et rose poudré. Une couronne
 *  végétale autour du prénom. */
export const papillons: TemplateDefinition = {
  id: "papillons",
  name: "Papillons",
  tagline: "Papillons, fleurs et rose poudré. Une couronne autour du prénom.",
  category: "poetique",
  product: "anniversaire",
  supportedWeddingTypes: [],
  audience: "fille",
  ageRange: "2 – 10 ans",
  decor: "papillons",
  preview: { from: "#F7DCEC", to: "#C87FB8", accent: "#8E2F6E" },
  colors: {
    background: "#FDF5FA",
    surface: "#FFFFFF",
    ink: "#4A2340",
    inkSoft: "#8C6580",
    line: "#F2DFEB",
    accent: "#C43C93",
    accentSoft: "#FBE7F3",
    plateFrom: "#F7DCEC",
    plateTo: "#C87FB8",
  },
  typography: {
    script: "baloo",
    display: "baloo",
    sans: "jost",
    heroScale: "clamp(2.5rem, 10.5cqw, 5.25rem)",
    eyebrowTracking: "0.28em",
    namesItalic: false,
    namesSeparator: "&",
  },
  sections: BIRTHDAY_SECTIONS,
  animations: { envelope: true, curtain: true, revealDuration: 1.1, stagger: 0.12, parallax: true },
};
