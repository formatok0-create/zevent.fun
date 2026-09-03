import type { TemplateDefinition } from "../../types";
import { BIRTHDAY_SECTIONS } from "./sections";

/** FÉERIQUE — Givre, flocons et bleu de glace. Le royaume d’hiver,
 *  sans personnage : la neige suffit. */
export const cristal: TemplateDefinition = {
  id: "cristal",
  name: "Cristal",
  tagline: "Givre, flocons et bleu de glace. Le royaume d’hiver.",
  category: "feerique",
  product: "anniversaire",
  supportedWeddingTypes: [],
  audience: "fille",
  ageRange: "3 – 10 ans",
  decor: "cristal",
  preview: { from: "#DCE7FB", to: "#6D86D4", accent: "#F4F8FF" },
  colors: {
    background: "#F6F8FF",
    surface: "#FFFFFF",
    ink: "#22305C",
    inkSoft: "#6E7BA8",
    line: "#DFE5F7",
    accent: "#5C7BD1",
    accentSoft: "#E8EEFC",
    plateFrom: "#DCE7FB",
    plateTo: "#6D86D4",
  },
  typography: {
    script: "baloo",
    display: "baloo",
    sans: "outfit",
    heroScale: "clamp(2.6rem, 11cqw, 5.5rem)",
    eyebrowTracking: "0.26em",
    namesItalic: false,
    namesSeparator: "&",
  },
  sections: BIRTHDAY_SECTIONS,
  animations: { envelope: true, curtain: true, revealDuration: 1.05, stagger: 0.11, parallax: true },
};
