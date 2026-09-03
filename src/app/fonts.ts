import {
  Baloo_2,
  Great_Vibes,
  Pinyon_Script,
  Cormorant_Garamond,
  Playfair_Display,
  Italiana,
  Cinzel,
  Amiri,
  Marcellus,
  Jost,
  Outfit,
  Bodoni_Moda,
  Montserrat,
  Fredoka,
} from "next/font/google";

/* ═══════════════════════════════════════════════════════════════
   LES VOIX
   Chaque collection a sa propre écriture. Une calligraphie pour les
   prénoms, une romaine pour le texte : c’est le couple de polices
   qui distingue une collection d’une autre, bien plus qu’une teinte.
   ═══════════════════════════════════════════════════════════════ */

/* — Calligraphies — */
export const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--f-great-vibes", display: "swap" });
export const pinyon = Pinyon_Script({ subsets: ["latin"], weight: "400", variable: "--f-pinyon", display: "swap" });

/* — Romaines de titre — */
export const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "500"], style: ["normal", "italic"], variable: "--f-cormorant", display: "swap" });
export const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"], style: ["normal", "italic"], variable: "--f-playfair", display: "swap" });
export const italiana = Italiana({ subsets: ["latin"], weight: "400", variable: "--f-italiana", display: "swap" });
export const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "500"], variable: "--f-cinzel", display: "swap" });
export const amiri = Amiri({ subsets: ["latin"], weight: ["400", "700"], style: ["normal", "italic"], variable: "--f-amiri", display: "swap" });
export const marcellus = Marcellus({ subsets: ["latin"], weight: "400", variable: "--f-marcellus", display: "swap" });
export const bodoni = Bodoni_Moda({ subsets: ["latin"], weight: ["400", "500", "600", "700"], style: ["normal", "italic"], variable: "--f-bodoni", display: "swap" });

/* — Linéales d’interface — */
export const jost = Jost({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--f-jost", display: "swap" });
export const baloo = Baloo_2({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--f-baloo", display: "swap" });
export const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--f-outfit", display: "swap" });

/* La linéale de la voix cerise : plus large et plus ronde que Jost,
   c'est elle qui porte la navigation, les intitulés et les boutons. */
/* La ronde de la fête : grasse, arrondie, elle sait crier sans hurler.
   Outfit reste pour le texte long — une display sur dix lignes fatigue. */
export const fredoka = Fredoka({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--f-fredoka", display: "swap" });

export const montserrat = Montserrat({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--f-montserrat", display: "swap" });

/** Identifiants utilisables dans une définition de template. */
export type FontKey =
  | "great-vibes"
  | "pinyon"
  | "cormorant"
  | "playfair"
  | "italiana"
  | "cinzel"
  | "amiri"
  | "marcellus"
  | "bodoni"
  | "jost"
  | "outfit"
  | "baloo"
  | "montserrat"
  | "fredoka";

export const FONT_STACKS: Record<FontKey, string> = {
  "great-vibes": "var(--f-great-vibes), cursive",
  pinyon: "var(--f-pinyon), cursive",
  cormorant: "var(--f-cormorant), Georgia, serif",
  playfair: "var(--f-playfair), Georgia, serif",
  italiana: "var(--f-italiana), Georgia, serif",
  cinzel: "var(--f-cinzel), Georgia, serif",
  amiri: "var(--f-amiri), Georgia, serif",
  marcellus: "var(--f-marcellus), Georgia, serif",
  bodoni: "var(--f-bodoni), Georgia, serif",
  jost: "var(--f-jost), system-ui, sans-serif",
  outfit: "var(--f-outfit), system-ui, sans-serif",
  baloo: "var(--f-baloo), ui-rounded, system-ui, sans-serif",
  montserrat: "var(--f-montserrat), system-ui, sans-serif",
  fredoka: "var(--f-fredoka), ui-rounded, system-ui, sans-serif",
};

export const fontVariables = [
  greatVibes.variable,
  pinyon.variable,
  cormorant.variable,
  playfair.variable,
  italiana.variable,
  cinzel.variable,
  amiri.variable,
  marcellus.variable,
  bodoni.variable,
  jost.variable,
  outfit.variable,
  baloo.variable,
  montserrat.variable,
  fredoka.variable,
].join(" ");
