import type { WeddingType } from "@/types/database";

/** Un rayon de la bibliotheque. Le mariage se range par confession,
 *  l'anniversaire par tranche d'age. */
export type CoverScope =
  | WeddingType
  | "jeune-ado"
  | "jeune-ado-fille"
  | "ado"
  | "ado-fille"
  | "adulte"
  | "adulte-femme";

/* ═══════════════════════════════════════════════════════════════
   LES EN-TÊTES DE MARIAGE
   Six images par confession, livrées avec le produit. Le couple en
   choisit une, ou envoie la sienne — dans les deux cas, la valeur
   finit dans `cover_image_url`. Une image choisie ici est donc un
   chemin local, pas une URL Supabase.
   ═══════════════════════════════════════════════════════════════ */

export interface CoverImage {
  id: string;
  label: string;
  scope: CoverScope;
  /** Affichée en plein cadre dans le hero. */
  src: string;
  /** Carrée, pour le sélecteur. */
  thumb: string;
}

function cover(scope: CoverScope, id: string, label: string): CoverImage {
  return {
    id,
    label,
    scope,
    src: `/entetes/${id}.webp`,
    thumb: `/entetes/${id}-vignette.webp`,
  };
}

export const COVER_LIBRARY: CoverImage[] = [
  /* ── Musulman ── */
  cover("musulman", "arche-ivoire", "Arche d’ivoire"),
  cover("musulman", "lanternes-voile", "Lanternes et voiles"),
  cover("musulman", "mosquee-nuages", "Mosquée dans les nuages"),
  cover("musulman", "coupole-aurore", "Coupole à l’aurore"),
  cover("musulman", "lanternes-eau", "Lanternes sur l’eau"),
  cover("musulman", "nuit-grenat", "Nuit grenat"),
  cover("musulman", "lustre-palais", "Lustre du palais"),
  cover("musulman", "coupole-blanche", "Coupole blanche"),
  cover("musulman", "paons-arche", "Paons sous l’arche"),

  /* ── Chrétien ── */
  cover("chretien", "perles-ivoire", "Perles et fleurs blanches"),
  cover("chretien", "cygnes-aquarelle", "Cygnes à l’aquarelle"),
  cover("chretien", "couple-porcelaine", "Couple de porcelaine"),
  cover("chretien", "nef-petales", "Nef aux pétales"),
  cover("chretien", "lys-nuages", "Lys et nuages"),
  cover("chretien", "cygnes-marbre", "Cygnes sur marbre"),
  cover("chretien", "nef-doree", "Nef dorée"),
  cover("chretien", "arche-roses", "Arche de roses"),
  cover("chretien", "voiles-bougies", "Voiles et bougies"),

  /* ── 11 – 14 ans ── */
  cover("jeune-ado", "ballons-ciel", "Ballons du ciel"),
  cover("jeune-ado", "ballons-nuit", "Ballons de nuit"),
  cover("jeune-ado", "ballon-glace", "Ballon de glace"),
  cover("jeune-ado", "bulles-bd", "Bulles de BD"),
  cover("jeune-ado", "terrain-neon", "Terrain néon"),
  cover("jeune-ado", "eclair-trame", "Éclair tramé"),

  /* ── 15 – 17 ans ── */
  cover("ado", "collage-nuit", "Collage de nuit"),
  cover("ado", "terrain-graffiti", "Terrain graffé"),
  cover("ado", "skyline-braise", "Skyline braise"),
  cover("ado", "bitume-bombes", "Bitume et bombes"),
  cover("ado", "grille-neon", "Grille néon"),
  cover("ado", "carbone-ligne", "Carbone et ligne rouge"),

  /* ── 18 ans et plus ── */
  cover("adulte", "bolide-ambre", "Bolide ambré"),
  cover("adulte", "costume-noir", "Costume noir"),
  cover("adulte", "cuir-orange", "Cuir orangé"),
  cover("adulte", "nuit-doree", "Nuit dorée"),
  cover("adulte", "marbre-nuit", "Marbre de nuit"),
  cover("adulte", "velours-emeraude", "Velours émeraude"),

  /* ── 11 – 14 ans, filles ── */
  cover("jeune-ado-fille", "perles-roses", "Perles et roses"),
  cover("jeune-ado-fille", "gemme-turquoise", "Gemme turquoise"),
  cover("jeune-ado-fille", "gemme-rose", "Gemme rose"),
  cover("jeune-ado-fille", "peluches-roses", "Peluches roses"),
  cover("jeune-ado-fille", "ciel-papillons", "Ciel aux papillons"),
  cover("jeune-ado-fille", "ourson-violet", "Ourson violet"),

  /* ── 15 – 17 ans, filles ── */
  cover("ado-fille", "ourson-rose", "Ourson à la rose"),
  cover("ado-fille", "coeurs-duveteux", "Cœurs duveteux"),
  cover("ado-fille", "petales-nuage", "Pétales et nuage"),
  cover("ado-fille", "chateau-rose", "Château rose"),
  cover("ado-fille", "marbre-poudre", "Marbre poudré"),
  cover("ado-fille", "couronne-rose", "Couronne rose"),

  /* ── 18 ans et plus, femmes ── */
  cover("adulte-femme", "neon-magenta", "Néon magenta"),
  cover("adulte-femme", "arbre-a-coeurs", "Arbre à cœurs"),
  cover("adulte-femme", "lune-carmin", "Lune carmin"),
  cover("adulte-femme", "lune-rose", "Lune rose"),
  cover("adulte-femme", "roses-rouges", "Roses rouges"),
  cover("adulte-femme", "caleche-nuit", "Calèche de nuit"),
];

export function coversFor(scope: CoverScope): CoverImage[] {
  return COVER_LIBRARY.filter((image) => image.scope === scope);
}

/** L’en-tête proposé par défaut, tant que rien n’a été choisi. */
export function defaultCoverFor(scope: CoverScope): string {
  return coversFor(scope)[0]!.src;
}

/** Une couverture envoyée par le couple n’est pas dans la bibliothèque :
 *  c’est ce qui permet au sélecteur de savoir quoi surligner. */
export function isLibraryCover(url: string | null | undefined): boolean {
  return Boolean(url && COVER_LIBRARY.some((image) => image.src === url));
}


/** Le rayon d'en-tetes d'une collection, s'il en existe un. Les
 *  collections enfants n'en ont pas : leur hero garde son degrade. */
const SCOPES = new Set<string>([
  "jeune-ado", "jeune-ado-fille", "ado", "ado-fille", "adulte", "adulte-femme",
]);

export function coverScopeOfAudience(audience?: string): CoverScope | null {
  return audience && SCOPES.has(audience) ? (audience as CoverScope) : null;
}
