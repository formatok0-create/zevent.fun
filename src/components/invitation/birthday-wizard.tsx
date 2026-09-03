"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  AlbumStep,
  BirthdayDetailsStep,
  BirthdayTemplateStep,
  ProgramStep,
  type BirthdayStepHandle,
} from "./steps/fete";
import { PhotosStep, MusicStep } from "./steps/media";
import { PreviewStep, PublishStep } from "./steps/finish";
import {
  createInvitationAction,
  saveAlbumAction,
  saveProgramAction,
  savePhotosAction,
  updateInvitationAction,
} from "@/app/dashboard/actions";
import {
  BIRTHDAY_BRACKETS,
  DEFAULT_BIRTHDAY_TEMPLATE_BY_AUDIENCE,
  DEFAULT_BIRTHDAY_TEMPLATE_ID,
  bracketOfAudience,
  listTemplatesForProduct,
} from "@/templates/registry";
import type { TemplateAudience } from "@/templates/types";
import { coverScopeOfAudience } from "@/lib/covers";
import {
  birthdayValuesToDraft,
  emptyBirthdayInfo,
  invitationToBirthdayValues,
} from "@/lib/utils/birthday";
import type { BirthdayInfoValues } from "@/lib/validation/schemas";
import type { AlbumEntry, InvitationWithPhotos, ProgramEntry } from "@/types/database";
import { cn } from "@/lib/utils/cn";

/* ═══════════════════════════════════════════════════════════════
   LE PARCOURS DE LA FÊTE
   Même ossature que le mariage, six étapes au lieu de sept : pas
   d'étape « cérémonie », mais une étape « album » qui n'existe
   nulle part ailleurs.
   ═══════════════════════════════════════════════════════════════ */

const STEPS = [
  { key: "template", index: "01", label: "Collection", title: "Choisissez une écriture." },
  { key: "details", index: "02", label: "Informations", title: "Qui fête, quand, et où." },
  { key: "program", index: "03", label: "Programme", title: "Le déroulé de la journée." },
  { key: "album", index: "04", label: "Album", title: "Les années d’avant." },
  { key: "photos", index: "05", label: "Photos", title: "Vos images." },
  { key: "music", index: "06", label: "Musique", title: "Une ambiance sonore." },
  { key: "preview", index: "07", label: "Aperçu", title: "Voici votre invitation." },
  { key: "publish", index: "08", label: "Publication", title: "Le moment du partage." },
] as const;

