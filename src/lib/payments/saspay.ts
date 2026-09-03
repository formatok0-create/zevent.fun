import "server-only";
import { createHmac } from "node:crypto";
import { coherenceCle, egaliteConstante } from "./types";
import type {
  CheckoutDemande,
  CheckoutReponse,
  EvenementPaiement,
  FournisseurPaiement,
} from "./types";
import type { PaymentProviderSettings } from "@/types/admin";

/* ═══════════════════════════════════════════════════════════════
   SASPAY — mobile money et carte en Afrique de l'Ouest
   https://docs.saspay.me/api-reference/introduction

   Encaissement par session de checkout hebergee : on cree la session,
   on redirige le client sur `checkout_url`, et on attend le webhook.
   ═══════════════════════════════════════════════════════════════ */

const BASE = "https://api.saspay.me/api/v1";

/** La documentation impose 5 minutes de tolerance sur l'horodatage.
 *  Sans ce controle, un webhook legitime intercepte reste rejouable
 *  indefiniment : sa signature, elle, ne perime jamais. */
const TOLERANCE_SECONDES = 300;

/** SasPay attend un decimal en chaine : "5000.00". */
function montantSasPay(valeur: number): string {
  return valeur.toFixed(2);
}

/** La documentation annonce une enveloppe `{success, data}`, mais les
 *  exemples de `/checkout-sessions/` renvoient l'objet a plat. On
 *  accepte les deux formes plutot que de parier sur l'une : avec la
 *  seule enveloppe, une reponse 201 parfaitement valide etait rejetee
 *  parce que `corps.success` valait `undefined`. */
function charge(corps: unknown): Record<string, unknown> {
  if (!corps || typeof corps !== "object") return {};
  const objet = corps as Record<string, unknown>;
  const donnees = objet.data;
  if (donnees && typeof donnees === "object") return donnees as Record<string, unknown>;
  return objet;
}

/** Le message d'erreur, quelle que soit la forme. */
function erreurLisible(corps: unknown, statut: number): string {
  const objet = (corps ?? {}) as Record<string, unknown>;
  const erreur = objet.error as Record<string, unknown> | undefined;
  const message = erreur?.message ?? objet.message;
  return typeof message === "string" ? message : `SasPay a répondu ${statut}.`;
}

/** Un appel authentifie a l'API. La cle est verifiee AVANT le depart :
 *  une cle `sk_live_` dans un reglage marque « test » declenche un
 *  vrai debit, et personne ne s'en apercoit avant le releve. */
async function appel(
  config: PaymentProviderSettings,
  chemin: string,
  init?: RequestInit,
): Promise<Response> {
  if (!config.api_key) throw new Error("SasPay : clé API manquante.");
  const controle = coherenceCle(config.api_key, config.environment === "live" ? "live" : "test");
  if (!controle.ok) throw new Error(`SasPay — ${controle.message}`);

  return fetch(`${BASE}${chemin}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${config.api_key}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
}

export const saspay: FournisseurPaiement = {
  id: "saspay",
  nom: "SasPay",

  async checkout(
    config: PaymentProviderSettings,
    demande: CheckoutDemande,
  ): Promise<CheckoutReponse> {
    const reponse = await appel(config, "/checkout-sessions/", {
      method: "POST",
      body: JSON.stringify({
        amount: montantSasPay(demande.montant),
        currency: demande.devise,
        description: demande.libelle,
        customer_email: demande.client.email,
        customer_name: `${demande.client.prenom} ${demande.client.nom}`.trim(),
        customer_phone: demande.client.telephone ?? "",
        return_url: demande.retourUrl,
        metadata: { zevent_reference: demande.reference },
      }),
    });

    const corps = await reponse.json().catch(() => null);
    if (!reponse.ok) throw new Error(erreurLisible(corps, reponse.status));

    const session = charge(corps);
    const id = session.id;
    if (typeof id !== "string") {
      throw new Error("SasPay n’a pas renvoyé d’identifiant de session.");
    }

    return {
      reference: id,
      url: typeof session.checkout_url === "string" ? session.checkout_url : null,
    };
  },

  /* ── La verification au retour ──────────────────────────────────
     Le webhook porte l'identifiant de la TRANSACTION ; nous avons
     stocke celui de la SESSION. Les deux sont differents, donc le
     rapprochement par la seule reference du webhook echoue. On
     redemande donc la session par son identifiant, au retour du
     client : c'est SasPay qui repond, pas le navigateur, et la
     reponse porte `paid_at`.

     Cette route est en lecture seule : la rejouer ne coute rien et
     ne debite personne. */
  async verifier(config: PaymentProviderSettings, reference: string) {
    const reponse = await appel(config, `/checkout-sessions/${encodeURIComponent(reference)}/`);
    const corps = await reponse.json().catch(() => null);
    if (!reponse.ok) throw new Error(erreurLisible(corps, reponse.status));

    const session = charge(corps);
    const statut = typeof session.status === "string" ? session.status : "INCONNU";
    /* `paid_at` fait foi. `status` peut encore dire PENDING une
       fraction de seconde apres l'encaissement selon le reseau. */
    const paye = Boolean(session.paid_at) || statut.toUpperCase() === "PAID";
    const net = session.amount;
    return {
      paye,
      statut,
      montant: net != null && !Number.isNaN(Number(net)) ? Number(net) : null,
    };
  },

  lireWebhook(
    config: PaymentProviderSettings,
    corpsBrut: string,
    entetes: Headers,
  ): EvenementPaiement | null {
    const secret = config.webhook_secret;
    const signature = entetes.get("x-webhook-signature");
    const horodatage = entetes.get("x-webhook-timestamp");
    if (!secret || !signature || !horodatage) return null;

    /* Premier controle : l'age. */
    const maintenant = Math.floor(Date.now() / 1000);
    const envoye = Number(horodatage);
    if (!Number.isFinite(envoye)) return null;
    if (Math.abs(maintenant - envoye) > TOLERANCE_SECONDES) return null;

    /* Second controle : la signature, calculee sur `timestamp.corps`,
       et sur le corps BRUT — jamais sur une re-serialisation, l'ordre
       des cles suffirait a la casser. */
    const attendue = createHmac("sha256", secret)
      .update(`${horodatage}.${corpsBrut}`)
      .digest("hex");
    if (!egaliteConstante(signature.toLowerCase(), attendue)) return null;

    let charge: { event?: string; data?: Record<string, unknown> };
    try {
      charge = JSON.parse(corpsBrut);
    } catch {
      return null;
    }

    const data = charge.data ?? {};
    const type = charge.event ?? "";

    return {
      /* SasPay ne fournit pas d'identifiant de livraison : l'identifiant
         de transaction joue ce role, un meme etat n'etant notifie
         qu'une fois par transaction. */
      evenementId: String(data.id ?? `${type}:${data.reference ?? ""}`),
      type,
      reference: data.id ? String(data.id) : null,
      statut:
        type === "transaction.success"
          ? "success"
          : type === "transaction.failed"
            ? "failed"
            : type === "transaction.cancelled"
              ? "cancelled"
              : "pending",
      /* `amount` n'est pas ce que le client a paye : selon
         `fee_charge_mode`, les frais s'ajoutent ou se retranchent. Ce
         qui nous revient, c'est `net_amount`. */
      montant: data.net_amount != null ? Number(data.net_amount) : null,
      devise: data.currency ? String(data.currency) : null,
      metadonnee: null,
    };
  },
};
