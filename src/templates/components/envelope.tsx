"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Fleuron } from "./ornaments";
import { FeteRule } from "./motifs-fete";
import { cn } from "@/lib/utils/cn";
import type { TemplateDefinition } from "../types";
import { FONT_STACKS } from "@/app/fonts";

const EASE = [0.16, 1, 0.3, 1] as const;

/* ═══════════════════════════════════════════════════════════════
   L’ENVELOPPE
   Un pli de papier crème sur fond pêche. Le rabat descend en V,
   gaufré d’une arabesque. Au creux du V, un cachet de cire doré.

   L’invité appuie : le cachet se rompt, le rabat se relève, la
   lettre s’efface — et la musique démarre. Ce geste n’est pas
   décoratif, c’est lui qui autorise le son sur mobile.

   Tout tient dans la hauteur de l’écran, sans défilement : les
   proportions sont exprimées en pourcentage de la fenêtre.
   ═══════════════════════════════════════════════════════════════ */

export function EnvelopeGate({
  contained,
  age,
  template,
  brideName,
  groomName,
  musicUrl,
  children,
}: {
  template: TemplateDefinition;
  /** Rendue dans un cadre (aperçu) plutôt qu'en plein écran. */
  contained?: boolean;
  /** L'age fete : c'est lui, et non les initiales, qui est gravé
   *  sur le cachet d'un anniversaire. */
  age?: number | null;
  brideName: string;
  groomName: string;
  musicUrl?: string | null;
  children: React.ReactNode;
}) {
  const [opened, setOpened] = useState(false);
  const [breaking, setBreaking] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  const reduced = useReducedMotion();

  /* Le défilement n’est bloqué que tant que l’enveloppe est fermée,
     et il est toujours rendu, même si le composant est démonté. */
  useEffect(() => {
    if (opened || contained) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [opened, contained]);

  const open = async () => {
    if (breaking) return;
    setBreaking(true);

    const element = audio.current;
    if (element) {
      try {
        element.volume = 0;
        await element.play();
        const target = 0.6;
        const fade = window.setInterval(() => {
          if (element.volume + target / 45 >= target) {
            element.volume = target;
            window.clearInterval(fade);
          } else {
            element.volume = Math.min(target, element.volume + target / 45);
          }
        }, 55);
      } catch {
        /* Son refusé : l’invitation s’ouvre tout de même. */
      }
    }

    window.setTimeout(() => setOpened(true), reduced ? 80 : 950);
  };

  const c = template.colors;
  /* Le mariage ouvre une enveloppe de papier ; la fête ouvre une
     enveloppe de sa couleur — verte pour Royaume, bleue pour Petit
     Patron, et ainsi de suite. */
  const fete = template.product === "anniversaire";
  const paperFrom = fete ? c.plateFrom : c.surface;
  const paperTo = fete ? c.plateTo : c.accentSoft;
  const initial = `${brideName?.[0] ?? ""}${groomName?.[0] ?? ""}`.toUpperCase();
  const seal = fete && age != null ? String(age) : initial;

  return (
    <>
      {musicUrl && <audio ref={audio} src={musicUrl} loop preload="auto" id="zv-music" />}

      <AnimatePresence>
        {!opened && (
          <motion.div
            key="enveloppe"
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.06, filter: "blur(12px)" }}
            transition={{ duration: 0.95, ease: EASE }}
            className={cn("z-[100] overflow-hidden", contained ? "absolute inset-0" : "fixed inset-0")}
            style={{ background: c.background }}
          >
            {/* ── Le papier ─────────────────────────────────── */}
            <div aria-hidden className="absolute inset-0">
              {/* Le corps de l’enveloppe */}
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(172deg, ${paperFrom} 0%, ${paperTo} 100%)` }}
              />
              {/* Les plis du dos, à peine perceptibles */}
              <div
                className="absolute inset-x-0 bottom-0 top-[40%]"
                style={{
                  clipPath: "polygon(0 100%, 50% 0, 100% 100%)",
                  background: `linear-gradient(180deg, ${c.accent}18, transparent 55%)`,
                }}
              />
              {/* Le rabat supérieur */}
              <motion.div
                className="absolute inset-x-0 top-0 h-[46%] origin-top"
                animate={breaking && !reduced ? { rotateX: -130, opacity: 0.1 } : { rotateX: 0, opacity: 1 }}
                transition={{ duration: 1.2, ease: EASE }}
                style={{
                  transformStyle: "preserve-3d",
                  clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                  background: `linear-gradient(178deg, ${paperFrom} 0%, ${paperTo} 100%)`,
                  filter: `drop-shadow(0 3px 5px ${c.accent}26)`,
                }}
              >
                {/* L’arabesque gaufrée du rabat — mariage seulement. */}
                {!fete && (
                <svg
                  viewBox="0 0 400 140"
                  className="absolute inset-x-0 top-[14%] mx-auto w-[74%]"
                  style={{ color: c.accent, opacity: 0.28 }}
                  aria-hidden
                >
                  <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                    <path d="M200 18 C200 46, 168 52, 150 40 C136 30, 142 12, 158 16 C176 21, 186 44, 186 70" />
                    <path d="M200 18 C200 46, 232 52, 250 40 C264 30, 258 12, 242 16 C224 21, 214 44, 214 70" />
                    <path d="M120 58 C138 44, 160 56, 166 76" />
                    <path d="M280 58 C262 44, 240 56, 234 76" />
                    <path d="M74 84 C102 62, 130 74, 140 96" />
                    <path d="M326 84 C298 62, 270 74, 260 96" />
                    <circle cx="200" cy="26" r="3.4" fill="currentColor" stroke="none" />
                  </g>
                </svg>
                )}

                {/* Le rabat de la fête porte le motif de sa collection. */}
                {fete && (
                  <div className="absolute inset-x-0 top-[16%] flex justify-center">
                    <FeteRule decor={template.decor} />
                  </div>
                )}
              </motion.div>
            </div>

            {/* ── Le cachet, le mot, le fleuron ─────────────── */}
            <button
              type="button"
              onClick={open}
              aria-label="Appuyez pour ouvrir l’invitation"
              className="group absolute inset-0 flex w-full flex-col items-center px-6"
            >
              {/* Le cachet se pose exactement à la pointe du V. */}
              <motion.span
                className="relative grid shrink-0 place-items-center rounded-full"
                style={{
                  marginTop: "38vh",
                  width: "clamp(4.5rem,23cqw,6.5rem)",
                  height: "clamp(4.5rem,23cqw,6.5rem)",
                  background: `radial-gradient(circle at 34% 28%, ${c.accentSoft}, ${c.accent} 58%, ${c.accent}cc 100%)`,
                  boxShadow: `0 8px 26px ${c.accent}4d`,
                }}
                animate={breaking && !reduced ? { scale: [1, 1.1, 0.15], opacity: [1, 1, 0] } : {}}
                transition={{ duration: 0.9, ease: EASE }}
              >
                <span
                  aria-hidden
                  className="absolute inset-[8%] rounded-full border"
                  style={{ borderColor: `${c.surface}59` }}
                />
                <span
                  className="relative text-[clamp(1.35rem,6cqw,1.9rem)] leading-none"
                  style={{ fontFamily: FONT_STACKS[template.typography.script], color: c.surface }}
                >
                  {seal}
                </span>
              </motion.span>

              <motion.span
                className="mt-8 block"
                style={{
                  fontFamily: FONT_STACKS[template.typography.display],
                  color: c.ink,
                  fontSize: fete ? "clamp(1.45rem,6.5cqw,2.1rem)" : "clamp(1.25rem,5.5cqw,1.75rem)",
                  fontWeight: fete ? 700 : undefined,
                }}
                animate={breaking && !reduced ? { opacity: 0, y: -10 } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                Appuyez pour ouvrir
              </motion.span>

              {fete ? (
                <span className="mt-7 block" style={{ color: c.accent }}>
                  <FeteRule decor={template.decor} />
                </span>
              ) : (
                <Fleuron color={c.accent} width={210} className="mt-6" />
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </>
  );
}
