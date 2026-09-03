"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu } from "@/components/ui/menu";
import { TemplateCover } from "@/templates/components/cover";
import { StatusBadge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { useCopy } from "@/lib/hooks/use-copy";
import { formatWeddingDate, formatRelative } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { publicPathFor } from "@/lib/utils/public-url";
import { getTemplate } from "@/templates/registry";
import { useOrigin } from "@/lib/hooks/use-origin";
import {
  deleteInvitationAction,
  duplicateInvitationAction,
  publishInvitationAction,
  unpublishInvitationAction,
} from "@/app/dashboard/actions";
import type { InvitationWithPhotos } from "@/types/database";

export function InvitationCard({
  invitation,
  featured = false,
}: {
  invitation: InvitationWithPhotos;
  featured?: boolean;
}) {
  const router = useRouter();
  /* `paid_at` est la seule source : une invitation payée le reste,
     même dépubliée puis republiée. */
  const estPayee = Boolean(invitation.paid_at);
  const { toast } = useToast();
  const { copy } = useCopy();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  const template = getTemplate(invitation.template_id);
  const origin = useOrigin();
  const publicUrl = invitation.slug ? `${origin}${publicPathFor(invitation)}` : null;
  const isPublished = invitation.status === "published";
  const isFete = (invitation.product ?? "mariage") === "anniversaire";
  const heading = isFete
    ? invitation.celebrant_name ?? "Anniversaire"
    : null;

  const run = (task: () => Promise<{ ok: boolean; message?: string }>, successTone: "neutral" | "success" = "success") =>
    startTransition(async () => {
      const result = await task();
      toast({
        title: result.ok ? (result.message ?? "C’est fait.") : "Action impossible",
        description: result.ok ? undefined : result.message,
        tone: result.ok ? successTone : "danger",
      });
      if (result.ok) router.refresh();
    });

  return (
    <>
      <article
        className={cn(
          "group border-t border-line pt-6",
          featured && "grid gap-10 md:grid-cols-[minmax(0,20rem)_1fr] md:gap-14",
        )}
      >
        {/* La vignette montre la vraie premiere page de l'invitation,
            avec ses propres donnees : les prenoms saisis, la date, la
            photo de couverture si elle existe. Une plaque degradee ne
            disait pas laquelle des dix collections avait ete choisie. */}
        <Link
          href={`/dashboard/invitations/${invitation.id}`}
          aria-label={`Ouvrir l’invitation ${invitation.title ?? ""}`}
          className="block overflow-hidden"
        >
          <TemplateCover
            template={template}
            invitation={invitation}
            shape={isFete ? "quatrefoil" : "arch"}
            className="transition-transform duration-[1.4s] ease-silk group-hover:scale-[1.02]"
          />
        </Link>

        <div className={cn("flex items-start justify-between gap-4", featured ? "md:pt-2" : "mt-6")}>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={invitation.status} />
              <span className={cn("eyebrow-sm", isFete ? "text-flamme" : "text-gold")}>
                {isFete ? "Anniversaire" : "Mariage"}
              </span>
              <span className="eyebrow-sm text-ink-faint">{template.name}</span>
            </div>
            <h3
              className={cn(
                "mt-4 truncate font-display leading-tight",
                featured ? "text-[clamp(2rem,4vw,3rem)]" : "text-[clamp(1.5rem,3vw,2.25rem)]",
              )}
            >
              <Link
                href={`/dashboard/invitations/${invitation.id}`}
                className="inline-flex min-h-11 items-center transition-colors hover:text-burgundy"
              >
                {isFete ? (
                  heading
                ) : (
                  <>
                    {invitation.bride_name} <span className="font-script italic text-gold">&amp;</span>{" "}
                    {invitation.groom_name}
                  </>
                )}
              </Link>
            </h3>
            <p className="mt-2 text-sm font-light text-ink-soft">
              {/* L'age tient sur la ligne des informations : dans le titre,
                  il se faisait couper des que la colonne se resserrait. */}
              {isFete && invitation.celebrant_age != null && (
                <span className="text-flamme">{invitation.celebrant_age} ans · </span>
              )}
              {formatWeddingDate(invitation.wedding_date)}
              {invitation.venue && <span className="text-ink-faint"> — {invitation.venue}</span>}
            </p>
            {featured && invitation.description && (
              <p className="mt-5 max-w-md text-sm font-light leading-[1.85] text-ink-soft">
                {invitation.description}
              </p>
            )}
            <p className="eyebrow-sm mt-5 text-ink-faint">
              Modifiée {formatRelative(invitation.updated_at)}
            </p>
          </div>

          <Menu
            label={`Actions pour ${invitation.title ?? "l’invitation"}`}
            className="shrink-0"
            actions={[
              {
                label: isPublished ? "Voir en ligne" : "Voir l’aperçu",
                onSelect: () => {
                  if (isPublished && publicUrl) window.open(publicUrl, "_blank", "noopener");
                  else router.push(`/dashboard/invitations/${invitation.id}`);
                },
              },
              { label: "Modifier", onSelect: () => router.push(`/dashboard/invitations/${invitation.id}/edit`) },
              {
                label: "Copier le lien",
                hidden: !publicUrl,
                onSelect: async () => {
                  await copy(publicUrl!);
                  toast({ title: "Lien copié", description: publicUrl!, tone: "success" });
                },
              },
              {
                /* Une invitation impayée n'affiche plus « Publier » :
                   le libellé annonce ce qui va vraiment se passer. */
                label: isPublished ? "Dépublier" : estPayee ? "Publier" : "Payer et publier",
                onSelect: () => {
                  if (isPublished) return run(() => unpublishInvitationAction(invitation.id));
                  if (!estPayee) {
                    router.push(`/dashboard/invitations/${invitation.id}/paiement`);
                    return;
                  }
                  run(() =>
                    publishInvitationAction(invitation.id).then((r) => ({
                      ok: r.ok,
                      message: r.ok ? "Invitation publiée." : r.message,
                    })),
                  );
                },
              },
              { label: "Dupliquer", onSelect: () => run(() => duplicateInvitationAction(invitation.id)) },
              { label: "Supprimer", tone: "danger", onSelect: () => setConfirming(true) },
            ]}
          />
        </div>

      </article>

      <ConfirmDialog
        open={confirming}
        loading={pending}
        onClose={() => setConfirming(false)}
        onConfirm={() =>
          run(async () => {
            const result = await deleteInvitationAction(invitation.id);
            setConfirming(false);
            return result;
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
