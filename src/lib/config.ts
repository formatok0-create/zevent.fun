/**
 * Une variable saisie a la main finit souvent par arriver avec ses
 * guillemets ou un saut de ligne — on colle la ligne entiere du .env
 * dans le champ, guillemets compris. Supabase repond alors 401 et
 * rien ne dit pourquoi. On nettoie a la lecture, une fois pour toutes.
 */
function propre(valeur: string | undefined): string | undefined {
  if (!valeur) return undefined;
  const nettoye = valeur.trim().replace(/^["']|["']$/g, "").trim();
  return nettoye || undefined;
}

/**
 * Le domaine de production est le seul que les prestataires de
 * paiement connaissent : SasPay refuse une `return_url` et une URL de
 * webhook qui ne sont pas sur le domaine declare dans son tableau de
 * bord. Or `NEXT_PUBLIC_SITE_URL` finit souvent par contenir l'URL de
 * deploiement Vercel — soit qu'on l'ait copiee, soit qu'on ait branche
 * `VERCEL_URL`. On la refuse explicitement plutot que d'envoyer le
 * client sur une page que le prestataire rejette.
 */
const URL_PAR_DEFAUT = "https://zevent.fun";

function urlDuSite(): string {
  const declaree = propre(process.env.NEXT_PUBLIC_SITE_URL);
  if (!declaree) return URL_PAR_DEFAUT;

  /* On accepte `zevent.fun` sans schema : c'est ce qu'on saisit
     naturellement dans un champ intitule « domaine ». */
  const avecSchema = /^https?:\/\//i.test(declaree) ? declaree : `https://${declaree}`;

  let hote: string;
  try {
    hote = new URL(avecSchema).hostname;
  } catch {
    /* Valeur inexploitable : mieux vaut le domaine de production
       qu'une URL que personne n'atteindra. */
    return URL_PAR_DEFAUT;
  }

  if (/(^|\.)vercel\.app$/i.test(hote)) return URL_PAR_DEFAUT;
  return avecSchema.replace(/\/+$/, "");
}

export const SITE = {
  name: "Zevent",
  domain: "zevent.fun",
  url: urlDuSite(),
  tagline: "The digital wedding experience",
  description:
    "Créez une invitation de mariage digitale élégante, immersive et entièrement personnalisée. Une expérience, pas un simple faire-part.",
} as const;

const url = propre(process.env.NEXT_PUBLIC_SUPABASE_URL);
const key = propre(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/**
 * Quand Supabase n’est pas configuré, l’application bascule sur un
 * magasin de démonstration en mémoire (src/lib/demo). Cela permet de
 * lancer `npm run dev` sans aucune dépendance externe.
 */
export const isSupabaseConfigured = Boolean(url && key);

export const supabaseConfig = {
  url: url ?? "",
  anonKey: key ?? "",
  buckets: {
    covers: "invitation-covers",
    gallery: "invitation-gallery",
    portraits: "invitation-portraits",
    album: "invitation-album",
    music: "invitation-music",
    avatars: "avatars",
  },
} as const;

export const STORAGE_LIMITS = {
  imageMaxBytes: 5 * 1024 * 1024,
  imageMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
  audioMaxBytes: 6 * 1024 * 1024,
  audioMimeTypes: ["audio/mpeg", "audio/mp4", "audio/aac", "audio/ogg"],
} as const;

/** En-tête par défaut : l’arche orientale, utilisée tant que le
 *  couple n’a pas choisi sa propre photo de couverture. */
export const DEFAULT_COVERS = {
  musulman: "/entetes/arche-ivoire.webp",
  chretien: "/entetes/perles-ivoire.webp",
} as const;

export const DEFAULT_COVER = DEFAULT_COVERS.musulman;
