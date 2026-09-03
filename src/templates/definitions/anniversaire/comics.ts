import type { TemplateDefinition } from "../../types";
import { BIRTHDAY_SECTIONS } from "./sections";

/** POP — Trame de points, éclairs et bulles. La double page d’une
 *  bande dessinée, avec son nom en couverture. */
export const comics: TemplateDefinition = {
  id: "comics",
  name: "Comics",
  tagline: "Trame de points, éclairs et bulles. Le héros, c’est lui.",
  category: "pop",
  product: "anniversaire",
  supportedWeddingTypes: [],
  audience: "garcon",
  ageRange: "4 – 10 ans",
  decor: "comics",
  preview: { from: "#FFD24A", to: "#D82C2C", accent: "#17224A" },
  colors: {
    background: "#FDF7E7",
    surface: "#FFFFFF",
    ink: "#17224A",
    inkSoft: "#5A648C",
    line: "#EADEC4",
    accent: "#D82C2C",
    accentSoft: "#FDE7E1",
    plateFrom: "#FFD24A",
    plateTo: "#D82C2C",
  },
  typography: {
    script: "baloo",
    display: "outfit",
    sans: "outfit",
    heroScale: "clamp(2.6rem, 11cqw, 5.5rem)",
    eyebrowTracking: "0.26em",
    namesItalic: false,
    namesSeparator: "&",
  },
  sections: BIRTHDAY_SECTIONS,
  animations: { envelope: true, curtain: false, revealDuration: 0.8, stagger: 0.09, parallax: true },
};
