import { NextResponse } from "next/server";
import { saspay } from "@/lib/payments/saspay";
import { applyPaymentEvent, getSettings } from "@/lib/services/admin";
import { invitationDuPaiement, marquerPayee, planCodeFor } from "@/lib/services/paiements";
import { getInvitation, publishInvitation } from "@/lib/services/invitations";

/* SasPay signe `timestamp.corps`. Il faut donc le corps BRUT : une
   re-sérialisation de l'objet parsé change l'ordre des clés ou le
   format des nombres, et la comparaison échoue. */
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
  const config = await getSettings("saspay");
  if (!config || !config.enabled) {
    return NextResponse.json({ error: "fournisseur désactivé" }, { status: 404 });
  }

  const corpsBrut = await request.text();
  const evenement = saspay.lireWebhook(config, corpsBrut, request.headers);

  /* Signature invalide, horodatage hors tolérance, corps illisible :
     on ne distingue pas, et on ne dit pas lequel. */
  if (!evenement) {
    return NextResponse.json({ error: "signature invalide" }, { status: 401 });
  }

  if (evenement.reference) {
    /* `applyPaymentEvent` renvoie false si l'événement a déjà été
       traité : sans ce garde-fou, cinq tentatives publieraient cinq
       fois et enverraient cinq notifications. */
    const nouveau = await applyPaymentEvent(
      "saspay",
      evenement.reference,
      evenement.statut,
      evenement.evenementId,
    );
    if (nouveau && evenement.statut === "success") {
      await confirmer("saspay", evenement.reference);
    }
  }

  /* 200 même si le paiement est inconnu : SasPay retenterait cinq
     fois, puis abandonnerait définitivement. Un événement qu'on ne
     sait pas rattacher n'est pas une panne de leur côté. */
  return NextResponse.json({ received: true });
}
