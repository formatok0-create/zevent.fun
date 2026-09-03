"use client";

import { useEffect, useState, useTransition } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { useCopy } from "@/lib/hooks/use-copy";
import { InvitationExperience } from "@/templates/components/renderer";
import { getTemplate } from "@/templates/registry";
import { publicPathFor } from "@/lib/utils/public-url";
import { PaiementBloc } from "./paiement";
import { etatPaiementAction } from "@/app/dashboard/invitations/paiement-actions";
import { useOrigin } from "@/lib/hooks/use-origin";
import {
  publishInvitationAction,
  unpublishInvitationAction,
  updateSlugAction,
} from "@/app/dashboard/actions";
import type { InvitationWithPhotos } from "@/types/database";

/* ── Étape 6 : l’aperçu ─────────────────────────────────────── */

export function PreviewStep({ invitation }: { invitation: InvitationWithPhotos }) {
  const template = getTemplate(invitation.template_id);

  return (
    <div>
      <p className="max-w-md text-sm font-light leading-relaxed text-ink-soft">
        Voici exactement ce que verront vos invités. Faites défiler : chaque section se dévoile
        comme sur leur téléphone.
      </p>

      {/* Un cadre de téléphone, largeur fixe : sur mobile, l'aperçu
          pleine largeur ne montrait plus rien du rendu vertical. */}
      <div className="mt-9 mx-auto w-full max-w-[22rem]">
        <div className="overflow-hidden rounded-[2rem] border border-line bg-surface">
          <div className="flex items-center gap-2 border-b border-line px-4 py-3">
            <span aria-hidden className="size-1.5 rounded-full bg-line-strong" />
            <span aria-hidden className="size-1.5 rounded-full bg-line-strong" />
            <span aria-hidden className="size-1.5 rounded-full bg-line-strong" />
            <p className="eyebrow-sm ml-3 truncate text-ink-faint">
              zevent.fun{publicPathFor(invitation)}
            </p>
          </div>
          <div className="h-[min(34rem,68dvh)] overflow-x-hidden overflow-y-auto overscroll-contain">
            {/* L'aperçu montre tout : l'enveloppe à ouvrir et la
                musique qu'elle déclenche, comme chez l'invité. */}
            <InvitationExperience invitation={invitation} template={template} compact />
          </div>
        </div>
        <p className="eyebrow-sm mt-4 text-center text-ink-faint">
          Ouvrez l’enveloppe, puis faites défiler à l’intérieur du cadre
        </p>
      </div>
    </div>
  );
}

/* ── Étape 7 : la publication ───────────────────────────────── */