export function BirthdayWizard({
  userId,
  audience,
  invitation,
}: {
  userId: string;
  audience?: TemplateAudience;
  invitation?: InvitationWithPhotos;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const detailsRef = useRef<BirthdayStepHandle>(null);
  const [saving, startSaving] = useTransition();

  const editing = Boolean(invitation);
  /* Le fil des huit etapes ne tient pas sur un telephone : il defile.
     On y recentre l'etape courante, comme cote mariage. */
  const rail = useRef<HTMLElement>(null);
  const [step, setStep] = useState(editing ? 1 : 0);
  const [id, setId] = useState<string | null>(invitation?.id ?? null);
  const fallbackTemplate = audience
    ? (DEFAULT_BIRTHDAY_TEMPLATE_BY_AUDIENCE[audience] ?? DEFAULT_BIRTHDAY_TEMPLATE_ID)
    : DEFAULT_BIRTHDAY_TEMPLATE_ID;
  const [templateId, setTemplateId] = useState(invitation?.template_id ?? fallbackTemplate);
  const [info, setInfo] = useState<BirthdayInfoValues>(
    invitation ? invitationToBirthdayValues(invitation) : emptyBirthdayInfo(),
  );
  const [album, setAlbum] = useState<AlbumEntry[]>(invitation?.album ?? []);
  const [program, setProgram] = useState<ProgramEntry[]>(invitation?.program ?? []);
  const [gallery, setGallery] = useState<string[]>(invitation?.photos.map((p) => p.url) ?? []);
  const [cover, setCover] = useState<string | null>(invitation?.cover_image_url ?? null);
  const [music, setMusic] = useState({
    music_url: invitation?.music_url ?? null,
    music_title: invitation?.music_title ?? null,
  });
  const [slug, setSlug] = useState(invitation?.slug ?? null);
  const [status, setStatus] = useState(invitation?.status ?? "draft");

  const current = STEPS[step];

  /* On amene l'etape courante au centre du rail a chaque changement. */
  useEffect(() => {
    const actif = rail.current?.querySelector<HTMLElement>('[aria-current="step"]');
    actif?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [step]);
  /* La tranche d'age decide des bornes, des collections proposees et
     du rayon d'en-tetes. Les enfants n'ont pas d'en-tete a choisir. */
  const bracket = BIRTHDAY_BRACKETS[bracketOfAudience(audience)];
  const coverScope = coverScopeOfAudience(audience);
  const draftFields = useMemo(() => birthdayValuesToDraft(info), [info]);

  /* L’aperçu a exactement la forme de la page publique. */
  const draft = useMemo<InvitationWithPhotos>(
    () => ({
      id: id ?? "draft",
      user_id: userId,
      product: "anniversaire",
      type: null,
      template_id: templateId,
      slug,
      title: `${draftFields.celebrant_name || "Prénom"} — ${draftFields.celebrant_age} ans`,
      groom_name: null,
      bride_name: null,
      celebrant_name: draftFields.celebrant_name || "Prénom",
      celebrant_age: draftFields.celebrant_age,
      album,
      wedding_date: draftFields.wedding_date,
      wedding_time: draftFields.wedding_time,
      venue: draftFields.venue,
      address: draftFields.address,
      description: draftFields.description,
      story: draftFields.story,
      music_url: music.music_url,
      music_title: music.music_title,
      cover_image_url: cover,
      bride_family: null,
      groom_family: null,
      bride_photo_url: null,
      groom_photo_url: null,
      events: null,
      program: program.length > 0 ? program : null,
      status,
      created_at: invitation?.created_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
      published_at: invitation?.published_at ?? null,
      paid_at: null,
      plan_code: null,
      expires_at: null,
      photos: gallery.map((url, position) => ({
        id: `preview-${position}`,
        invitation_id: id ?? "draft",
        url,
        caption: null,
        position,
        created_at: new Date().toISOString(),
      })),
    }),
    [id, userId, templateId, slug, draftFields, album, program, music, gallery, cover, status, invitation],
  );

  const canContinue = current.key !== "template" || Boolean(templateId);

  const goNext = () =>
    startSaving(async () => {
      if (current.key === "details") {
        const values = await detailsRef.current?.submit();
        if (!values) {
          toast({
            title: "Informations incomplètes",
            description: "Vérifiez les champs signalés.",
            tone: "danger",
          });
          return;
        }
        setInfo(values);
        const payload = birthdayValuesToDraft(values);

        if (!id) {
          const result = await createInvitationAction({
            product: "anniversaire",
            template_id: templateId,
            info: values,
          });
          if (!result.ok) {
            toast({ title: "Création impossible", description: result.message, tone: "danger" });
            return;
          }
          setId(result.data!.id);
        } else {
          const result = await updateInvitationAction(id, { ...payload, template_id: templateId });
          if (!result.ok) {
            toast({ title: "Enregistrement impossible", description: result.message, tone: "danger" });
            return;
          }
        }
      }

      if (current.key === "program" && id) {
        const result = await saveProgramAction(id, program);
        if (!result.ok) {
          toast({ title: "Programme non enregistré", description: result.message, tone: "danger" });
          return;
        }
      }

      if (current.key === "album" && id) {
        const result = await saveAlbumAction(id, album);
        if (!result.ok) {
          toast({ title: "Album non enregistré", description: result.message, tone: "danger" });
          return;
        }
      }

      if (current.key === "photos" && id) {
        await Promise.all([
          savePhotosAction(id, gallery),
          updateInvitationAction(id, { cover_image_url: cover }),
        ]);
      }
      if (current.key === "music" && id) await updateInvitationAction(id, music);
      if (current.key === "template" && id) await updateInvitationAction(id, { template_id: templateId });

      setStep((value) => Math.min(value + 1, STEPS.length - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

  const goBack = () => {
    setStep((value) => Math.max(value - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="voix-agrume">
      <nav
        ref={rail}
        aria-label="Étapes"
        className="zv-rail-etapes mb-12 flex gap-px overflow-x-auto no-scrollbar sm:mb-14"
      >
        {STEPS.map((entry, index) => {
          const done = index < step;
          const active = index === step;
          return (
            <button
              key={entry.key}
              type="button"
              disabled={index > step}
              onClick={() => setStep(index)}
              aria-current={active ? "step" : undefined}
              className={cn(
                "group min-h-14 shrink-0 basis-[7.5rem] border-t-2 pr-4 pt-4 sm:flex-1 sm:basis-auto sm:pr-6 text-left transition-colors duration-500 ease-silk disabled:cursor-default",
                active ? "border-flamme" : done ? "border-flamme/50" : "border-line",
              )}
            >
              <span className={cn("numeral block text-xs", active ? "text-flamme" : "text-ink-faint")}>
                {entry.index}
              </span>
              <span
                className={cn(
                  "eyebrow-sm mt-1.5 block whitespace-nowrap",
                  active ? "text-ink" : done ? "text-ink-soft" : "text-ink-faint",
                )}
              >
                {entry.label}
              </span>
            </button>
          );
        })}
      </nav>

      <h2 className="font-fete text-[clamp(1.9rem,5vw,3rem)] font-bold leading-tight tracking-[-0.02em]">{current.title}</h2>

      <div className="mt-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.key}
            initial={{ opacity: 0, y: 14, filter: "blur(5px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            {current.key === "template" && (
              <BirthdayTemplateStep
                audience={audience}
                value={
                  listTemplatesForProduct("anniversaire", audience).some((t) => t.id === templateId)
                    ? templateId
                    : fallbackTemplate
                }
                onChange={setTemplateId}
              />
            )}

            {current.key === "details" && (
              <BirthdayDetailsStep
                ref={detailsRef}
                defaultValues={info}
                bounds={{ min: bracket.min, max: bracket.max, range: bracket.range }}
                onChange={setInfo}
              />
            )}

            {current.key === "program" && (
              <ProgramStep entries={program} onChange={setProgram} />
            )}

            {current.key === "album" && (
              <AlbumStep
                userId={userId}
                age={info.celebrant_age}
                partyDate={info.party_date}
                entries={album}
                onChange={setAlbum}
              />
            )}

            {current.key === "photos" && (
              <PhotosStep
                userId={userId}
                gallery={gallery}
                onGalleryChange={setGallery}
                cover={
                  coverScope ? { scope: coverScope, value: cover, onChange: setCover } : undefined
                }
              />
            )}

            {current.key === "music" && (
              <MusicStep
                userId={userId}
                library={[]}
                url={music.music_url}
                title={music.music_title}
                onChange={(patch) => setMusic((value) => ({ ...value, ...patch }))}
              />
            )}

            {current.key === "preview" && <PreviewStep invitation={draft} />}

            {current.key === "publish" && id && (
              <PublishStep
                invitation={{ ...draft, id }}
                onPublished={(newSlug) => {
                  setSlug(newSlug || null);
                  setStatus(newSlug ? "published" : "unpublished");
                  router.refresh();
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {current.key !== "publish" && (
        <div className="mt-16 flex flex-wrap items-center justify-between gap-6 border-t border-line pt-8">
          <Button
            voice="fete"
            variant="outline"
            size="sm"
            type="button"
            onClick={goBack}
            disabled={step === 0}
          >
            Retour
          </Button>

          <div className="flex items-center gap-6">
            {id && (
              <Button
                voice="fete"
                variant="nuit"
                size="sm"
                type="button"
                onClick={() => router.push(`/dashboard/invitations/${id}`)}
              >
                Enregistrer et quitter
              </Button>
            )}
            <Button voice="fete" size="lg" loading={saving} disabled={!canContinue} onClick={goNext}>
              {current.key === "preview" ? "Passer à la publication" : "Continuer"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
