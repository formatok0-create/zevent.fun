import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/config";
import { updateSession } from "@/lib/supabase/middleware";
import { DEMO_COOKIE } from "@/lib/demo/cookie";

/* `/admin` était absent : la garde tenait uniquement dans le layout,
   via `requireAdmin()`. Ça suffisait — mais une garde unique est une
   garde qu'un refactor peut retirer sans que rien n'échoue. Le
   middleware la double, avant tout rendu. */
const PRIVATE = ["/dashboard", "/admin"];
const AUTH_ONLY = ["/login", "/register", "/forgot-password"];

/* ═══════════════════════════════════════════════════════════════
   UN SEUL DOMAINE

   Vercel sert la meme application sur `zevent.fun` et sur son
   domaine de deploiement. Les deux marchent, donc on finit par
   utiliser les deux — et c'est la que tout casse :

   · SasPay ne connait que le domaine declare dans son tableau de
     bord. Une `return_url` ou une URL de webhook sur *.vercel.app
     est refusee, et la page de paiement ne s'ouvre jamais.
   · Le cookie de session appartient au domaine qui l'a pose. Se
     connecter sur le domaine Vercel puis revenir sur zevent.fun,
     c'est revenir deconnecte.

   On tranche ici, une fois : en production, tout ce qui arrive par
   un domaine Vercel repart sur le domaine declare. La redirection
   est permanente pour que les liens deja partages se corrigent
   d'eux-memes.
   ═══════════════════════════════════════════════════════════════ */
const DOMAINE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://zevent.fun")
  .trim()
  .replace(/^["']|["']$/g, "")
  .replace(/\/+$/, "");

function canoniser(request: NextRequest): NextResponse | null {
  if (process.env.VERCEL_ENV !== "production") return null;
  const hote = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
  if (!hote.endsWith(".vercel.app")) return null;
  let cible: URL;
  try {
    cible = new URL(DOMAINE);
  } catch {
    return null;
  }
  if (cible.hostname.endsWith(".vercel.app")) return null;
  const url = request.nextUrl.clone();
  url.protocol = "https:";
  url.host = cible.host;
  url.port = "";
  return NextResponse.redirect(url, 308);
}

export async function middleware(request: NextRequest) {
  const canonique = canoniser(request);
  if (canonique) return canonique;

  const { pathname } = request.nextUrl;
  const isPrivate = PRIVATE.some((p) => pathname.startsWith(p));
  const isAuthOnly = AUTH_ONLY.some((p) => pathname.startsWith(p));

  let signedIn: boolean;
  let response = NextResponse.next({ request });

  if (isSupabaseConfigured) {
    const result = await updateSession(request);
    response = result.response;
    signedIn = Boolean(result.user);
  } else {
    signedIn = Boolean(request.cookies.get(DEMO_COOKIE)?.value);
  }

  if (isPrivate && !signedIn) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  /* Si la session a expiré côté serveur (mode démo sur serverless),
     la page de connexion le signale par ?session=expiree. On laisse
     alors passer, sinon le cookie ferait rebondir indéfiniment. */
  const sessionExpired = request.nextUrl.searchParams.get("session") === "expiree";

  if (isAuthOnly && signedIn && !sessionExpired) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|mark.svg|.*\\.(?:svg|png|jpg|jpeg|webp|avif|mp3)$).*)"],
};
