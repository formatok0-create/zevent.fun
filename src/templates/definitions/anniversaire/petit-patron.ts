import type { TemplateDefinition } from "../../types";
import { BIRTHDAY_SECTIONS } from "./sections";

/** TENDRE — Ciel pâle, nuages et nœud papillon. Pour les tout
 *  premiers âges, quand la fête est surtout celle des parents. */
export const petitPatron: TemplateDefinition = {
  id: "petit-patron",
  name: "Petit Patron",
  tagline: "Ciel pâle, nuages et nœud papillon. Le costume est déjà prêt.",
  category: "tendre",
  product: "anniversaire",
  supportedWeddingTypes: [],
  audience: "garcon",
  ageRange: "1 – 4 ans",
  decor: "patron",
  preview: { from: "#CDE8FA", to: "#5AA3D8", accent: "#2B7FC4" },
  colors: {
    background: "#F4FAFF",
    surface: "#FFFFFF",
    ink: "#16324F",
    inkSoft: "#6C8AA6",
    line: "#D9E9F5",
    accent: "#2B7FC4",
    accentSoft: "#E3F1FB",
    plateFrom: "#CDE8FA",
    plateTo: "#5AA3D8",
  },
  typography: {
    script: "baloo",
    display: "baloo",
    sans: "jost",
    heroScale: "clamp(2.4rem, 10cqw, 5rem)",
    eyebrowTracking: "0.28em",
    namesItalic: false,
    namesSeparator: "&",
  },
  sections: BIRTHDAY_SECTIONS,
  animations: { envelope: true, curtain: true, revealDuration: 1.1, stagger: 0.12, parallax: true },
};
