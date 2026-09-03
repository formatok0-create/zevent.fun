import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { SITE, isSupabaseConfigured, supabaseConfig } from "@/lib/config";
import { getSiteUrl } from "@/lib/site-url";

/* ═══════════════════════════════════════════════════════════════
   DIAGNOSTIC
   Une page ne dit jamais pourquoi elle échoue — elle dit « une
   erreur est survenue ». Cette route dit la vérité : quelles
   variables sont là, quel domaine le serveur croit servir, et si
   Supabase répond. Aucune clé n'est exposée : on ne renvoie que
   des présences et des longueurs.

   À visiter en production : /api/sante
   ═══════════════════════════════════════════════════════════════ */

export const dynamic = "force-dynamic";

/** Le projet auquel appartient une URL Supabase :
 *  https://umlqhqwghnzymwwfbfbr.supabase.co -> umlqhqwghnzymwwfbfbr */
function refDeLUrl(url: string): string | null {
  try {
    return new URL(url).hostname.split(".")[0] ?? null;
  } catch {
    return null;
  }
}

/** La charge utile d'un JWT n'est pas chiffrée : elle est lisible par
 *  tout le monde, et elle contient le projet auquel la clé appartient.
 *  On ne touche pas à la signature, on lit seulement l'étiquette. */
