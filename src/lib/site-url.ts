import "server-only";
import { headers } from "next/headers";
import { SITE } from "./config";

/**
 * L’adresse réelle du site, déduite des en-têtes de la requête.
 *
 * Vercel sert la même application sur plusieurs domaines : preview,
 * production, domaine personnalisé. Une constante figée casse les
 * liens de confirmation et les liens publics dès qu’on change de
 * domaine — c’est la cause la plus fréquente d’un « ça marche en
 * preview mais pas en production ».
 */
export async function getSiteUrl(): Promise<string> {
  try {
    const head = await headers();
    const forwarded = head.get("x-forwarded-host");
    const host = forwarded ?? head.get("host");
    if (host) {
      const protocol = host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https";
      return `${protocol}://${host}`;
    }
  } catch {
    /* Hors requête (build statique) : on retombe sur la constante. */
  }
  return SITE.url;
}
