import { Reveal } from "@/components/motion/reveal";
import { AlbumRail } from "./album-rail";
import { FeteDecor, FeteRule } from "./motifs-fete";
import type { SectionProps } from "./types";
import type { AlbumEntry } from "@/types/database";
import { coverScopeOfAudience, defaultCoverFor } from "@/lib/covers";
import { luminance, rgba } from "@/lib/utils/color";

/* ═══════════════════════════════════════════════════════════════
   LES SECTIONS DE LA FÊTE
   Le mariage ouvre sur deux prénoms sous une arche. Un anniversaire
   ouvre sur un âge : c’est le seul chiffre que tout le monde retient.
   ═══════════════════════════════════════════════════════════════ */

function nameOf(invitation: SectionProps["invitation"]): string {
  return invitation.celebrant_name?.trim() || invitation.bride_name || "";
}

/* ── Le hero ─────────────────────────────────────────────────── */

export function HeroFeteSection({ invitation, template, compact }: SectionProps) {
  const name = nameOf(invitation);
  const age = invitation.celebrant_age;

  /* Les tranches 11 – 14, 15 – 17 et 18+ posent leur image d'en-tête
     derrière le carton. Les enfants gardent leur dégradé et leurs
     motifs semés : rien ne change pour eux. */
  const scope = coverScopeOfAudience(template.audience);
  const image = scope ? (invitation.cover_image_url ?? defaultCoverFor(scope)) : null;

  /* Le voile. Sans lui, le texte disparaît sur les images claires —
     Ballons du ciel est presque blanc, Costume noir presque noir. On
     dose donc selon la luminance du fond de la collection. */
  const clair = luminance(template.colors.background) > 0.5;
  const voile = clair
    ? `linear-gradient(180deg, ${rgba(template.colors.background, 0.62)}, ${rgba(template.colors.background, 0.88)})`
    : `linear-gradient(180deg, ${rgba(template.colors.background, 0.55)}, ${rgba(template.colors.background, 0.86)})`;

  return (
    <section
      className={`relative flex flex-col items-center justify-center overflow-hidden px-6 py-20 ${
        compact ? "min-h-[34rem]" : "min-h-dvh"
      }`}
      style={
        image
          ? undefined
          : { background: "linear-gradient(168deg, var(--tpl-plate-from), var(--tpl-plate-to))" }
      }
    >
      {image && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt=""
            aria-hidden
            className="absolute inset-0 size-full object-cover"
          />
          <span aria-hidden className="absolute inset-0" style={{ background: voile }} />
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-40"
            style={{
              background: `linear-gradient(to top, ${template.colors.background}, transparent)`,
            }}
          />
        </>
      )}

      {/* Les motifs ne se sèment que sur le dégradé : sur une photo,
          ils feraient du bruit. */}
      {!image && <FeteDecor decor={template.decor} tone="surface" />}

      {/* Le carton : c’est lui qu’on lit, posé sur le décor. */}
      <Reveal className="relative w-full max-w-md">
        <div
          className="relative rounded-[1.75rem] px-7 py-12 text-center sm:px-10 sm:py-14"
          style={{
            background: image
              ? rgba(template.colors.surface, 0.94)
              : template.colors.surface,
            border: "2px solid var(--tpl-accent)",
            backdropFilter: image ? "blur(6px)" : undefined,
          }}
        >
          <span
            aria-hidden
            className="absolute inset-2 rounded-[1.25rem]"
            style={{ border: "1px solid var(--tpl-line)" }}
          />

          <div className="relative">
            <p
              className="text-[0.6rem] uppercase"
              style={{
                fontFamily: "var(--tpl-sans)",
                letterSpacing: "var(--tpl-tracking)",
                color: "var(--tpl-accent)",
              }}
            >
              Vous êtes invité
            </p>

            <h1
              className="mt-6 leading-[0.95]"
              style={{
                fontFamily: "var(--tpl-script)",
                fontSize: "var(--tpl-hero-scale)",
                fontWeight: 700,
                color: "var(--tpl-ink)",
                fontStyle: template.typography.namesItalic ? "italic" : "normal",
              }}
            >
              {name}
            </h1>

            {age != null && (
              <>
                <p
                  className="mt-4 text-[0.7rem] uppercase"
                  style={{
                    fontFamily: "var(--tpl-sans)",
                    letterSpacing: "var(--tpl-tracking)",
                    color: "var(--tpl-ink-soft)",
                  }}
                >
                  {age <= 1 ? "fête son premier an" : `fête ses ${age} ans`}
                </p>

                <div className="mt-2 flex items-center justify-center gap-4">
                  <span aria-hidden className="h-px w-8" style={{ background: "var(--tpl-accent)", opacity: 0.5 }} />
                  <p
                    className="leading-[0.85]"
                    style={{
                      fontFamily: "var(--tpl-display)",
                      fontSize: "clamp(5rem, 26cqw, 9rem)",
                      fontWeight: 800,
                      color: "var(--tpl-accent)",
                    }}
                  >
                    {age}
                  </p>
                  <span aria-hidden className="h-px w-8" style={{ background: "var(--tpl-accent)", opacity: 0.5 }} />
                </div>
              </>
            )}

            <FeteRule decor={template.decor} className="mt-6" />

            {/* La phrase d'accueil, telle qu'elle a été écrite : en bas
                de casse et à taille lisible, pas en petites capitales
                où personne ne la remarquait. */}
            {invitation.description?.trim() && (
              <p
                className="mx-auto mt-7 max-w-sm text-[0.95rem] leading-[1.7]"
                style={{ fontFamily: "var(--tpl-sans)", color: "var(--tpl-ink)" }}
              >
                {invitation.description.trim()}
              </p>
            )}

            <div
              className="mt-7 space-y-2 text-[0.72rem] uppercase"
              style={{
                fontFamily: "var(--tpl-sans)",
                letterSpacing: "var(--tpl-tracking)",
                color: "var(--tpl-ink-soft)",
              }}
            >
              {invitation.wedding_date && (
                <p style={{ color: "var(--tpl-ink)" }}>{formatDate(invitation.wedding_date)}</p>
              )}
              {invitation.wedding_time && <p>{invitation.wedding_time.slice(0, 5)}</p>}
              {invitation.venue && <p>{invitation.venue}</p>}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ── Le mot des parents ──────────────────────────────────────
   Il était saisi à l'étape « Informations » et n'était affiché
   nulle part : la section manquait, tout simplement. */

export function MotFeteSection({ invitation, template }: SectionProps) {
  const mot = invitation.story?.trim();
  if (!mot) return null;

  return (
    <section className="relative overflow-hidden px-6 py-20 sm:py-28">
      <div className="relative mx-auto w-full max-w-2xl text-center">
        <Reveal>
          <FeteRule decor={template.decor} />
          <p
            className="mt-10 whitespace-pre-line text-[clamp(1.05rem,3.6cqw,1.4rem)] leading-[1.75]"
            style={{ fontFamily: "var(--tpl-sans)", color: "var(--tpl-ink)" }}
          >
            {mot}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ── L’album des années ──────────────────────────────────────── */

export function AlbumSection({ invitation, template }: SectionProps) {
  const entries = normalizeAlbum(invitation.album);
  if (entries.length === 0) return null;

  const first = entries[0];
  const last = entries[entries.length - 1];

  return (
    <section id="album" className="relative overflow-hidden px-6 py-20 sm:py-28">
      <div className="relative mx-auto w-full max-w-4xl">
        <Reveal>
          <div className="text-center">
            <p
              className="text-[0.6rem] uppercase"
              style={{
                fontFamily: "var(--tpl-sans)",
                letterSpacing: "var(--tpl-tracking)",
                color: "var(--tpl-accent)",
              }}
            >
              L’album des années
            </p>
            <h2
              className="mt-5 text-[clamp(1.9rem,6cqw,3rem)] leading-tight"
              style={{ fontFamily: "var(--tpl-display)", color: "var(--tpl-ink)" }}
            >
              {first.year === last.year ? first.year : `De ${first.year} à ${last.year}`}
            </h2>
            <p
              className="mx-auto mt-5 max-w-md text-[0.9rem] leading-[1.8]"
              style={{ fontFamily: "var(--tpl-sans)", color: "var(--tpl-ink-soft)" }}
            >
              {entries.length === 1
                ? "Un souvenir, pour commencer."
                : `${entries.length} souvenirs, un par année. Faites glisser pour remonter le temps.`}
            </p>
            <FeteRule decor={template.decor} className="mt-8" />
          </div>
        </Reveal>

        <div className="mt-12">
          <AlbumRail entries={entries} />
        </div>
      </div>
    </section>
  );
}

/* ── La galerie de la fête ───────────────────────────────────
   Pas de mosaïque en arches ici : les photos gardent leur cadrage
   d'origine, on se contente d'arrondir les coins. */

export function GalleryFeteSection({ invitation, template }: SectionProps) {
  const photos = invitation.photos;
  if (photos.length === 0) return null;

  return (
    <section id="galerie" className="px-6 py-20 sm:py-28">
      <div className="mx-auto w-full max-w-4xl">
        <Reveal>
          <div className="text-center">
            <p
              className="text-[0.6rem] uppercase"
              style={{
                fontFamily: "var(--tpl-sans)",
                letterSpacing: "var(--tpl-tracking)",
                color: "var(--tpl-accent)",
              }}
            >
              Galerie
            </p>
            <h2
              className="mt-5 text-[clamp(1.9rem,6cqw,3rem)] leading-tight"
              style={{ fontFamily: "var(--tpl-display)", color: "var(--tpl-ink)" }}
            >
              Quelques instants
            </h2>
            <FeteRule decor={template.decor} className="mt-8" />
          </div>
        </Reveal>

        {/* Colonnes en maçonnerie : chaque image garde ses proportions. */}
        <div className="mt-12 columns-2 gap-4 sm:columns-3 sm:gap-5">
          {photos.map((photo, index) => (
            <Reveal key={photo.id} delay={0.05 + (index % 3) * 0.07}>
              <figure
                className="mb-4 overflow-hidden rounded-[1.25rem] sm:mb-5"
                style={{ boxShadow: "0 0 0 1px var(--tpl-line)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.caption ?? ""}
                  loading="lazy"
                  className="w-full"
                />
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Le mot de fin ───────────────────────────────────────────── */

export function ClosingFeteSection({ invitation, template }: SectionProps) {
  const name = nameOf(invitation);

  return (
    <section
      className="relative overflow-hidden px-6 py-24 text-center sm:py-32"
      style={{ background: "var(--tpl-accent-soft)" }}
    >
      <FeteDecor decor={template.decor} scale={0.9} />
      <div className="relative mx-auto max-w-xl">
        <Reveal>
          <FeteRule decor={template.decor} />
          <p
            className="mt-10 text-[clamp(1.4rem,5cqw,2.1rem)] leading-[1.5]"
            style={{ fontFamily: "var(--tpl-display)", color: "var(--tpl-ink)" }}
          >
            On compte sur vous.
          </p>
          <p
            className="mt-8 leading-none"
            style={{
              fontFamily: "var(--tpl-script)",
              fontSize: "clamp(2.2rem,9cqw,3.6rem)",
              color: "var(--tpl-accent)",
              fontStyle: template.typography.namesItalic ? "italic" : "normal",
            }}
          >
            {name}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Utilitaires ─────────────────────────────────────────────── */

/** L’album est saisi par l’utilisateur : on trie, on jette les
 *  entrées incomplètes, et on ne fait jamais confiance à l’ordre. */
function normalizeAlbum(album: AlbumEntry[] | null | undefined): AlbumEntry[] {
  if (!Array.isArray(album)) return [];
  return album
    .filter(
      (entry) =>
        Number.isFinite(entry?.year) &&
        Number.isFinite(entry?.age) &&
        /* Une année sans photo n'a pas de carte : l'album ne montre
           que ce qui a réellement été rempli. */
        Boolean(entry?.url),
    )
    .sort((a, b) => a.year - b.year);
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(date);
}
