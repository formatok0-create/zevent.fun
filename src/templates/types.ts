import type { WeddingType } from "@/types/database";
import { FONT_STACKS, type FontKey } from "@/app/fonts";

/* ═══════════════════════════════════════════════════════════════
   SYSTEME DE TEMPLATES
   Un template = une definition declarative. Aucun composant de
   l’application ne connait un template en particulier : tout passe
   par TemplateDefinition. Ajouter un template = ajouter un fichier
   dans /definitions + une ligne dans le registry.
   ═══════════════════════════════════════════════════════════════ */

/** Un template appartient à un produit. Par défaut, au mariage :
 *  les dix collections existantes n’ont rien à déclarer. */
export type TemplateProduct = "mariage" | "anniversaire";

/** Le décor de fond, dessiné en SVG. */
export type TemplateDecor =
  | "clouds" | "moorish"
  | "royaume" | "comics" | "patron" | "cosmos"
  | "cristal" | "papillons" | "licorne" | "lagon";

/** A qui s'adresse la collection. Le mariage n'en a pas. */
export type TemplateAudience =
  | "garcon"
  | "fille"
  | "jeune-ado"
  | "jeune-ado-fille"
  | "ado"
  | "ado-fille"
  | "adulte"
  | "adulte-femme";

/** Les quatre tranches du produit anniversaire. */
export type BirthdayBracket = "enfant" | "jeune-ado" | "ado" | "adulte";

export type TemplateCategory =
  | "editorial"
  | "romantique"
  | "moderne"
  | "minimal"
  | "oriental"
  | "traditionnel"
  | "aventure"
  | "pop"
  | "tendre"
  | "feerique"
  | "poetique"
  | "tropical"
  | "urbain"
  | "nocturne"
  | "sobre"
  | "cosmique";

/** Sections disponibles sur la page publique. L’ordre du tableau
 *  `sections` d’un template determine l’ordre de rendu. */
export type SectionId =
  | "hero"
  | "couple"
  | "familles"
  | "ceremonies"
  | "annonce"
  | "countdown"
  | "story"
  | "gallery"
  | "details"
  | "program"
  | "closing"
  /* ── Sections de la fête ── */
  | "heroFete"
  | "motFete"
  | "album"
  | "galleryFete"
  | "closingFete";

export interface TemplateSection {
  id: SectionId;
  /** Peut etre masquee par l’utilisateur depuis l’editeur. */
  optional?: boolean;
  /** Variante de mise en page propre au template. */
  variant?: string;
}

export interface TemplateColors {
  background: string;
  surface: string;
  ink: string;
  inkSoft: string;
  line: string;
  accent: string;
  accentSoft: string;
  /** Couleur des aplats photo / plaques. */
  plateFrom: string;
  plateTo: string;
}

export interface TemplateTypography {
  /** La calligraphie des prénoms — l’écriture qui signe la collection. */
  script: FontKey;
  /** La romaine des titres de section. */
  display: FontKey;
  /** La linéale du texte courant et des capitales. */
  sans: FontKey;
  heroScale: string;
  eyebrowTracking: string;
  namesItalic: boolean;
  namesSeparator: "&" | "et" | "·" | "×" | "—";
}

export interface TemplateAnimations {
  /** Écran-enveloppe « Appuyez pour ouvrir ». C’est ce geste qui
   *  autorise la musique : aucun navigateur mobile ne la lance seul. */
  envelope: boolean;
  /** Rideau d’ouverture au chargement de l’invitation. */
  curtain: boolean;
  /** Duree de base des reveals, en secondes. */
  revealDuration: number;
  /** Decalage entre elements d’un meme groupe. */
  stagger: number;
  /** Parallaxe sur le hero. */
  parallax: boolean;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  /** Phrase qui vend le template dans le selecteur. */
  tagline: string;
  category: TemplateCategory;
  /** Absent = mariage. */
  product?: TemplateProduct;
  supportedWeddingTypes: WeddingType[];
  /** Tranche d’âge visée, pour le sélecteur de la fête. */
  ageRange?: string;
  audience?: TemplateAudience;
  decor?: TemplateDecor;
  /** Apercu : degrade genere, remplacable par une vraie image plus tard. */
  preview: { from: string; to: string; accent: string; image?: string };
  colors: TemplateColors;
  typography: TemplateTypography;
  sections: TemplateSection[];
  animations: TemplateAnimations;
  /** Marqueur pour les templates a venir (non selectionnables). */
  comingSoon?: boolean;
}

/** Variables CSS injectees sur la racine de la page publique. */
export function templateCssVars(t: TemplateDefinition): Record<string, string> {
  return {
    "--tpl-bg": t.colors.background,
    "--tpl-surface": t.colors.surface,
    "--tpl-ink": t.colors.ink,
    "--tpl-ink-soft": t.colors.inkSoft,
    "--tpl-line": t.colors.line,
    "--tpl-accent": t.colors.accent,
    "--tpl-accent-soft": t.colors.accentSoft,
    "--tpl-plate-from": t.colors.plateFrom,
    "--tpl-plate-to": t.colors.plateTo,
    "--tpl-hero-scale": t.typography.heroScale,
    "--tpl-tracking": t.typography.eyebrowTracking,
    "--tpl-script": FONT_STACKS[t.typography.script],
    "--tpl-display": FONT_STACKS[t.typography.display],
    "--tpl-sans": FONT_STACKS[t.typography.sans],
  };
}
