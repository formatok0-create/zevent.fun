"use client";

import { motion, useReducedMotion } from "motion/react";
import { Frame } from "./opening";
import { SectionTitle } from "./story";
import { EVENT_LABELS, familyMessage, sortedEvents } from "@/lib/utils/events";
import { formatWeddingDateLong } from "@/lib/utils/date";
import { Cartouche, Fleuron, Lozenge, Rosette } from "./ornaments";
import { Rings, Dove } from "./clouds";
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
      transition={{ duration: 1.15, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* ── Les mariés : deux portraits, côte à côte ───────────────── */

export function CoupleSection({ invitation, template }: SectionProps) {
  const separator = template.typography.namesSeparator;

  const portraits = [
    { name: invitation.bride_name, photo: invitation.bride_photo_url, family: invitation.bride_family },
    { name: invitation.groom_name, photo: invitation.groom_photo_url, family: invitation.groom_family },
  ];

  return (
    <Frame id="maries">
      <div className="mx-auto grid max-w-md grid-cols-2 items-start gap-4 sm:gap-8">
        {portraits.map((person, index) => (
          <Reveal key={person.name} delay={index * 0.14}>
            <figure className={`text-center ${index === 1 ? "mt-10 sm:mt-14" : ""}`}>
              <div
                className="arch plate relative aspect-[3/4] overflow-hidden ring-1 ring-inset"
                style={
                  {
                    "--plate-from": template.colors.plateFrom,
                    "--plate-to": template.colors.plateTo,
                    "--tw-ring-color": `${template.colors.accent}55`,
                  } as React.CSSProperties
                }
              >
                {person.photo ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={person.photo} alt={person.name ?? ""} className="size-full object-cover" />
                ) : (
                  <>
                    <span
                      aria-hidden
                      className="arch absolute inset-[10%] border"
                      style={{ borderColor: `${template.colors.accent}66` }}
                    />
                    <span className="absolute inset-0 grid place-items-center font-display text-3xl" style={{ color: `${template.colors.ink}66` }}>
                      {person.name?.[0]?.toUpperCase()}
                    </span>
                  </>
                )}
              </div>

              <figcaption className="mt-5">
                <p
                  className="text-[clamp(1.75rem,8cqw,2.5rem)] leading-tight"
                  style={{ fontFamily: "var(--tpl-script)", color: template.colors.ink }}
                >
                  {person.name}
                </p>
                {person.family && (
                  <p
                    className="mt-2.5 text-[0.6875rem] font-medium uppercase"
                    style={{ color: template.colors.inkSoft, letterSpacing: "0.18em", fontFamily: "var(--tpl-sans)" }}
                  >
                    Famille {person.family}
                  </p>
                )}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.3} className="mt-10 flex items-center justify-center gap-5">
        <span aria-hidden className="h-px w-12" style={{ background: template.colors.accent }} />
        <span className="text-3xl" style={{ fontFamily: "var(--tpl-script)", color: template.colors.accent }}>
          {separator}
        </span>
        <span aria-hidden className="h-px w-12" style={{ background: template.colors.accent }} />
      </Reveal>
    </Frame>
  );
}

/* ── Le message des familles ────────────────────────────────── */

export function FamiliesSection({ invitation, template }: SectionProps) {
  const message = familyMessage(invitation);
  if (!message) return null;

  return (
    <Frame>
      <Reveal>
        <Cartouche className="mx-auto max-w-xl">
          <p
            className="text-center uppercase text-[0.5625rem]"
            style={{ color: template.colors.inkSoft, letterSpacing: "0.28em" }}
          >
            Avec la bénédiction de nos familles
          </p>
          <Fleuron color={template.colors.accent} width={150} className="mx-auto my-6 block" />
          <p
            className="text-center text-[clamp(1rem,3.8cqw,1.15rem)] font-normal leading-[1.95]"
            style={{ fontFamily: "var(--tpl-sans)", color: template.colors.ink }}
          >
            {message}
          </p>
        </Cartouche>
      </Reveal>
    </Frame>
  );
}

/* ── Les cérémonies, classées par heure ─────────────────────── */

export function CeremoniesSection({ invitation, template }: SectionProps) {
  const events = sortedEvents(invitation);
  if (events.length === 0) return null;
  const christian = invitation.type === "chretien";

  return (
    <Frame id="ceremonies">
      <SectionTitle eyebrow="Le déroulé" title="Nos cérémonies" />

      {/* La chronologie : un filet vertical, une rosace en tête. */}
      <ol className="relative mx-auto max-w-xl">
        <span
          aria-hidden
          className="absolute left-1/2 top-6 -z-10 h-[calc(100%-3rem)] w-px -translate-x-1/2"
          style={{ background: `${template.colors.accent}55` }}
        />

        {events.map((event, index) => {
          const label = EVENT_LABELS[event.kind];
          return (
            <Reveal key={`${event.kind}-${index}`} delay={index * 0.12}>
              {/* Trois colonnes a toutes les largeurs : l'heure a
                  gauche, l'ornement sur le filet, la ceremonie a
                  droite. Sous 416 px, la mise en page basculait sur
                  une pile alignee a gauche et le filet central se
                  retrouvait dans le vide. */}
              <li className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1.15fr)] items-center gap-2.5 py-5 xs:gap-3 sm:gap-6 sm:py-6">
                <div className="min-w-0 text-right">
                  <p
                    className="tabular text-[clamp(1.25rem,7cqw,2.25rem)] leading-none"
                    style={{ fontFamily: "var(--tpl-display)", color: template.colors.ink }}
                  >
                    {event.time?.slice(0, 5) || "—"}
                  </p>
                  <p
                    className="mt-1.5 text-[0.5rem] font-medium uppercase sm:mt-2 sm:text-[0.625rem]"
                    style={{ color: template.colors.inkSoft, letterSpacing: "0.1em", fontFamily: "var(--tpl-sans)" }}
                  >
                    {formatWeddingDateLong(event.date)}
                  </p>
                </div>

                <span
                  className="grid size-8 shrink-0 place-items-center rounded-full sm:size-10"
                  style={{ background: template.colors.background }}
                >
                  {index === 0 ? (
                    christian ? (
                      <Rings color={template.colors.accent} size={30} />
                    ) : (
                      <Rosette color={template.colors.accent} size={34} />
                    )
                  ) : christian ? (
                    <Dove size={18} color={template.colors.accent} />
                  ) : (
                    <Lozenge color={template.colors.accent} size={13} />
                  )}
                </span>

                <div className="min-w-0">
                  <h3
                    className="text-[clamp(0.95rem,4.6cqw,1.45rem)] leading-tight"
                    style={{ fontFamily: "var(--tpl-display)", color: template.colors.ink }}
                  >
                    {label.title}
                  </h3>
                  <p className="mt-1.5 text-[0.8125rem] font-normal leading-snug sm:mt-2 sm:text-[0.9375rem]" style={{ color: template.colors.ink, fontFamily: "var(--tpl-sans)" }}>
                    {event.venue}
                  </p>
                  {event.address && (
                    <p className="mt-1 text-[0.6875rem] font-light leading-snug sm:text-[0.8125rem]" style={{ color: template.colors.inkSoft, fontFamily: "var(--tpl-sans)" }}>
                      {event.address}
                    </p>
                  )}
                </div>
              </li>
            </Reveal>
          );
        })}
      </ol>
    </Frame>
  );
}
