"use client";

import { useEffect, useRef } from "react";
import type { AlbumEntry } from "@/types/database";

/* ═══════════════════════════════════════════════════════════════
   L’ALBUM DES ANNÉES — le rail
   Un mariage raconte une rencontre ; un anniversaire raconte une
   croissance. Le rail se parcourt de la première année jusqu’à
   celle qu’on fête, et il fait ce trajet tout seul la première
   fois qu’il entre à l’écran : c’est le temps qui avance.
   ═══════════════════════════════════════════════════════════════ */

export function AlbumRail({ entries }: { entries: AlbumEntry[] }) {
  const rail = useRef<HTMLOListElement>(null);
  const travelled = useRef(false);

  useEffect(() => {
    const element = rail.current;
    if (!element) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || travelled.current) return;
        travelled.current = true;

        /* Un aller lent jusqu’à l’année en cours, puis un léger
           retour : l’invité comprend que le rail se fait glisser. */
        const distance = element.scrollWidth - element.clientWidth;
        if (distance < 24) return;

        window.setTimeout(() => {
          element.scrollTo({ left: distance, behavior: "smooth" });
          window.setTimeout(() => {
            element.scrollTo({ left: Math.max(0, distance - 96), behavior: "smooth" });
          }, 2100);
        }, 550);
      },
      { threshold: 0.35 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const last = entries.length - 1;

  return (
    <ol
      ref={rail}
      className="zv-rail -mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 sm:gap-7"
      style={{ scrollbarWidth: "none" }}
    >
      {entries.map((entry, index) => {
        const current = index === last;
        return (
          <li
            key={`${entry.year}-${index}`}
            className="relative w-[9.5rem] shrink-0 snap-center sm:w-[11.5rem]"
          >
            <figure
              className="relative aspect-[3/4] overflow-hidden rounded-[1.25rem]"
              style={{
                background: "linear-gradient(160deg, var(--tpl-plate-from), var(--tpl-plate-to))",
                boxShadow: current ? "0 0 0 2px var(--tpl-accent)" : "0 0 0 1px var(--tpl-line)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={entry.url ?? ""}
                alt={entry.caption ?? `${entry.age} ans`}
                loading="lazy"
                className="size-full object-cover"
              />

              <span
                className="absolute inset-x-0 bottom-0 px-3 py-2 text-center text-[0.6rem] uppercase tracking-[0.2em]"
                style={{
                  background: "linear-gradient(to top, rgba(0,0,0,.55), transparent)",
                  color: "#fff",
                }}
              >
                {entry.age} {entry.age <= 1 ? "an" : "ans"}
              </span>
            </figure>

            {/* La ligne du temps : un point par année, un filet qui
                s’interrompt à celle qu’on fête. */}
            <div aria-hidden className="relative mt-5 h-2">
              <span
                className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2"
                style={{ background: "var(--tpl-line)" }}
              />
              {current && (
                <span
                  className="absolute right-0 top-1/2 h-px w-1/2 -translate-y-1/2"
                  style={{ background: "var(--tpl-bg)" }}
                />
              )}
              <span
                className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  background: current ? "var(--tpl-accent)" : "var(--tpl-line)",
                  boxShadow: current ? "0 0 0 4px var(--tpl-accent-soft)" : undefined,
                }}
              />
            </div>

            <div className="mt-4 text-center">
              <span
                className="block text-[1.35rem] leading-none"
                style={{
                  fontFamily: "var(--tpl-display)",
                  color: current ? "var(--tpl-accent)" : "var(--tpl-ink)",
                }}
              >
                {entry.year}
              </span>
              <span
                className="mt-2 block text-[0.55rem] uppercase tracking-[0.24em]"
                style={{ color: current ? "var(--tpl-accent)" : "var(--tpl-ink-soft)" }}
              >
                {current ? "Aujourd’hui" : (entry.caption ?? "")}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
