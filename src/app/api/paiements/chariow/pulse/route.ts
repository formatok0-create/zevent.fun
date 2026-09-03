import { NextResponse } from "next/server";
import { chariow } from "@/lib/payments/chariow";
import { applyPaymentEvent, getSettings } from "@/lib/services/admin";
import { invitationDuPaiement, marquerPayee, planCodeFor } from "@/lib/services/paiements";
import { getInvitation, publishInvitation } from "@/lib/services/invitations";

/* Chariow signe le corps brut seul, sans horodatage. La protection
   contre le rejeu passe par `x-pulse-delivery-id`, stable sur toutes
   les tentatives d'une même livraison — c'est `applyPaymentEvent` qui
   le compare au dernier événement appliqué. */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";


/* Le paiement confirmé fait deux choses : il marque l'invitation
   payée, et il la publie. C'est l'étape 7 des conditions générales —
   le client n'a pas à revenir cliquer après avoir payé. */
async function confirmer(provider: "saspay" | "chariow", reference: string) {
  const { invitationId, userId } = await invitationDuPaiement(provider, reference);
  if (!invitationId || !userId) return;

  const invitation = await getInvitation(invitationId, userId, true);
  if (!invitation) return;

  await marquerPayee(invitationId, planCodeFor(invitation));
  /* Republier une invitation deja en ligne ne casse rien : le slug
     attribue est conserve. */
  if (invitation.status !== "published") {
    await publishInvitation(invitationId, userId);
  }
}

export async function POST(request: Request) {
  const config = await getSettings("chariow");
  if (!config || !config.enabled) {
    return NextResponse.json({ error: "fournisseur désactivé" }, { status: 404 });
  }

  const corpsBrut = await request.text();
  const evenement = chariow.lireWebhook(config, corpsBrut, request.headers);

  if (!evenement) {
    return NextResponse.json({ error: "signature invalide" }, { status: 401 });
  }

  /* La métadonnée porte notre propre référence ; l'identifiant de
     vente sert de repli quand le Pulse ne la renvoie pas. */
  const reference = evenement.metadonnee ?? evenement.reference;
  if (reference) {
    const nouveau = await applyPaymentEvent(
      "chariow",
      reference,
      evenement.statut,
      evenement.evenementId,
    );
    if (nouveau && evenement.statut === "success") {
      await confirmer("chariow", reference);
    }
  }

  return NextResponse.json({ received: true });
}
