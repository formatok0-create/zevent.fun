import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageFrame, PageHeader } from "@/components/dashboard/page-frame";
import { InvitationWizard } from "@/components/invitation/wizard";
import { BirthdayWizard } from "@/components/invitation/birthday-wizard";
import { audienceOf } from "@/templates/registry";
import { requireUser } from "@/lib/services/session";
import { getInvitation } from "@/lib/services/invitations";

export const metadata: Metadata = { title: "Modifier l’invitation" };

export default async function EditInvitationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const invitation = await getInvitation(id, user.id);
  if (!invitation) notFound();

  if ((invitation.product ?? "mariage") === "anniversaire") {
    return (
      <div className="voix-agrume fond-agrume min-h-dvh">
        <PageFrame>
        <PageHeader
          eyebrow="Modification"
          title={
            <>
              {invitation.celebrant_name}
              <span className="text-flamme"> — {invitation.celebrant_age} ans</span>
            </>
          }
          description="Vos changements sont enregistrés étape par étape et apparaissent aussitôt sur la page publique."
        />
        <BirthdayWizard
          userId={user.id}
          audience={audienceOf(invitation.template_id)}
          invitation={invitation}
        />
        </PageFrame>
      </div>
    );
  }

  return (
    <div className="voix-cerise fond-cerise min-h-dvh">
      <PageFrame>
      <PageHeader
        eyebrow="Modification"
        title={
          <>
            {invitation.bride_name} <span className="font-script italic text-gold">&amp;</span>{" "}
            {invitation.groom_name}
          </>
        }
        description="Vos changements sont enregistrés étape par étape et apparaissent aussitôt sur la page publique."
      />
        <InvitationWizard userId={user.id} invitation={invitation} />
      </PageFrame>
    </div>
  );
}
