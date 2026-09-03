"use client";

import { useState, useTransition } from "react";
import { publicPathFor } from "@/lib/utils/public-url";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { useCopy } from "@/lib/hooks/use-copy";
import { useOrigin } from "@/lib/hooks/use-origin";
import {
  deleteInvitationAction,
  duplicateInvitationAction,
  publishInvitationAction,
  unpublishInvitationAction,
} from "@/app/dashboard/actions";
import type { InvitationWithPhotos } from "@/types/database";

export function InvitationActions({ invitation }: { invitation: InvitationWithPhotos }) {
  const router = useRouter();
  const { toast } = useToast();
  const { copied, copy } = useCopy();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  const isPublished = invitation.status === "published";
  const estPayee = Boolean(invitation.paid_at);
  const origin = useOrigin();
  const url = invitation.slug ? `${origin}${publicPathFor(invitation)}` : null;

  const run = (task: () => Promise<{ ok: boolean; message?: string }>, successTitle: string) =>
    startTransition(async () => {
      const result = await task();
      toast({
        title: result.ok ? successTitle : "Action impossible",
        description: result.message,
        tone: result.ok ? "success" : "danger",
      });
      if (result.ok) router.refresh();
    });

  return (
    <>
      <div className="space-y-3">
        <ButtonLink href={`/dashboard/invitations/${invitation.id}/edit`} className="w-full">
          Modifier l’invitation
        </ButtonLink>

        {isPublished ? (
          <Button
            variant="outline"
            className="w-full"
            loading={pending}
            onClick={() => run(() => unpublishInvitationAction(invitation.id), "Invitation retirée")}
          >
            Dépublier
          </Button>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            loading={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await publishInvitationAction(invitation.id);
                /* Impayée : on n'annonce pas un échec, on emmène à la
                   caisse. C'est la seule chose qu'il reste à faire. */
                if (result.code === "paiement_requis") {
                  router.push(`/dashboard/invitations/${invitation.id}/paiement`);
                  return;
                }
                toast({
                  title: result.ok ? "Invitation publiée" : "Action impossible",
                  description: result.message,
                  tone: result.ok ? "success" : "danger",
                });
                if (result.ok) router.refresh();
              })
            }
          >
            {estPayee ? "Publier" : "Payer et publier"}
          </Button>
        )}
      </div>

      {url && (
        <div className="mt-8 border-t border-line pt-6">
          <p className="eyebrow-sm text-ink-faint">Lien public</p>
          <p className="mt-3 break-all text-sm font-light text-ink">{url}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="gold" size="sm" type="button" onClick={() => copy(url)}>
              {copied ? "Copié" : "Copier le lien"}
            </Button>
            <ButtonLink href={url} target="_blank" rel="noopener noreferrer" variant="outline" size="sm">
              Ouvrir
            </ButtonLink>
            <ButtonLink
              href={`https://wa.me/?text=${encodeURIComponent(`Notre invitation : ${url}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              size="sm"
            >
              WhatsApp
            </ButtonLink>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3 border-t border-line pt-6">
        <Button
          variant="outline"
          size="sm"
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await duplicateInvitationAction(invitation.id);
              if (result.ok && result.data) {
                toast({ title: "Copie créée", tone: "success" });
                router.push(`/dashboard/invitations/${result.data.id}/edit`);
              } else {
                toast({ title: "Duplication impossible", description: result.message, tone: "danger" });
              }
            })
          }
        >
          Dupliquer
        </Button>
        <Button variant="danger" size="sm" type="button" onClick={() => setConfirming(true)}>
          Supprimer
        </Button>
      </div>

      <ConfirmDialog
        open={confirming}
        loading={pending}
        onClose={() => setConfirming(false)}
        onConfirm={() =>
          startTransition(async () => {
            const result = await deleteInvitationAction(invitation.id);
            setConfirming(false);
            if (result.ok) {
              toast({ title: "Invitation supprimée", tone: "neutral" });
              router.push("/dashboard/invitations");
              router.refresh();
            } else {
              toast({ title: "Suppression impossible", description: result.message, tone: "danger" });
            }
          })
        }
        title="Supprimer cette invitation ?"
        description={
          <>
            <span className="text-ink">
              {invitation.bride_name} &amp; {invitation.groom_name}
            </span>{" "}
            sera définitivement supprimée, avec ses photos.
            {isPublished && " Le lien partagé à vos invités cessera immédiatement de fonctionner."}
          </>
        }
      />
    </>
  );
}
