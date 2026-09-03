import type { TemplateDefinition } from "../../types";
import { BIRTHDAY_SECTIONS } from "./sections";

/** FÉERIQUE — Licorne, arcs-en-ciel et pastels. La plus joyeuse
 *  des quatre, et de loin la plus colorée. */
export const licorne: TemplateDefinition = {
  id: "licorne",
  name: "Licorne",
  tagline: "Licorne, arcs-en-ciel et pastels. La plus joyeuse des quatre.",
  category: "feerique",
  product: "anniversaire",
  supportedWeddingTypes: [],
  audience: "fille",
  ageRange: "1 – 8 ans",
  decor: "licorne",
  preview: { from: "#FBDCEF", to: "#8FD3E8", accent: "#C93C86" },
  colors: {
    background: "#FFF9FC",
    surface: "#FFFFFF",
    ink: "#43305B",
    inkSoft: "#8977A3",
    line: "#F1E3F1",
    accent: "#D5479B",
    accentSoft: "#FCE9F4",
    plateFrom: "#FBDCEF",
    plateTo: "#8FD3E8",
  },
  typography: {
    script: "baloo",
    display: "baloo",
    sans: "outfit",
    heroScale: "clamp(2.6rem, 11cqw, 5.5rem)",
    eyebrowTracking: "0.24em",
    namesItalic: false,
    namesSeparator: "&",
  },
  sections: BIRTHDAY_SECTIONS,
  animations: { envelope: true, curtain: false, revealDuration: 0.95, stagger: 0.1, parallax: true },
};
