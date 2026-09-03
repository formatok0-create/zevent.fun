"use client";

import { motion, useReducedMotion } from "motion/react";
import { Frame } from "./opening";
import { Fleuron } from "./ornaments";
import { MoorishFrame } from "./moorish";
import type { SectionProps } from "./types";

const EASE = [0.16, 1, 0.3, 1] as const;

function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 1.2, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <Reveal className="mb-12 text-center">
      <p
        className="text-[0.75rem] font-medium uppercase text-[var(--tpl-accent)]"
        style={{ letterSpacing: "0.24em", fontFamily: "var(--tpl-sans)" }}
      >
        {eyebrow}
      </p>
      <h2
        className="mt-5 text-[clamp(2.1rem,8cqw,3rem)] leading-tight text-[var(--tpl-ink)]"
        style={{ fontFamily: "var(--tpl-script)" }}
      >
        {title}
      </h2>
      <Fleuron color="var(--tpl-accent)" width={210} className="mx-auto mt-6 block" />
    </Reveal>
  );
}

/* ── Notre histoire ─────────────────────────────────────────── */

export function StorySection({ invitation, template }: SectionProps) {
  if (!invitation.story?.trim()) return null;

  /* Pas d’image ici : le récit se lit, il ne s’illustre pas.
     Le cadre mauresque lui donne la place d’un panneau gravé. */
  return (
    <Frame id="histoire">
      <SectionTitle eyebrow="Notre histoire" title="Comment tout a commencé" />

      <Reveal delay={0.08}>
        <MoorishFrame christian={invitation.type === "chretien"} className="mx-auto max-w-xl">
          <div
            style={{ fontFamily: "var(--tpl-sans)", color: template.colors.ink }}
            className="space-y-6 text-center text-[clamp(1rem,3.8cqw,1.125rem)] font-normal leading-[1.95]"
          >
            {invitation.story
              .split(/\n{1,}/)
              .filter(Boolean)
              .map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
          </div>
        </MoorishFrame>
      </Reveal>
    </Frame>
  );
}

/* ── Galerie ────────────────────────────────────────────────── */

export function GallerySection({ invitation, template }: SectionProps) {
  const photos = invitation.photos;
  if (photos.length === 0) return null;

  /* Une mosaïque, pas une grille : la première photo tient la
     colonne de gauche en arche haute, les suivantes s’empilent. */
  const [lead, ...rest] = photos;
  const plateStyle = {
    "--plate-from": template.colors.plateFrom,
    "--plate-to": template.colors.plateTo,
  } as React.CSSProperties;

  return (
    <section id="galerie" className="px-6 py-20 sm:py-28">
      <div className="mx-auto w-full max-w-4xl">
        <SectionTitle eyebrow="Galerie" title="Quelques instants" />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5">
          <Reveal className="row-span-2">
            <figure className="arch-tall plate relative h-full min-h-[18rem] overflow-hidden sm:min-h-[26rem]" style={plateStyle}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={lead.url} alt={lead.caption ?? ""} loading="lazy" className="size-full object-cover" />
            </figure>
          </Reveal>

          {rest.map((photo, index) => {
            const arch = index % 3 === 1;
            return (
              <Reveal key={photo.id} delay={0.06 + (index % 3) * 0.07}>
                <figure
                  className={`plate relative overflow-hidden ${arch ? "arch aspect-[3/4]" : "aspect-square rounded-sm"}`}
                  style={plateStyle}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt={photo.caption ?? ""}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-[1.6s] ease-silk hover:scale-[1.05]"
                  />
                </figure>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
