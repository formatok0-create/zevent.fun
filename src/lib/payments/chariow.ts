import "server-only";
import { createHmac } from "node:crypto";
import { egaliteConstante } from "./types";
import type {
  CheckoutDemande,
  CheckoutReponse,
  EvenementPaiement,
  FournisseurPaiement,
} from "./types";
import type { PaymentProviderSettings } from "@/types/admin";

/* ═══════════════════════════════════════════════════════════════
   CHARIOW — vente de produits numeriques
   https://chariow.dev/en/introduction/overview

   Chariow ne facture pas un montant libre : on achete un produit de la
   boutique. Le tarif Zevent doit donc exister la-bas, et son
   identifiant est saisi dans l'administration.

   Sa signature ne porte AUCUN horodatage — c'est volontaire de leur
   part : une derniere tentative peut arriver pres de trois heures
   apres la premiere, et une fenetre de temps la rejetterait a tort.
   La protection contre le rejeu passe par `x-pulse-delivery-id`.
   ═══════════════════════════════════════════════════════════════ */

const BASE = "https://api.chariow.com/v1";

export const chariow: FournisseurPaiement = {
  id: "chariow",
  nom: "Chariow",

  async checkout(
    config: PaymentProviderSettings,
    demande: CheckoutDemande,
  ): Promise<CheckoutReponse> {
    if (!config.api_key) throw new Error("Chariow : clé API manquante.");
    /* L'identifiant du tarif prime : chaque tarif a son produit dans
       la boutique, à son prix. Celui du fournisseur ne sert plus que
       de repli pour une installation qui n'a pas encore migré. */
    const produit = demande.produitId ?? config.product_id;
    if (!produit) {
      throw new Error(
        "Chariow : aucun produit configuré pour ce tarif. Renseignez son identifiant dans Administration → Tarifs.",
      );
    }

    const reponse = await fetch(`${BASE}/checkout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.api_key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: produit,
        email: demande.client.email,
        first_name: demande.client.prenom || "Client",
        last_name: demande.client.nom || "Zevent",
        phone: {
          number: (demande.client.telephone ?? "").replace(/\D/g, "") || "0000000000",
          country_code: "CI",
        },
        payment_currency: demande.devise,
        redirect_url: demande.retourUrl,
        /* Dix cles au maximum, 255 caracteres par valeur. C'est ce
           champ qui revient dans le Pulse et rattache la vente. */
        custom_metadata: { zevent_reference: demande.reference },
      }),
      cache: "no-store",
    });

    const corps = await reponse.json().catch(() => null);
    if (!reponse.ok) {
      throw new Error(corps?.message ?? `Chariow a répondu ${reponse.status}.`);
    }

    const data = corps?.data ?? {};
    if (data.step === "already_purchased") {
      throw new Error(data.message ?? "Ce produit a déjà été acheté par ce client.");
    }

    return {
      reference: data.purchase?.id ?? data.payment?.transaction_id ?? "",
      /* Null sur un produit gratuit : la vente est deja conclue. */
      url: data.payment?.checkout_url ?? null,
    };
  },

  lireWebhook(
    config: PaymentProviderSettings,
    corpsBrut: string,
    entetes: Headers,
  ): EvenementPaiement | null {
    const secret = config.webhook_secret;
    const recue = entetes.get("x-chariow-signature");
    if (!secret || !recue) return null;

    /* Le prefixe designe l'algorithme : tout ce qui n'est pas
       `sha256=` est un schema qu'on ne sait pas encore verifier. */
    if (!recue.startsWith("sha256=")) return null;

    const attendue = `sha256=${createHmac("sha256", secret).update(corpsBrut).digest("hex")}`;
    if (!egaliteConstante(recue, attendue)) return null;

    let charge: Record<string, unknown>;
    try {
      charge = JSON.parse(corpsBrut);
    } catch {
      return null;
    }

    const type = entetes.get("x-pulse-event") ?? "";
    const donnees = (charge.data ?? charge) as Record<string, unknown>;
    const meta = (donnees.custom_metadata ?? {}) as Record<string, unknown>;
    const statut = String(donnees.status ?? "");

    return {
      /* Stable sur toutes les tentatives d'une meme livraison : c'est
         la cle d'idempotence fournie par Chariow. Un evenement de test
         du tableau de bord n'en porte pas. */
      evenementId: entetes.get("x-pulse-delivery-id") ?? `test:${entetes.get("x-pulse-id") ?? ""}`,
      type,
      reference: donnees.id ? String(donnees.id) : null,
      statut:
        type === "successful.sale" || statut === "completed"
          ? "success"
          : statut === "refunded" || statut === "failed"
            ? "failed"
            : "pending",
      montant: lireMontant(donnees.amount),
      devise: lireDevise(donnees.amount),
      metadonnee: meta.zevent_reference ? String(meta.zevent_reference) : null,
    };
  },
};

/* Chariow enveloppe ses montants : { value, formatted, short, currency }. */
function lireMontant(champ: unknown): number | null {
  if (champ && typeof champ === "object" && "value" in champ) {
    const valeur = Number((champ as { value: unknown }).value);
    return Number.isFinite(valeur) ? valeur : null;
  }
  return null;
}

function lireDevise(champ: unknown): string | null {
  if (champ && typeof champ === "object" && "currency" in champ) {
    return String((champ as { currency: unknown }).currency);
  }
  return null;
}
