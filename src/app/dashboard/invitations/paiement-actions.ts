"use server";

import { randomUUID } from "node:crypto";
import { requireUser } from "@/lib/services/session";
import { getInvitation } from "@/lib/services/invitations";
import {
  getSettings,
  listSettings,
  marquerPaiementPaye,
  paiementsEnAttente,
  recordPayment,
} from "@/lib/services/admin";
import { estPayee, planFor } from "@/lib/services/paiements";
import { fournisseur } from "@/lib/payments";
import { SITE } from "@/lib/config";
import type { PaymentProviderId } from "@/types/admin";

type Resultat = { ok: boolean; message: string; url?: string };

/** Les fournisseurs proposables : actifs ET configurés. Un fournisseur
 *  activé sans clé enverrait le client sur une erreur du prestataire. */
export async function fournisseursDisponiblesAction(): Promise<PaymentProviderId[]> {
  const reglages = await listSettings();
  return reglages
    .filter((r) => r.enabled && r.api_key)
    .map((r) => r.provider);
}

export async function ouvrirPaiementAction(
  invitationId: string,
  provider: PaymentProviderId,
): Promise<Resultat> {
  const user = await requireUser();
  const invitation = await getInvitation(invitationId, user.id);
  if (!invitation) return { ok: false, message: "Invitation introuvable." };

  /* Payée une fois, payée pour de bon : on ne refacture pas une
     invitation qu'on dépublie puis republie. */
  if (estPayee(invitation)) {
    return { ok: true, message: "Cette invitation est déjà payée." };
  }

  const config = await getSettings(provider);
  if (!config?.enabled || !config.api_key) {
    return { ok: false, message: "Ce moyen de paiement n’est pas disponible." };
  }

  const plan = await planFor(invitation);
  if (!plan) {
    return { ok: false, message: "Aucun tarif n’est configuré pour ce type d’invitation." };
  }

  /* Notre propre référence, transmise au fournisseur et renvoyée dans
     le webhook : c'est elle qui rattache le paiement à l'invitation,
     sans avoir à se fier au montant. */
  const reference = `zv_${randomUUID()}`;

  try {
    const session = await fournisseur(provider).checkout(config, {
      montant: plan.amount,
      devise: plan.currency,
      libelle: `${plan.name} — Zevent`,
      client: {
        email: user.email,
        prenom: user.firstName ?? "",
        nom: user.lastName ?? "",
      },
      retourUrl: `${SITE.url}/dashboard/invitations/${invitation.id}?paiement=retour`,
      reference,
      produitId: plan.chariow_product_id,
    });

    await recordPayment({
      id: randomUUID(),
      user_id: user.id,
      invitation_id: invitation.id,
      plan_id: plan.id,
      provider,
      /* SasPay renvoie l'identifiant de sa session, qui reviendra dans
         le webhook. Chariow renvoie l'identifiant de la vente, mais son
         Pulse porte notre métadonnée : on garde la nôtre en secours. */
      provider_reference: session.reference || reference,
      status: "pending",
      amount: plan.amount,
      currency: plan.currency,
      checkout_url: session.url,
      last_event_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      paid_at: null,
    });

    if (!session.url) {
      return { ok: false, message: "Le fournisseur n’a pas renvoyé de page de paiement." };
    }
    return { ok: true, message: "Redirection vers le paiement…", url: session.url };
  } catch (erreur) {
    return {
      ok: false,
      message: erreur instanceof Error ? erreur.message : "Le paiement n’a pas pu être ouvert.",
    };
  }
}

/* ═══════════════════════════════════════════════════════════════
   LE RETOUR DU CLIENT

   Le webhook de SasPay porte l'identifiant de la TRANSACTION ; nous
   avons stocké celui de la SESSION de checkout. Les deux sont
   différents, donc `invitationDuPaiement()` ne trouvait rien et
   l'invitation restait impayée alors que l'argent était parti.

   Au retour du client, on redemande donc la session à SasPay par son
   identifiant. C'est le fournisseur qui répond, pas le navigateur :
   une URL bricolée à la main ne publie rien.

   Le webhook reste en place — il rattrape le client qui ferme
   l'onglet avant d'être redirigé. Les deux chemins sont idempotents.
   ═══════════════════════════════════════════════════════════════ */
export async function verifierRetourAction(invitationId: string): Promise<boolean> {
  const user = await requireUser();
  const invitation = await getInvitation(invitationId, user.id);
  if (!invitation) return false;
  if (estPayee(invitation)) return true;

  const paiements = await paiementsEnAttente(invitationId, user.id);

  for (const paiement of paiements) {
    const config = await getSettings(paiement.provider);
    if (!config?.api_key) continue;
    const service = fournisseur(paiement.provider);
    if (!service.verifier || !paiement.provider_reference) continue;

    try {
      const etat = await service.verifier(config, paiement.provider_reference);
      if (!etat.paye) continue;
      await marquerPaiementPaye(paiement.id);
      const { encaisserEtPublier } = await import("@/lib/services/paiements");
      await encaisserEtPublier(invitationId);
      return true;
    } catch (erreur) {
      /* Le fournisseur est injoignable ou la clé est mauvaise : on le
         journalise et on laisse le webhook faire son travail. On ne
         publie surtout pas « dans le doute ». */
      console.error("[paiement] vérification au retour", paiement.provider, erreur);
    }
  }
  return false;
}

/** Ce que l'étape de publication a besoin de savoir : faut-il passer
 *  par la caisse, pour quel montant, et avec quels fournisseurs.
 *
 *  L'étape l'interroge elle-même plutôt que de recevoir le tarif en
 *  propriété : le tarif dépend de l'âge du célébré, qui change encore
 *  à l'étape 03, et les deux parcours partagent ce composant. */
export async function etatPaiementAction(invitationId: string): Promise<{
  aPayer: boolean;
  montant: number;
  devise: string;
  libelle: string;
  fournisseurs: PaymentProviderId[];
}> {
  const vide = { aPayer: false, montant: 0, devise: "XOF", libelle: "", fournisseurs: [] };

  const user = await requireUser();
  const invitation = await getInvitation(invitationId, user.id);
  if (!invitation || estPayee(invitation)) return vide;

  const plan = await planFor(invitation);
  /* Aucun tarif configuré : `publishInvitation` laisse passer une
     invitation dont le type n'a pas de prix, donc l'étape aussi. */
  if (!plan) return vide;

  /* Un tarif existe : l'invitation passe par la caisse, point.
     La liste des fournisseurs décide seulement des boutons affichés.

     C'est ici que se trouvait le défaut : quand la liste revenait
     vide — et elle revenait toujours vide, `payment_settings` étant
     fermée aux non-administrateurs — cette fonction annonçait « rien
     à payer ». L'étape affichait donc « Publier mon invitation », et
     `publishInvitation`, lui, refusait avec « doit être payée avant
     d'être publiée ». Deux règles opposées sur la même invitation :
     le client voyait « Action impossible » sans jamais voir la
     caisse. Les deux disent maintenant la même chose. */
  const fournisseurs = await fournisseursDisponiblesAction().catch(() => []);

  return {
    aPayer: true,
    montant: plan.amount,
    devise: plan.currency,
    libelle: plan.name,
    fournisseurs,
  };
}