function lireLaCle(cle: string) {
  const brut = cle.trim();
  const anomalies: string[] = [];
  if (brut !== cle) anomalies.push("espace ou saut de ligne autour de la clé");
  if (/^["']|["']$/.test(brut)) anomalies.push("guillemets copiés avec la valeur");

  if (brut.startsWith("sb_publishable_") || brut.startsWith("sb_secret_")) {
    return { format: "nouvelle clé Supabase (sb_…)", ref: null, role: null, anomalies };
  }

  const morceaux = brut.split(".");
  if (morceaux.length !== 3) {
    anomalies.push("ce n'est pas un JWT à trois segments");
    return { format: "inconnu", ref: null, role: null, anomalies };
  }

  try {
    const charge = JSON.parse(
      Buffer.from(morceaux[1]!.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"),
    ) as { ref?: string; role?: string; exp?: number };

    if (charge.exp && charge.exp * 1000 < Date.now()) anomalies.push("clé expirée");
    if (charge.role && charge.role !== "anon") {
      anomalies.push(`rôle « ${charge.role} » au lieu de « anon »`);
    }
    return {
      format: "JWT (clé historique)",
      ref: charge.ref ?? null,
      role: charge.role ?? null,
      anomalies,
    };
  } catch {
    anomalies.push("charge utile illisible");
    return { format: "JWT illisible", ref: null, role: null, anomalies };
  }
}

/* ── Qui a le droit de lire ce diagnostic ? ────────────────────
   Cette route dit quel projet Supabase est branché, quelles variables
   sont là et quelle est leur longueur. Ce n'est pas une clé, mais
   c'est une carte : elle indique exactement où frapper. Elle était
   ouverte à tout le monde.

   Deux portes, parce qu'on l'ouvre précisément quand la première ne
   marche plus : une session administrateur, ou un jeton passé en
   paramètre. Sans l'une ni l'autre : 404, pas 403 — une adresse qui
   répond « interdit » confirme qu'elle existe. */
async function autorise(requete: Request): Promise<boolean> {
  const jetonAttendu = (process.env.DIAGNOSTIC_TOKEN ?? "").trim();
  if (jetonAttendu) {
    const fourni = new URL(requete.url).searchParams.get("jeton") ?? "";
    const { egaliteConstante } = await import("@/lib/payments/types");
    if (fourni && egaliteConstante(fourni, jetonAttendu)) return true;
  }
  try {
    const { getSessionUser, getUserRole } = await import("@/lib/services/session");
    const user = await getSessionUser();
    if (user && (await getUserRole(user.id)) === "admin") return true;
  } catch {
    /* Session illisible : on retombe sur le refus. */
  }
  return false;
}

export async function GET(requete: Request) {
  if (!(await autorise(requete))) {
    return new NextResponse(null, { status: 404 });
  }

  const head = await headers();

  const rapport: Record<string, unknown> = {
    environnement: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "inconnu",
    domaine_vu_par_le_serveur: await getSiteUrl(),
    hote: head.get("x-forwarded-host") ?? head.get("host"),

    variables: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL
        ? `présente (${process.env.NEXT_PUBLIC_SUPABASE_URL})`
        : "MANQUANTE",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ? `présente (${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length} caractères)`
        : "MANQUANTE",
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? "non définie",
    },

    /* Si ce champ est faux en production, l'application tourne sur
       son magasin de démonstration : aucun compte réel ne peut être
       créé ni utilisé. */
    supabase_configure: isSupabaseConfigured,
  };

  if (isSupabaseConfigured) {
    try {
      const reponse = await fetch(`${supabaseConfig.url}/auth/v1/health`, {
        headers: { apikey: supabaseConfig.anonKey },
        cache: "no-store",
      });
      rapport.supabase_auth_repond = `${reponse.status} ${reponse.statusText}`;
    } catch (error) {
      rapport.supabase_auth_repond = `injoignable — ${(error as Error).message}`;
    }

    /* Le 401 le plus fréquent : une clé qui appartient à un autre
       projet que l'URL. Les deux étiquettes doivent être identiques. */
    const attendu = refDeLUrl(supabaseConfig.url);
    const cle = lireLaCle(supabaseConfig.anonKey);

    rapport.cle = {
      format: cle.format,
      projet_de_la_cle: cle.ref ?? "illisible",
      projet_de_l_url: attendu,
      concordent: cle.ref ? cle.ref === attendu : "indéterminé",
      role: cle.role ?? "inconnu",
      anomalies: cle.anomalies.length > 0 ? cle.anomalies : "aucune",
    };

    if (cle.ref && attendu && cle.ref !== attendu) {
      rapport.verdict =
        "La clé appartient au projet « " + cle.ref + " » alors que l'URL pointe vers « " +
        attendu + " ». Reprenez les deux valeurs dans le même projet Supabase.";
    } else if (rapport.supabase_auth_repond === "401 Unauthorized") {
      rapport.verdict =
        "La clé correspond au bon projet mais Supabase la refuse. Regardez si les clés " +
        "historiques (JWT) ont été désactivées dans Settings → API Keys : dans ce cas il faut " +
        "prendre la nouvelle clé publiable, celle qui commence par sb_publishable_.";
    }

    rapport.url_de_retour_attendue = `${await getSiteUrl()}/auth/callback`;
    rapport.a_verifier =
      "Cette URL doit figurer dans Supabase → Authentication → URL Configuration → Redirect URLs.";
  }

  /* ── Le paiement ──────────────────────────────────────────────
     Trois choses peuvent le rendre invisible, et aucune ne se voit
     depuis l'ecran : la cle de service absente (donc `payment_settings`
     illisible pour un client ordinaire), un domaine qui n'est pas
     celui declare chez SasPay, et les adresses de webhook a inscrire
     chez le prestataire. On les affiche toutes les trois. */
  const { aCleDeService } = await import("@/lib/supabase/admin");
  const hoteReel = head.get("x-forwarded-host") ?? head.get("host") ?? "";

  rapport.paiement = {
    SUPABASE_SERVICE_ROLE_KEY: aCleDeService
      ? `présente (${(process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim().length} caractères)`
      : "MANQUANTE — la caisse ne peut pas s'afficher et les webhooks répondront 404",
    domaine_declare: SITE.url,
    domaine_servi: hoteReel,
    concordent: hoteReel ? SITE.url.endsWith(hoteReel) : "indéterminé",
    url_de_retour: `${SITE.url}/dashboard/invitations/…?paiement=retour`,
    webhook_saspay: `${SITE.url}/api/paiements/saspay/webhook`,
    webhook_chariow: `${SITE.url}/api/paiements/chariow/pulse`,
    a_verifier:
      "Ces deux adresses doivent être inscrites telles quelles chez SasPay et Chariow, " +
      "sur le domaine de production — jamais sur une URL *.vercel.app, qu'ils refusent.",
  };

  return NextResponse.json(rapport, {
    headers: { "cache-control": "no-store" },
  });
}
