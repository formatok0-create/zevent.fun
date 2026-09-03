"use client";

import { motion, useReducedMotion } from "motion/react";
import { Frame } from "./opening";
import { SectionTitle } from "./story";
import { formatWeddingDateLong } from "@/lib/utils/date";
import { Fleuron } from "./ornaments";
import type { SectionProps } from "./types";

const EASE = [0.16, 1, 0.3, 1] as const;

function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18, filter: "blur(5px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 1.1, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* ── Le lieu et l’heure ─────────────────────────────────────── */

export function DetailsSection({ invitation }: SectionProps) {
  const rows = [
    { label: "Date", value: formatWeddingDateLong(invitation.wedding_date) },
    { label: "Heure", value: invitation.wedding_time ? invitation.wedding_time.slice(0, 5).replace(":", "h") : null },
    { label: "Lieu", value: invitation.venue },
    { label: "Adresse", value: invitation.address },
  ].filter((row) => Boolean(row.value));

  return (
    <Frame id="lieu">
      <SectionTitle eyebrow="Informations" title="Où et quand" />

      <dl className="mx-auto max-w-xl">
        {rows.map((row, index) => (
          <Reveal key={row.label} delay={index * 0.06}>
            <div className="grid grid-cols-[6rem_1fr] items-baseline gap-6 border-t border-[var(--tpl-line)] py-5 sm:grid-cols-[8rem_1fr]">
              <dt
                className="uppercase text-[0.5625rem] text-[var(--tpl-ink-soft)]"
                style={{ letterSpacing: "0.24em" }}
              >
                {row.label}
              </dt>
              <dd className="text-[0.9375rem] font-light leading-relaxed text-[var(--tpl-ink)]">
                {row.value}
              </dd>
            </div>
          </Reveal>
        ))}
      </dl>

    </Frame>
  );
}

/* ── Le programme ───────────────────────────────────────────── */

export function ProgramSection({ invitation }: SectionProps) {
  const program = invitation.program;
  if (!program || program.length === 0) return null;

  return (
    <Frame id="programme">
      <SectionTitle eyebrow="Le déroulé" title="Programme de la journée" />

      <ol className="mx-auto max-w-lg">
        {program.map((entry, index) => (
          <Reveal key={`${entry.time}-${entry.title}`} delay={index * 0.08}>
            <li className="grid grid-cols-[4.5rem_1fr] gap-6 border-t border-[var(--tpl-line)] py-6">
              <span className="tabular font-display text-[1.0625rem] leading-none text-[var(--tpl-accent)]">
                {entry.time}
              </span>
              <div>
                <p className="font-display text-[1.125rem] leading-none text-[var(--tpl-ink)]">
                  {entry.title}
                </p>
                {entry.note && (
                  <p className="mt-2 text-sm font-light text-[var(--tpl-ink-soft)]">{entry.note}</p>
                )}
              </div>
            </li>
          </Reveal>
        ))}
      </ol>
    </Frame>
  );
}

/* ── Le mot final ───────────────────────────────────────────── */

export function ClosingSection({ invitation, template }: SectionProps) {
  const separator = template.typography.namesSeparator;

  return (
    <section className="relative overflow-hidden px-6 py-28 text-center sm:py-36">
      <span
        aria-hidden
        className="arch-tall pointer-events-none absolute left-1/2 top-10 h-[80%] w-[min(80cqw,28rem)] -translate-x-1/2 border border-[var(--tpl-accent)]/25"
      />
      <Reveal className="relative">
        <p
          className="uppercase text-[0.625rem] text-[var(--tpl-ink-soft)]"
          style={{ letterSpacing: "var(--tpl-tracking)" }}
        >
          À très bientôt
        </p>
        <p className="mt-9 text-[clamp(2.2rem,9cqw,4rem)] leading-[1.15] text-[var(--tpl-ink)]" style={{ fontFamily: "var(--tpl-script)" }}>
          {invitation.bride_name}
          <span className="mx-[0.1em] text-[0.5em] text-[var(--tpl-accent)]">
            {separator}
          </span>
          {invitation.groom_name}
        </p>
        <Fleuron color="var(--tpl-accent)" width={200} className="mx-auto mt-10 block" />
      </Reveal>
    </section>
  );
}
