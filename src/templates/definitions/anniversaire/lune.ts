import type { TemplateDefinition } from "../../types";
import { BIRTHDAY_SECTIONS } from "./sections";

/** NOCTURNE — Pleine lune rose derrière les branches. */
export const lune: TemplateDefinition = {
  id: "lune",
  name: "Lune",
  tagline: "Pleine lune rose derrière les branches.",
  category: "nocturne",
  product: "anniversaire",
  supportedWeddingTypes: [],
  audience: "adulte-femme",
  ageRange: "18 ans et plus",
  preview: { from: "#43103A", to: "#0F050D", accent: "#F05FB0" },
  colors: {
    background: "#140812",
    surface: "#1F0D1C",
    ink: "#F8EAF4",
    inkSoft: "#B392AB",
    line: "#2E152A",
    accent: "#F05FB0",
    accentSoft: "#1A0917",
    plateFrom: "#43103A",
    plateTo: "#0F050D",
  },
  typography: {
    script: "bodoni",
    display: "bodoni",
    sans: "outfit",
    heroScale: "clamp(2.5rem, 10.5cqw, 5.25rem)",
    eyebrowTracking: "0.24em",
    namesItalic: false,
    namesSeparator: "&",
  },
  sections: BIRTHDAY_SECTIONS,
  animations: { envelope: true, curtain: true, revealDuration: 1, stagger: 0.1, parallax: true },
};
