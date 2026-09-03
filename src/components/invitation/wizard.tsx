"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { TypeStep, TemplateStep } from "./steps/choice";
import { CeremonyDetailsStep, type CeremonyStepHandle } from "./steps/ceremonies";
import {
  ceremonyValuesToDraft,
  emptyCeremonyInfo,
  invitationToCeremonyValues,
} from "@/lib/utils/ceremonies";
import type { CeremonyInfoValues } from "@/lib/validation/schemas";
import { PhotosStep, MusicStep } from "./steps/media";
import { PreviewStep, PublishStep } from "./steps/finish";
import {
  createInvitationAction,
  savePhotosAction,
  updateInvitationAction,
} from "@/app/dashboard/actions";
import { DEFAULT_TEMPLATE_ID, listTemplatesFor } from "@/templates/registry";
import { tracksFor } from "@/lib/music/library";
import type { InvitationWithPhotos, WeddingType } from "@/types/database";
import { cn } from "@/lib/utils/cn";

const STEPS = [
  { key: "type", index: "01", label: "Cérémonie", title: "Quel type de mariage célébrez-vous ?" },
  { key: "template", index: "02", label: "Collection", title: "Choisissez une écriture." },
  { key: "details", index: "03", label: "Informations", title: "Les informations essentielles." },
  { key: "photos", index: "04", label: "Photos", title: "Vos images." },
  { key: "music", index: "05", label: "Musique", title: "Une ambiance sonore." },
  { key: "preview", index: "06", label: "Aperçu", title: "Voici votre invitation." },
  { key: "publish", index: "07", label: "Publication", title: "Le moment du partage." },
] as const;