export function PublishStep({
  invitation,
  onPublished,
  tarif,
}: {
  invitation: InvitationWithPhotos;
  onPublished: (slug: string) => void;
  /* Null quand l'invitation est déjà payée, ou qu'aucun tarif n'est
     configuré pour son type. */
  tarif?: { montant: number; devise: string; libelle: string } | null;
}) {
  const { toast } = useToast();
  const { copied, copy } = useCopy();
  const reduced = useReducedMotion();
  const [pending, startTransition] = useTransition();
  const [slugDraft, setSlugDraft] = useState(invitation.slug ?? "");
  const [slugError, setSlugError] = useState<string | null>(null);

  const isPublished = invitation.status === "published";

  /* Interrogé au montage : tant que la réponse n'est pas là, on
     n'affiche ni la caisse ni le bouton de publication, pour ne pas
     faire clignoter l'un puis l'autre. */
  const [etat, setEtat] = useState<Awaited<ReturnType<typeof etatPaiementAction>> | null>(null);
  useEffect(() => {
    let vivant = true;
    etatPaiementAction(invitation.id)
      .then((r) => vivant && setEtat(r))
      .catch(() => vivant && setEtat(null));
    return () => {
      vivant = false;
    };
  }, [invitation.id, isPublished]);
  const origin = useOrigin();
  const url = invitation.slug ? `${origin}${publicPathFor(invitation)}` : null;

  const publish = () =>
    startTransition(async () => {
      const result = await publishInvitationAction(invitation.id);
      if (!result.ok) {
        toast({ title: "Publication impossible", description: result.message, tone: "danger" });
        return;
      }
      onPublished(result.data!.slug);
      setSlugDraft(result.data!.slug);
      toast({ title: "Invitation publiée", description: "Votre lien est actif.", tone: "success" });
    });

  const unpublish = () =>
    startTransition(async () => {
      const result = await unpublishInvitationAction(invitation.id);
      toast({
        title: result.ok ? "Invitation retirée" : "Action impossible",
        description: result.message,
        tone: result.ok ? "neutral" : "danger",
      });
      if (result.ok) onPublished("");
    });

  const saveSlug = () =>
    startTransition(async () => {
      setSlugError(null);
      const result = await updateSlugAction(invitation.id, slugDraft.trim());
      if (!result.ok) {
        setSlugError(result.message ?? null);
        return;
      }
      onPublished(result.data!.slug);
      toast({ title: "Lien mis à jour", tone: "success" });
    });

  /* Une invitation non payée passe par la caisse. Une fois payée, elle
     le reste : dépublier puis republier ne refacture pas.

     Tant que `etatPaiementAction` n'a pas répondu, on n'affiche NI la
     caisse NI le bouton de publication. Sans cette attente, le bouton
     « Publier » apparaissait une fraction de seconde avant d'être
     remplacé par la caisse — et un clic rapide partait dans
     `publishInvitation`, qui refuse une invitation impayée. Le
     clignotement ne faisait pas que gêner : il produisait l'erreur. */
  if (!isPublished && etat === null && !tarif) {
    return (
      <div className="max-w-xl" aria-busy="true">
        <div className="h-[4.5rem] animate-pulse border-y border-line" />
        <div className="mt-6 h-16 animate-pulse rounded-sm bg-ivory-deep" />
        <div className="mt-8 h-[5.5rem] animate-pulse rounded-sm border border-line bg-ivory-deep" />
        <span className="sr-only">Chargement des moyens de paiement…</span>
      </div>
    );
  }

  const aPayer = etat?.aPayer ?? Boolean(tarif);
  if (!isPublished && aPayer) {
    return (
      <PaiementBloc
        invitationId={invitation.id}
        montant={etat?.montant ?? tarif!.montant}
        devise={etat?.devise ?? tarif!.devise}
        libelle={etat?.libelle ?? tarif!.libelle}
        /* `undefined` = à interroger, `[]` = interrogé, rien de
           disponible. Sans cette distinction le bloc restait sur
           « Chargement des moyens de paiement… » indéfiniment. */
        fournisseurs={etat ? etat.fournisseurs : undefined}
      />
    );
  }

  if (!isPublished) {
    return (
      <div className="max-w-xl">
        <p className="text-sm font-light leading-relaxed text-ink-soft">
          En publiant, votre invitation reçoit une adresse publique. Toute personne disposant du
          lien pourra la consulter — et vous pourrez la retirer à tout moment.
        </p>
        <div className="mt-10">
          <Button size="lg" loading={pending} onClick={publish}>
            Publier mon invitation
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      {/* L’arche se trace : la seule célébration de l’interface. */}
      <motion.svg
        viewBox="0 0 64 74"
        aria-hidden
        className="h-16 w-14 text-gold"
        initial={reduced ? undefined : "hidden"}
        animate={reduced ? undefined : "shown"}
      >
        <motion.path
          d="M2 72V32a30 30 0 0 1 60 0v40"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          variants={{ hidden: { pathLength: 0 }, shown: { pathLength: 1 } }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </motion.svg>

      <h3 className="mt-7 font-display text-[clamp(2rem,5vw,2.75rem)] leading-tight">
        Votre invitation <span className="italic">est prête.</span>
      </h3>
      <p className="mt-4 text-sm font-light leading-relaxed text-ink-soft">
        Partagez ce lien à vos invités. Chaque modification que vous ferez apparaîtra
        automatiquement sur cette page.
      </p>

      <div className="mt-9 flex flex-wrap items-center gap-3 rounded-sm border border-line bg-surface px-5 py-4">
        <p className="min-w-0 flex-1 truncate text-sm font-light text-ink">{url}</p>
        <button
          type="button"
          onClick={() => url && copy(url)}
          className="eyebrow-sm link-draw shrink-0 text-ink transition-colors hover:text-burgundy"
        >
          {copied ? "Copié" : "Copier"}
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`Nous nous marions ! Voici notre invitation : ${url}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 items-center justify-center rounded-sm bg-burgundy px-7 uppercase leading-none tracking-[0.24em] text-[0.6875rem] text-ivory transition-colors duration-500 hover:bg-burgundy-deep"
        >
          Partager sur WhatsApp
        </a>
        <a
          href={url ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 items-center justify-center rounded-sm border border-ink/20 px-7 uppercase leading-none tracking-[0.24em] text-[0.6875rem] text-ink transition-colors duration-500 hover:border-ink hover:bg-ink hover:text-ivory"
        >
          Ouvrir l’invitation
        </a>
      </div>

      <div className="mt-14 border-t border-line pt-9">
        <Field
          label="Personnaliser le lien"
          hint="Lettres minuscules, chiffres et tirets. Modifier le lien rend l’ancien inactif."
          error={slugError ?? undefined}
        >
          {({ id, describedBy, invalid }) => (
            <div className="flex items-end gap-4">
              <div className="flex flex-1 items-baseline gap-1">
                <span className="shrink-0 text-sm font-light text-ink-faint">
                  zevent.fun/{invitation.product ?? "mariage"}/
                </span>
                <Input
                  id={id}
                  value={slugDraft}
                  aria-invalid={invalid}
                  aria-describedby={describedBy}
                  onChange={(event) => setSlugDraft(event.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                type="button"
                loading={pending}
                disabled={!slugDraft.trim() || slugDraft === invitation.slug}
                onClick={saveSlug}
              >
                Enregistrer
              </Button>
            </div>
          )}
        </Field>
      </div>

      <div className="mt-12 border-t border-line pt-7">
        <button
          type="button"
          onClick={unpublish}
          disabled={pending}
          className="eyebrow-sm link-draw text-ink-faint transition-colors hover:text-danger disabled:opacity-50"
        >
          Retirer l’invitation du web
        </button>
      </div>
    </div>
  );
}
