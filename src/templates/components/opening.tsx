"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, useState, useEffect } from "react";
import { useCountdown } from "@/lib/hooks/use-countdown";
import { countdownTarget } from "@/lib/utils/events";
import { Fleuron } from "./ornaments";
import { MoorishFrame } from "./moorish";
import { CloudBand } from "./clouds";
import { formatWeddingDateLong } from "@/lib/utils/date";
import { DEFAULT_COVERS } from "@/lib/config";
import type { SectionProps } from "./types";

const EASE = [0.16, 1, 0.3, 1] as const;

/* ── Hero ───────────────────────────────────────────────────── */

export function HeroSection({ invitation, template, compact }: SectionProps) {
  const container = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [lifted, setLifted] = useState(!template.animations.curtain);

  const { scrollYProgress } = useScroll({ target: container, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", template.animations.parallax && !reduced ? "16%" : "0%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduced ? 1 : 0]);

  useEffect(() => {
    if (lifted) return;
    const id = window.setTimeout(() => setLifted(true), 260);
    return () => window.clearTimeout(id);
  }, [lifted]);

  const separator = template.typography.namesSeparator;
  const cover = invitation.cover_image_url ?? DEFAULT_COVERS[invitation.type ?? "chretien"];

  return (
    <section
      ref={container}
      className={`relative isolate flex flex-col items-center justify-center overflow-hidden px-6 text-center ${compact ? "min-h-[32rem] py-24" : "min-h-[100svh]"}`}
    >
      <motion.div style={{ y: imageY }} className="absolute inset-0 -z-10">
        <div
          className="plate absolute inset-[-8%]"
          style={{
            "--plate-from": template.colors.plateFrom,
            "--plate-to": template.colors.plateTo,
          } as React.CSSProperties}
        >
          {cover && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={cover} alt="" className="size-full object-cover" />
          )}
        </div>
        {/* Le voile : l’image reste lisible, le texte aussi. */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${template.colors.background}55 0%, ${template.colors.background}22 32%, ${template.colors.background}dd 78%, ${template.colors.background} 100%)`,
          }}
        />
      </motion.div>

      {/* Les nuages : le motif des collections chrétiennes. */}
      {invitation.type === "chretien" && (
        <CloudBand
          from={`${template.colors.accentSoft}`}
          to={`${template.colors.plateFrom}`}
          height="52%"
          className="-z-10 blur-[2px]"
        />
      )}

      {/* L’arche gravée, doublée d’un filet intérieur. */}
      <span
        aria-hidden
        className="arch-tall pointer-events-none absolute left-1/2 top-[6%] -z-10 h-[88%] w-[min(84cqw,38rem)] -translate-x-1/2 border"
        style={{ borderColor: `${template.colors.accent}55` }}
      />
      <span
        aria-hidden
        className="arch-tall pointer-events-none absolute left-1/2 top-[8%] -z-10 h-[84%] w-[min(78cqw,35rem)] -translate-x-1/2 border"
        style={{ borderColor: `${template.colors.accent}22` }}
      />

      <motion.div style={{ opacity: textOpacity }} className="relative w-full max-w-2xl px-2">
        <motion.p
          initial={reduced ? undefined : { opacity: 0, y: 12 }}
          animate={lifted ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 1.2, delay: 0.5, ease: EASE }}
          className="inline-block rounded-full px-5 py-2 text-[0.75rem] font-medium uppercase"
          style={{
            letterSpacing: "var(--tpl-tracking)",
            color: template.colors.ink,
            background: `${template.colors.background}cc`,
            fontFamily: "var(--tpl-sans)",
          }}
        >
          {invitation.type === "musulman" ? "Nikah" : "Nous nous marions"}
        </motion.p>

        <motion.h1
          initial={reduced ? undefined : { opacity: 0, y: 26, filter: "blur(10px)" }}
          animate={lifted ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
          transition={{ duration: 1.8, delay: 0.7, ease: EASE }}
          className="mt-8 break-words leading-[1.08] text-[var(--tpl-ink)]"
          style={{
            fontFamily: "var(--tpl-script)",
            fontSize: "var(--tpl-hero-scale)",
          }}
        >
          <span className="block">{invitation.bride_name}</span>
          <span className="my-1 block text-[0.42em] text-[var(--tpl-accent)]">{separator}</span>
          <span className="block">{invitation.groom_name}</span>
        </motion.h1>

        <motion.div
          initial={reduced ? undefined : { opacity: 0 }}
          animate={lifted ? { opacity: 1 } : undefined}
          transition={{ duration: 1.4, delay: 1.3, ease: EASE }}
          className="mt-10 flex flex-col items-center gap-5"
        >
          <Fleuron color="var(--tpl-accent)" width={210} />
          <p
            className="text-[0.8125rem] font-medium uppercase text-[var(--tpl-ink)]"
            style={{ letterSpacing: "0.18em", fontFamily: "var(--tpl-sans)" }}
          >
            {formatWeddingDateLong(invitation.wedding_date)}
          </p>
          {invitation.venue && (
            <p className="text-[1rem] font-normal text-[var(--tpl-ink-soft)]" style={{ fontFamily: "var(--tpl-sans)" }}>{invitation.venue}</p>
          )}
        </motion.div>
      </motion.div>

      {/* Le repère de défilement : le trait respire, l’invité comprend. */}
      <motion.div
        initial={reduced ? undefined : { opacity: 0 }}
        animate={lifted ? { opacity: 1 } : undefined}
        transition={{ duration: 1.4, delay: 1.9, ease: EASE }}
        className={`absolute inset-x-0 flex flex-col items-center gap-3 ${compact ? "bottom-8" : "bottom-10"}`}
      >
        <span
          className="uppercase text-[0.5rem] text-[var(--tpl-ink-soft)]"
          style={{ letterSpacing: "0.3em" }}
        >
          Découvrir
        </span>
        <span
          aria-hidden
          className="h-10 w-px animate-[zv-breathe_3.4s_ease-in-out_infinite] bg-[var(--tpl-accent)]"
        />
      </motion.div>

      {/* Le rideau d’ouverture : l’ivoire se lève. */}
      {template.animations.curtain && !reduced && (
        <motion.div
          aria-hidden
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          transition={{ duration: 1.5, ease: EASE, delay: 0.15 }}
          className="absolute inset-0 z-20 origin-top bg-[var(--tpl-bg)]"
        />
      )}
    </section>
  );
}

/* ── Annonce ────────────────────────────────────────────────── */

export function AnnonceSection({ invitation }: SectionProps) {
  const text =
    invitation.description?.trim() ||
    "C’est avec joie que nous vous convions à célébrer notre union, entourés de celles et ceux qui comptent.";

  return (
    <Frame>
      <p className="mx-auto max-w-xl text-center text-[clamp(1.05rem,4cqw,1.3rem)] font-normal leading-[1.95] text-[var(--tpl-ink)]" style={{ fontFamily: "var(--tpl-sans)" }}>
        {text}
      </p>
    </Frame>
  );
}

/* ── Compte à rebours ───────────────────────────────────────── */

export function CountdownSection({ invitation }: SectionProps) {
  const parts = useCountdown(countdownTarget(invitation));
  if (!parts) return null;

  const units = parts.past
    ? null
    : [
        { value: parts.days, label: "Jours" },
        { value: parts.hours, label: "Heures" },
        { value: parts.minutes, label: "Minutes" },
        { value: parts.seconds, label: "Secondes" },
      ];

  return (
    <Frame>
      <MoorishFrame christian={invitation.type === "chretien"} className="mx-auto max-w-lg">
        <p
          className="mb-9 text-center uppercase text-[0.6875rem] font-medium"
          style={{ letterSpacing: "var(--tpl-tracking)", color: "var(--tpl-ink-soft)", fontFamily: "var(--tpl-sans)" }}
        >
          {parts.past ? "Merci d’avoir célébré avec nous" : "Il reste"}
        </p>

        {units && (
          <div className="flex items-start justify-center">
            {units.map((unit, index) => (
              <div key={unit.label} className="relative flex-1 px-0.5 text-center sm:px-2">
                {index > 0 && (
                  <span
                    aria-hidden
                    className="absolute -left-1 top-[0.3em] text-[clamp(1.1rem,4cqw,1.8rem)] leading-none text-[var(--tpl-accent)] opacity-45"
                  >
                    :
                  </span>
                )}
                <p
                  className="tabular text-[clamp(1.9rem,9cqw,3.5rem)] leading-none text-[var(--tpl-ink)]"
                  style={{ fontFamily: "var(--tpl-display)" }}
                >
                  {String(unit.value).padStart(2, "0")}
                </p>
                <p
                  className="mt-3 text-[0.5625rem] font-medium uppercase text-[var(--tpl-ink-soft)]"
                  style={{ letterSpacing: "0.2em", fontFamily: "var(--tpl-sans)" }}
                >
                  {unit.label}
                </p>
              </div>
            ))}
          </div>
        )}
      </MoorishFrame>
    </Frame>
  );
}

/** Cadre commun : le rythme vertical de toute l’invitation. */
export function Frame({
  children,
  id,
  className = "",
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <section id={id} className={`px-5 py-16 sm:px-6 sm:py-24 ${className}`}>
      <div className="mx-auto w-full max-w-3xl">{children}</div>
    </section>
  );
}