export function InvitationWizard({
  userId,
  invitation,
}: {
  userId: string;
  invitation?: InvitationWithPhotos;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const ceremonyRef = useRef<CeremonyStepHandle>(null);
  /* Le fil des sept etapes ne tient pas sur un telephone : il defile.
     Sans ce recentrage, on avancait a l'etape 05 sans jamais la voir. */
  const rail = useRef<HTMLElement>(null);
  const [saving, startSaving] = useTransition();

  const editing = Boolean(invitation);
  const [step, setStep] = useState(editing ? 2 : 0);
  const [id, setId] = useState<string | null>(invitation?.id ?? null);
  const [type, setType] = useState<WeddingType | null>(invitation?.type ?? null);
  const [templateId, setTemplateId] = useState(invitation?.template_id ?? DEFAULT_TEMPLATE_ID);
  /* Le formulaire des cérémonies vaut pour les deux religions :
     seules les cérémonies proposées changent. */
  const [ceremony, setCeremony] = useState<CeremonyInfoValues>(
    invitation ? invitationToCeremonyValues(invitation) : emptyCeremonyInfo("chretien"),
  );
  const [bridePhoto, setBridePhoto] = useState<string | null>(invitation?.bride_photo_url ?? null);
  const [groomPhoto, setGroomPhoto] = useState<string | null>(invitation?.groom_photo_url ?? null);
  const [gallery, setGallery] = useState<string[]>(invitation?.photos.map((p) => p.url) ?? []);
  const [cover, setCover] = useState<string | null>(invitation?.cover_image_url ?? null);
  const [music, setMusic] = useState({
    music_url: invitation?.music_url ?? null,
    music_title: invitation?.music_title ?? null,
  });

  /* Une invitation sans musique est une invitation muette : le premier
     morceau de la bibliothèque est proposé d’office, et reste changeable. */
  useEffect(() => {
    if (music.music_url || !type) return;
    const [first] = tracksFor(type);
    if (first) setMusic({ music_url: first.url, music_title: first.title });
  }, [type, music.music_url]);
  const [slug, setSlug] = useState(invitation?.slug ?? null);
  const [status, setStatus] = useState(invitation?.status ?? "draft");

  const current = STEPS[step];

  /* On amene l'etape courante au centre du rail a chaque changement. */
  useEffect(() => {
    const actif = rail.current?.querySelector<HTMLElement>('[aria-current="step"]');
    actif?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [step]);
  /* Le type choisi à l’étape 1 pilote les cérémonies proposées. */
  useEffect(() => {
    if (type && ceremony.weddingType !== type) {
      setCeremony((values) => ({ ...values, weddingType: type }));
    }
  }, [type, ceremony.weddingType]);

  /* Objet d’aperçu : la même forme que celle rendue en public. */
  const draftFields = useMemo(() => ceremonyValuesToDraft(ceremony), [ceremony]);

  const draft = useMemo<InvitationWithPhotos>(
    () => ({
      id: id ?? "draft",
      user_id: userId,
      type: type ?? "chretien",
      template_id: templateId,
      slug,
      /* L’aperçu lit la source qui correspond au type de cérémonie :
         sans cela le parcours musulman affichait des champs vides. */
      title: `${draftFields.bride_name} & ${draftFields.groom_name}`,
      groom_name: draftFields.groom_name || "Prénom",
      bride_name: draftFields.bride_name || "Prénom",
      wedding_date: draftFields.wedding_date,
      wedding_time: draftFields.wedding_time,
      venue: draftFields.venue,
      address: draftFields.address,
      description: draftFields.description,
      story: draftFields.story,
      music_url: music.music_url,
      music_title: music.music_title,
      cover_image_url: cover,
      bride_family: draftFields.bride_family || null,
      groom_family: draftFields.groom_family || null,
      bride_photo_url: bridePhoto,
      groom_photo_url: groomPhoto,
      events: draftFields.events,
      program: invitation?.program ?? null,
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
    [id, userId, type, templateId, slug, draftFields, music, gallery, bridePhoto, groomPhoto, status, invitation],
  );

  const canContinue =
    (current.key === "type" && Boolean(type)) ||
    (current.key === "template" && Boolean(templateId)) ||
    !["type", "template"].includes(current.key);

  /* Enregistre l’étape courante, puis avance. */
  const goNext = () =>
    startSaving(async () => {
      if (current.key === "details") {
        const values = await ceremonyRef.current?.submit();
        if (!values) {
          toast({ title: "Informations incomplètes", description: "Vérifiez les champs signalés.", tone: "danger" });
          return;
        }
        setCeremony(values);
        const payload = ceremonyValuesToDraft(values);

        if (!id) {
          const result = await createInvitationAction({ type: type!, template_id: templateId, info: values });
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

      if (current.key === "photos" && id) {
        await Promise.all([
          updateInvitationAction(id, {
            bride_photo_url: bridePhoto,
            groom_photo_url: groomPhoto,
            cover_image_url: cover,
          }),
          savePhotosAction(id, gallery),
        ]);
      }

      if (current.key === "music" && id) {
        await updateInvitationAction(id, music);
      }

      if (current.key === "template" && id) {
        await updateInvitationAction(id, { template_id: templateId, type: type ?? undefined });
      }

      setStep((value) => Math.min(value + 1, STEPS.length - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

  const goBack = () => {
    setStep((value) => Math.max(value - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    /* Les sept étapes portent la voix cerise ; les étapes partagées
       avec la fête (photos, musique, aperçu, publication) en héritent
       ici sans que la fête en soit affectée. */
    <div className="voix-cerise">
      {/* ── Le fil des étapes ────────────────────────────────── */}
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
                "group min-h-14 shrink-0 basis-[7.5rem] border-t-2 pr-4 pt-4 text-left transition-colors duration-500 ease-silk disabled:cursor-default sm:flex-1 sm:basis-auto sm:pr-6",
                active ? "border-burgundy" : done ? "border-gold/60" : "border-line",
              )}
            >
              <span className={cn("numeral block text-xs", active ? "text-burgundy" : "text-ink-faint")}>
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

      <h2 className="font-display text-[clamp(1.75rem,4.5vw,2.75rem)] leading-tight">
        {current.title}
      </h2>

      <div className="mt-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.key}
            initial={{ opacity: 0, y: 14, filter: "blur(5px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            {current.key === "type" && <TypeStep value={type} onChange={setType} />}

            {current.key === "template" && (
              <TemplateStep
                weddingType={type ?? "chretien"}
                value={
                  listTemplatesFor(type ?? "chretien").some((t) => t.id === templateId)
                    ? templateId
                    : (listTemplatesFor(type ?? "chretien")[0]?.id ?? DEFAULT_TEMPLATE_ID)
                }
                onChange={setTemplateId}
              />
            )}

            {current.key === "details" && (
              <CeremonyDetailsStep ref={ceremonyRef} defaultValues={ceremony} onChange={setCeremony} />
            )}

            {current.key === "photos" && (
              <PhotosStep
                userId={userId}
                gallery={gallery}
                onGalleryChange={setGallery}
                cover={{ scope: type ?? "chretien", value: cover, onChange: setCover }}
                portraits={{
                  brideName: ceremony.bride_name,
                  groomName: ceremony.groom_name,
                  bridePhoto,
                  groomPhoto,
                  onBrideChange: setBridePhoto,
                  onGroomChange: setGroomPhoto,
                }}
              />
            )}

            {current.key === "music" && (
              <MusicStep
                userId={userId}
                weddingType={type ?? "chretien"}
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

      {/* ── Le pied de parcours ──────────────────────────────── */}
      {current.key !== "publish" && (
        <div className="mt-16 flex flex-wrap items-center justify-between gap-6 border-t border-line pt-8">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className="eyebrow-sm link-draw inline-flex min-h-11 items-center text-ink-soft transition-colors hover:text-ink disabled:pointer-events-none disabled:opacity-30"
          >
            Retour
          </button>

          <div className="flex items-center gap-6">
            {id && (
              <button
                type="button"
                onClick={() => router.push(`/dashboard/invitations/${id}`)}
                className="eyebrow-sm link-draw inline-flex min-h-11 items-center text-ink-faint transition-colors hover:text-ink"
              >
                Enregistrer et quitter
              </button>
            )}
            <Button size="lg" loading={saving} disabled={!canContinue} onClick={goNext}>
              {current.key === "preview" ? "Passer à la publication" : "Continuer"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
