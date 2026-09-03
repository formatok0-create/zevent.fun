import type { WeddingType } from "@/types/database";
import type {
  BirthdayBracket,
  TemplateAudience,
  TemplateDefinition,
  TemplateProduct,
} from "./types";
import type { CoverScope } from "@/lib/covers";

/* ── Mariage musulman ─────────────────────────────────────────
   Cinq écritures. Structure : prénoms et portraits, message des
   familles, cérémonies classées par heure, walima. */
import { roseDeDamas } from "./definitions/musulman/rose-de-damas";
import { meridien } from "./definitions/musulman/meridien";
import { nacre } from "./definitions/musulman/nacre";
import { zellige } from "./definitions/musulman/zellige";
import { nuitDeHenne } from "./definitions/musulman/nuit-de-henne";

/* ── Mariage chrétien ─────────────────────────────────────────
   Même ossature, décor de nuages : coutumier, civil, religieux. */
import { dolce } from "./definitions/chretien/dolce";
import { chapelle } from "./definitions/chretien/chapelle";
import { aurore } from "./definitions/chretien/aurore";
import { lin } from "./definitions/chretien/lin";
import { roseraie } from "./definitions/chretien/roseraie";

/* ── Anniversaire ─────────────────────────────────────────────
   Quatre écritures pour les garçons de 1 à 10 ans. Même ossature
   que le mariage, mais l’album des années en plus. */
import { royaume } from "./definitions/anniversaire/royaume";
import { comics } from "./definitions/anniversaire/comics";
import { petitPatron } from "./definitions/anniversaire/petit-patron";
import { cosmos } from "./definitions/anniversaire/cosmos";
import { cristal } from "./definitions/anniversaire/cristal";
import { papillons } from "./definitions/anniversaire/papillons";
import { licorne } from "./definitions/anniversaire/licorne";
import { lagon } from "./definitions/anniversaire/lagon";
import { arene } from "./definitions/anniversaire/arene";
import { voltage } from "./definitions/anniversaire/voltage";
import { nuitBleue } from "./definitions/anniversaire/nuit-bleue";
import { bitume } from "./definitions/anniversaire/bitume";
import { neon } from "./definitions/anniversaire/neon";
import { braise } from "./definitions/anniversaire/braise";
import { smoking } from "./definitions/anniversaire/smoking";
import { ambre } from "./definitions/anniversaire/ambre";
import { emeraude } from "./definitions/anniversaire/emeraude";
import { perle } from "./definitions/anniversaire/perle";
import { gemme } from "./definitions/anniversaire/gemme";
import { nuage } from "./definitions/anniversaire/nuage";
import { veloursRose } from "./definitions/anniversaire/velours-rose";
import { petales } from "./definitions/anniversaire/petales";
import { chateau } from "./definitions/anniversaire/chateau";
import { rubis } from "./definitions/anniversaire/rubis";
import { magenta } from "./definitions/anniversaire/magenta";
import { lune } from "./definitions/anniversaire/lune";

/* Ajouter un template : importer sa définition et l’ajouter ici.
   Aucune autre modification n’est nécessaire dans l’application. */
const REGISTRY: TemplateDefinition[] = [
  dolce,
  aurore,
  lin,
  roseraie,
  chapelle,
  roseDeDamas,
  meridien,
  nacre,
  zellige,
  nuitDeHenne,
  royaume,
  comics,
  petitPatron,
  cosmos,
  cristal,
  papillons,
  licorne,
  lagon,
  arene,
  voltage,
  nuitBleue,
  bitume,
  neon,
  braise,
  smoking,
  ambre,
  emeraude,
  perle,
  gemme,
  nuage,
  veloursRose,
  petales,
  chateau,
  rubis,
  magenta,
  lune,
];

export const DEFAULT_TEMPLATE_ID = dolce.id;
export const DEFAULT_BIRTHDAY_TEMPLATE_ID = royaume.id;
export const DEFAULT_BIRTHDAY_TEMPLATE_BY_AUDIENCE: Record<TemplateAudience, string> = {
  garcon: royaume.id,
  fille: licorne.id,
  "jeune-ado": arene.id,
  "jeune-ado-fille": perle.id,
  ado: bitume.id,
  "ado-fille": veloursRose.id,
  adulte: smoking.id,
  "adulte-femme": rubis.id,
};

/** tranche + genre -> public. Les enfants gardent leurs deux noms
 *  historiques ; les autres tranches suffixent le feminin. */
export function audienceOf2(
  bracket: BirthdayBracket,
  genre: "garcon" | "fille",
): TemplateAudience {
  if (bracket === "enfant") return genre;
  if (genre === "garcon") return bracket;
  return bracket === "adulte" ? "adulte-femme" : (`${bracket}-fille` as TemplateAudience);
}

/* ── Les tranches d'age du produit anniversaire ──────────────
   Une seule table : bornes, libelle, public et rayon d'en-tetes.
   Tout le parcours s'y refere, du selecteur a la validation. */
export const BIRTHDAY_BRACKETS = {
  enfant: { label: "Enfant", range: "1 – 10 ans", min: 1, max: 10 },
  "jeune-ado": { label: "Jeune adolescent", range: "11 – 14 ans", min: 11, max: 14 },
  ado: { label: "Adolescent", range: "15 – 17 ans", min: 15, max: 17 },
  adulte: { label: "Adulte", range: "18 ans et plus", min: 18, max: 120 },
} as const satisfies Record<BirthdayBracket, {
  label: string;
  range: string;
  min: number;
  max: number;
}>;

export function bracketOfAudience(audience?: TemplateAudience): BirthdayBracket {
  if (!audience) return "enfant";
  const base = audience.replace(/-fille$|-femme$/, "");
  if (base === "jeune-ado" || base === "ado" || base === "adulte") return base;
  return "enfant";
}

/** Un template sans `product` appartient au mariage : les dix
 *  collections existantes n’ont pas eu à être modifiées. */
export function productOf(template: TemplateDefinition): TemplateProduct {
  return template.product ?? "mariage";
}

/** Par défaut, le mariage : tous les appels existants gardent
 *  exactement le même résultat qu’avant l’arrivée de la fête. */
export function listTemplates(): TemplateDefinition[] {
  return REGISTRY.filter((t) => productOf(t) === "mariage");
}

export function listTemplatesForProduct(
  product: TemplateProduct,
  audience?: TemplateAudience,
): TemplateDefinition[] {
  return REGISTRY.filter(
    (t) => productOf(t) === product && (!audience || t.audience === audience),
  );
}

/** A quel public appartient une collection deja choisie ? Sert a
 *  rouvrir le bon parcours quand on modifie une invitation. */
export function audienceOf(templateId: string): TemplateAudience | undefined {
  return REGISTRY.find((t) => t.id === templateId)?.audience;
}

export function listTemplatesFor(type: WeddingType): TemplateDefinition[] {
  return REGISTRY.filter((t) => t.supportedWeddingTypes.includes(type));
}

export function getTemplate(id: string | null | undefined): TemplateDefinition {
  return REGISTRY.find((t) => t.id === id) ?? dolce;
}

export function templateExists(id: string): boolean {
  return REGISTRY.some((t) => t.id === id);
}

/** Le décor propre à chaque religion : nuages ou entrelacs. */
export function isChristian(template: TemplateDefinition): boolean {
  return template.supportedWeddingTypes.includes("chretien");
}
