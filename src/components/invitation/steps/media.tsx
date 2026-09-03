"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plate } from "@/components/ui/plate";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { uploadAudio, uploadImage, UploadError } from "@/lib/services/storage";
import { tracksFor, type Track } from "@/lib/music/library";
import { coversFor, isLibraryCover, type CoverScope } from "@/lib/covers";
import type { WeddingType } from "@/types/database";
import { cn } from "@/lib/utils/cn";

/* ── Étape 4 : les photos ───────────────────────────────────── */

export interface PortraitsConfig {
  brideName: string;
  groomName: string;
  bridePhoto: string | null;
  groomPhoto: string | null;
  onBrideChange: (url: string | null) => void;
  onGroomChange: (url: string | null) => void;
}

export function PhotosStep({
  userId,
  gallery,
  onGalleryChange,
  portraits,
  cover,
}: {
  userId: string;
  gallery: string[];
  onGalleryChange: (urls: string[]) => void;
  /** Mariage musulman : les deux portraits affichés côte à côte. */
  portraits?: PortraitsConfig;
  /** L'en-tête : six images livrées, ou la sienne. */
  cover?: CoverConfig;
}) {
  const { toast } = useToast();
  const [busy, setBusy] = useState<"gallery" | "cover" | null>(null);
  const galleryInput = useRef<HTMLInputElement>(null);

  const handle = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy("gallery");
    try {
      const remaining = Math.max(0, 12 - gallery.length);
      const batch = Array.from(files).slice(0, remaining);
      const uploaded = await Promise.all(batch.map((file) => uploadImage(file, "gallery", userId)));
      onGalleryChange([...gallery, ...uploaded.map((item) => item.url)]);
    } catch (error) {
      toast({
        title: "Envoi impossible",
        description: error instanceof UploadError ? error.message : "Réessayez dans un instant.",
        tone: "danger",
      });
    } finally {
      setBusy(null);
    }
  };

  const uploadCover = async (files: FileList | null) => {
    if (!files?.length || !cover) return;
    setBusy("cover");
    try {
      const { url } = await uploadImage(files[0], "covers", userId);
      cover.onChange(url);
    } catch (error) {
      toast({
        title: "Envoi impossible",
        description: error instanceof UploadError ? error.message : "Réessayez dans un instant.",
        tone: "danger",
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-16">
      {cover && (
        <CoverPicker
          scope={cover.scope}
          value={cover.value}
          busy={busy === "cover"}
          onChange={cover.onChange}
          onUpload={uploadCover}
        />
      )}
      {portraits && <PortraitsFields userId={userId} config={portraits} />}

      <section>
        <div className="flex items-baseline justify-between gap-4 border-t border-line pt-8">
          <h3 className="eyebrow text-ink-soft">Galerie</h3>
          <span className="eyebrow-sm text-ink-faint">{gallery.length} / 12</span>
        </div>
        <p className="mt-3 max-w-md text-sm font-light leading-relaxed text-ink-soft">
          Quelques photos suffisent. Elles sont cadrées et rythmées automatiquement par la
          collection choisie.
        </p>

        <div className="mt-8 grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          <AnimatePresence initial={false}>
            {gallery.map((url, index) => (
              <motion.div
                key={url}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="group relative"
              >
                <Plate src={url} shape="square" ratio="aspect-square" sizes="140px" />
                <button
                  type="button"
                  aria-label={`Retirer la photo ${index + 1}`}
                  onClick={() => onGalleryChange(gallery.filter((item) => item !== url))}
                  className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-xs bg-surface/90 text-xs text-ink-soft opacity-0 transition-opacity duration-300 hover:text-danger group-hover:opacity-100 focus-visible:opacity-100"
                >
                  ×
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {gallery.length < 12 && (
            <>
              <input
                ref={galleryInput}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(event) => handle(event.target.files)}
              />
              <button
                type="button"
                onClick={() => galleryInput.current?.click()}
                disabled={busy === "gallery"}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-sm border border-dashed border-line-strong text-ink-faint transition-colors duration-500 hover:border-gold hover:text-gold",
                  busy === "gallery" && "animate-[zv-breathe_1.6s_ease-in-out_infinite]",
                )}
              >
                <span className="eyebrow-sm">{busy === "gallery" ? "Envoi…" : "Ajouter"}</span>
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

/* ── Étape 5 : la musique ───────────────────────────────────── */

export function MusicStep({
  userId,
  weddingType,
  library: providedLibrary,
  url,
  onChange,
}: {
  userId: string;
  weddingType?: WeddingType;
  /** La fête n'a pas encore de bibliothèque : on lui passe un tableau
   *  vide, et seul l'envoi d'un morceau personnel reste proposé. */
  library?: Track[];
  url: string | null;
  title: string | null;
  onChange: (patch: { music_url?: string | null; music_title?: string | null }) => void;
}) {
  const library = providedLibrary ?? tracksFor(weddingType ?? "chretien");
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const sendOwn = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const { url: uploaded } = await uploadAudio(files[0], userId);
      onChange({ music_url: uploaded, music_title: files[0].name.replace(/\.[^.]+$/, "") });
    } catch (error) {
      toast({
        title: "Envoi impossible",
        description: error instanceof UploadError ? error.message : "Réessayez dans un instant.",
        tone: "danger",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-12">
      <p className="max-w-md text-sm font-light leading-relaxed text-ink-soft">
        La musique démarre au moment où votre invité ouvre l’enveloppe, et il peut la couper à
        tout instant. Ces morceaux sont hébergés par Zevent : ils se chargent instantanément.
      </p>

      <ul>
        <li>
          <button
            type="button"
            onClick={() => onChange({ music_url: null, music_title: null })}
            aria-pressed={!url}
            className={cn(
              "flex w-full items-center justify-between gap-4 border-t px-1 py-5 text-left transition-colors duration-500",
              !url ? "border-gold" : "border-line hover:border-line-strong",
            )}
          >
            <span className={cn("font-display text-[1.25rem] leading-none", !url && "text-burgundy")}>
              Aucune musique
            </span>
            <span
              className={cn(
                "shrink-0 rounded-full px-4 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] transition-colors duration-500",
                !url ? "bg-gold text-ivory" : "border border-ink/20 text-ink-soft group-hover:border-ink",
              )}
            >
              {!url ? "Choisi" : "Choisir"}
            </span>
          </button>
        </li>

        {library.map((track) => {
          const selected = url === track.url;
          return (
            <li key={track.id}>
              <button
                type="button"
                onClick={() => onChange({ music_url: track.url, music_title: track.title })}
                aria-pressed={selected}
                className={cn(
                  "flex w-full items-center justify-between gap-4 border-t px-1 py-5 text-left transition-colors duration-500",
                  selected ? "border-gold" : "border-line hover:border-line-strong",
                )}
              >
                <span>
                  <span className={cn("block font-display text-[1.25rem] leading-none", selected && "text-burgundy")}>
                    {track.title}
                  </span>
                  {track.artist && <span className="eyebrow-sm mt-2 block text-ink-faint">{track.artist}</span>}
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-4 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] transition-colors duration-500",
                    selected
                      ? "bg-gold text-ivory"
                      : "border border-ink/20 text-ink-soft group-hover:border-ink",
                  )}
                >
                  {selected ? "Choisie" : "Choisir"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {url && (
        <div className="rounded-sm border border-line bg-surface p-6">
          <p className="eyebrow-sm text-ink-faint">Écouter avant de choisir</p>
          <audio src={url} controls className="mt-4 w-full" preload="none" />
        </div>
      )}

      <section className="border-t border-line pt-9">
        <h3 className="eyebrow text-ink-soft">Votre propre musique</h3>
        <p className="mt-3 max-w-md text-sm font-light leading-relaxed text-ink-soft">
          Un MP3 ou un M4A de 6 Mo maximum — soit deux à trois minutes. Un extrait suffit :
          il tourne en boucle.
        </p>
        <input
          ref={fileInput}
          type="file"
          accept="audio/*"
          className="sr-only"
          onChange={(event) => sendOwn(event.target.files)}
        />
        <div className="mt-6">
          <Button
            variant="outline"
            size="sm"
            type="button"
            disabled={busy}
            onClick={() => fileInput.current?.click()}
          >
            {busy ? "Envoi en cours…" : "Choisir un fichier"}
          </Button>
        </div>
      </section>
    </div>
  );
}

/* ── Les portraits des mariés, côte à côte ──────────────────── */

function PortraitsFields({ userId, config }: { userId: string; config: PortraitsConfig }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState<"bride" | "groom" | null>(null);
  const brideInput = useRef<HTMLInputElement>(null);
  const groomInput = useRef<HTMLInputElement>(null);

  const pick = async (files: FileList | null, who: "bride" | "groom") => {
    if (!files?.length) return;
    setBusy(who);
    try {
      const { url } = await uploadImage(files[0], "portraits", userId);
      if (who === "bride") config.onBrideChange(url);
      else config.onGroomChange(url);
    } catch (error) {
      toast({
        title: "Envoi impossible",
        description: error instanceof UploadError ? error.message : "Réessayez dans un instant.",
        tone: "danger",
      });
    } finally {
      setBusy(null);
    }
  };

  const people = [
    { key: "bride" as const, name: config.brideName || "La mariée", photo: config.bridePhoto, input: brideInput, clear: () => config.onBrideChange(null) },
    { key: "groom" as const, name: config.groomName || "Le marié", photo: config.groomPhoto, input: groomInput, clear: () => config.onGroomChange(null) },
  ];

  return (
    <section>
      <h3 className="eyebrow text-ink-soft">Portraits des mariés</h3>
      <p className="mt-3 max-w-md text-sm font-light leading-relaxed text-ink-soft">
        Ils s’affichent côte à côte, en haut de l’invitation. Un cadrage portrait donne le
        meilleur résultat.
      </p>

      <div className="mt-8 grid max-w-md grid-cols-2 gap-6 sm:gap-10">
        {people.map((person) => (
          <div key={person.key}>
            <Plate
              src={person.photo}
              shape="arch"
              ratio="aspect-[3/4]"
              monogram={person.photo ? undefined : person.name[0]?.toUpperCase()}
              frame={Boolean(person.photo)}
              sizes="200px"
            />
            <p className="mt-4 text-center font-display text-[1.0625rem] leading-none">{person.name}</p>
            <div className="mt-3 flex flex-col items-center gap-1.5">
              <input
                ref={person.input}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => pick(event.target.files, person.key)}
              />
              <button
                type="button"
                disabled={busy === person.key}
                onClick={() => person.input.current?.click()}
                className="eyebrow-sm link-draw text-ink transition-colors hover:text-burgundy disabled:opacity-50"
              >
                {busy === person.key ? "Envoi…" : person.photo ? "Remplacer" : "Ajouter"}
              </button>
              {person.photo && (
                <button
                  type="button"
                  onClick={person.clear}
                  className="eyebrow-sm link-draw text-ink-faint transition-colors hover:text-danger"
                >
                  Retirer
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


/* ═══════════════════════════════════════════════════════════════
   L'EN-TÊTE
   Six images par confession, dessinées pour le hero. Le couple en
   choisit une d'un tap, ou envoie la sienne — dans les deux cas la
   valeur atterrit dans `cover_image_url`.
   ═══════════════════════════════════════════════════════════════ */

export interface CoverConfig {
  scope: CoverScope;
  value: string | null;
  onChange: (url: string | null) => void;
}

function CoverPicker({
  scope,
  value,
  busy,
  onChange,
  onUpload,
}: {
  scope: CoverScope;
  value: string | null;
  busy: boolean;
  onChange: (url: string | null) => void;
  onUpload: (files: FileList | null) => void;
}) {
  const library = coversFor(scope);
  const custom = Boolean(value) && !isLibraryCover(value);

  return (
    <section>
      <header className="mb-8">
        <p className="eyebrow text-gold">L’en-tête</p>
        <h3 className="mt-4 font-display text-[1.75rem] leading-tight">
          La première image que l’on voit.
        </h3>
        <p className="mt-3 max-w-md text-sm font-light leading-[1.8] text-ink-soft">
          Elle occupe le haut de l’invitation, derrière vos prénoms. Choisissez-en une,
          ou envoyez la vôtre.
        </p>
      </header>

      <fieldset>
        <legend className="sr-only">En-tête</legend>
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-5 sm:gap-5 lg:grid-cols-6">
          {library.map((image) => {
            const selected = value === image.src;
            return (
              <button
                key={image.id}
                type="button"
                onClick={() => onChange(image.src)}
                aria-pressed={selected}
                title={image.label}
                className="group text-left"
              >
                <span
                  className={cn(
                    "arch relative block aspect-[3/4] w-full overflow-hidden border transition-colors duration-500 ease-silk",
                    selected ? "border-gold" : "border-line group-hover:border-line-strong",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.thumb} alt={image.label} className="size-full object-cover" />
                  {selected && (
                    <span
                      aria-hidden
                      className="absolute inset-0 grid place-items-center bg-ink/25 text-sm text-ivory"
                    >
                      ✓
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    "mt-2.5 block text-[0.6rem] uppercase leading-tight tracking-[0.14em]",
                    selected ? "text-ink" : "text-ink-faint",
                  )}
                >
                  {image.label}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-9 flex flex-wrap items-center gap-6 border-t border-line pt-6">
        <label className="inline-flex h-10 cursor-pointer items-center rounded-sm border border-ink/20 px-5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink hover:bg-ink hover:text-ivory">
          {busy ? "Envoi en cours…" : "Envoyer ma propre image"}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              onUpload(event.target.files);
              event.target.value = "";
            }}
          />
        </label>

        {custom && (
          <>
            <span className="eyebrow-sm text-gold">Votre image est utilisée</span>
            <Button variant="outline" size="sm" type="button" onClick={() => onChange(null)}>
              Revenir aux images de Zevent
            </Button>
          </>
        )}
      </div>
    </section>
  );
}
