import type { NextConfig } from "next";

const supabaseHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : null;
  } catch {
    return null;
  }
})();

const enProduction = process.env.NODE_ENV === "production";
const supabase = supabaseHost ? `https://${supabaseHost}` : "";
const supabaseWs = supabaseHost ? `wss://${supabaseHost}` : "";

/* ═══════════════════════════════════════════════════════════════
   POLITIQUE DE SECURITE DU CONTENU

   Ce que ça empêche concrètement : qu'un script injecté — par un
   commentaire, une dépendance compromise, une extension — puisse
   charger du code depuis un domaine tiers ou renvoyer les données du
   couple ailleurs. `connect-src` est la ligne qui compte : même du
   code exécuté dans la page ne peut parler qu'à nous et à Supabase.

   `unsafe-inline` sur les scripts est requis par Next : le routeur
   applicatif écrit les données d'hydratation dans des balises
   `<script>` en clair. Le supprimer demanderait un nonce posé par le
   middleware sur chaque réponse — faisable, mais ça casse le cache
   statique des pages d'invitation, qui sont l'essentiel du trafic.

   `unsafe-eval` n'est ajouté qu'en développement : le rafraîchissement
   à chaud en a besoin, la production non.

   `frame-ancestors 'none'` interdit qu'on encadre le site dans un
   iframe — c'est ce qui rend le détournement de clic impossible.
   ═══════════════════════════════════════════════════════════════ */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${enProduction ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${supabase}`.trim(),
  `media-src 'self' blob: ${supabase}`.trim(),
  "font-src 'self' data:",
  `connect-src 'self' ${supabase} ${supabaseWs}`.trim(),
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const enTetesDeSecurite = [
  { key: "Content-Security-Policy", value: csp },
  /* Un an, sous-domaines compris. Une fois posé, un navigateur qui a
     déjà visité le site refuse de repasser en HTTP, même si on l'y
     redirige. */
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  /* Empêche un navigateur de deviner qu'un fichier .txt est en fait du
     JavaScript, ce qui transforme un envoi de photo en script. */
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  /* Le lien d'une invitation ne doit pas fuiter vers les sites que
     l'invité visite ensuite : un slug est une adresse privée. */
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  /* Ne pas annoncer le framework et sa version : c'est la première
     chose que lit un scanner automatique pour choisir ses exploits. */
  poweredByHeader: false,

  async headers() {
    return [
      /* Les invitations sont partagées à des centaines de personnes en
         même temps. Images, polices et musiques sont figées : on les
         laisse une année en cache CDN, le serveur ne les revoit jamais. */
      {
        source: "/:path*.(png|jpg|jpeg|webp|avif|svg|mp3|m4a|woff2)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      { source: "/:path*", headers: enTetesDeSecurite },
      /* Le tableau de bord et l'administration ne s'indexent pas, et ne
         se mettent pas en cache chez un intermédiaire. */
      {
        source: "/(dashboard|admin)/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
      /* Aucune route d'API ne doit être mise en cache : les webhooks et
         le diagnostic répondent différemment à chaque appel. */
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
  experimental: { optimizePackageImports: ["motion"] },
};

export default nextConfig;
