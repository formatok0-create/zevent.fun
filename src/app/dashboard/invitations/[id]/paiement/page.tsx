import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PageFrame, PageHeader } from "@/components/dashboard/page-frame";
import { PaiementBloc } from "@/components/invitation/steps/paiement";
import { requireUser } from "@/lib/services/session";
import { getInvitation } from "@/lib/services/invitations";
import { estPayee, planFor } from "@/lib/services/paiements";
import { fournisseursDisponiblesAction } from "../../paiement-actions";

export const metadata: Metadata = { title: "Paiement" };

/* ═══════════════════════════════════════════════════════════════
   LA CAISSE, HORS DU PARCOURS DE CRÉATION

   Elle ne vivait qu'à l'étape 07 du wizard. Résultat : « Publier »
   depuis la liste ou depuis la fiche appelait `publishInvitation`,
   qui refuse une invitation impayée — et l'écran répondait « Action
   impossible » sans jamais proposer de payer. Il fallait deviner
   qu'il fallait rouvrir la modification et aller jusqu'au bout des
   sept étapes.

   Le paiement a donc son adresse propre. Les trois boutons
   « Publier » y mènent quand l'invitation n'est pas payée, et
   l'étape 07 continue d'afficher le même bloc en ligne.
   ═══════════════════════════════════════════════════════════════ */

export default async function PaiementInvitationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const invitation = await getInvitation(id, user.id);
  if (!invitation) notFound();

  /* Déjà payée : il n'y a rien à encaisser. On renvoie sur la fiche
     plutôt que d'afficher une caisse qui ne sert plus. */
  if (estPayee(invitation)) redirect(`/dashboard/invitations/${id}`);

  const plan = await planFor(invitation);
  /* Aucun tarif pour ce type d'invitation : `publishInvitation`
     laisse passer, donc cette page n'a pas lieu d'être. */
  if (!plan) redirect(`/dashboard/invitations/${id}`);

  const fournisseurs = await fournisseursDisponiblesAction().catch(() => []);
  const isFete = (invitation.product ?? "mariage") === "anniversaire";
  const nom = isFete
    ? `${invitation.celebrant_name ?? "Votre invitation"} — ${invitation.celebrant_age ?? "?"} ans`
    : [invitation.bride_name, invitation.groom_name].filter(Boolean).join(" & ") ||
      "Votre invitation";

  return (
    <div className={isFete ? "voix-agrume fond-agrume min-h-dvh" : "voix-cerise fond-cerise min-h-dvh"}>
      <PageFrame>
        <PageHeader
          eyebrow="Dernière étape"
          title={
            <>
              Publier <span className="italic">{nom}</span>
            </>
          }
          description="Une fois le paiement confirmé, l’invitation est publiée automatiquement et son lien devient actif."
        />

        <PaiementBloc
          invitationId={invitation.id}
          montant={plan.amount}
          devise={plan.currency}
          libelle={plan.name}
          fournisseurs={fournisseurs}
        />

        <p className="mt-10 border-t border-line pt-6 text-sm font-light text-ink-soft">
          Vous voulez encore changer quelque chose ?{" "}
          <Link
            href={`/dashboard/invitations/${id}/edit`}
            className="link-draw text-ink transition-colors hover:text-burgundy"
          >
            Revenir à la modification
          </Link>
        </p>
      </PageFrame>
    </div>
  );
}
