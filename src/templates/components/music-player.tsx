"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

/* Le bouton rond, toujours visible, en bas à droite. L’invité doit
   pouvoir couper la musique à la seconde où il le décide. */

export function MusicPlayer({
  url,
  startsPlaying = false,
  accent,
  surface,
}: {
  url: string;
  /** L’enveloppe a déjà lancé la piste : ce bouton la pilote. */
  startsPlaying?: boolean;
  accent: string;
  surface: string;
}) {
  const own = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(startsPlaying);
  const reduced = useReducedMotion();

  /** La piste lancée par l’enveloppe, ou celle de ce lecteur. */
  const element = () =>
    (document.getElementById("zv-music") as HTMLAudioElement | null) ?? own.current;

  useEffect(() => {
    const target = element();
    if (!target) return;
    const sync = () => setPlaying(!target.paused);
    target.addEventListener("play", sync);
    target.addEventListener("pause", sync);
    target.addEventListener("ended", sync);
    sync();
    return () => {
      target.removeEventListener("play", sync);
      target.removeEventListener("pause", sync);
      target.removeEventListener("ended", sync);
    };
  }, []);

  const toggle = async () => {
    const target = element();
    if (!target) return;
    if (target.paused) {
      try {
        target.volume = 0.6;
        await target.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    } else {
      target.pause();
      setPlaying(false);
    }
  };

  return (
    <>
      {!startsPlaying && <audio ref={own} src={url} loop preload="none" />}

      <motion.button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? "Couper la musique" : "Écouter la musique"}
        initial={reduced ? undefined : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="fixed bottom-5 right-5 z-50 grid size-14 place-items-center rounded-full transition-transform duration-500 hover:scale-105 active:scale-95"
        style={{ background: accent, boxShadow: `0 6px 20px ${accent}55` }}
      >
        {playing ? (
          <svg viewBox="0 0 24 24" className="size-5" fill={surface} aria-hidden>
            <rect x="6.5" y="5" width="3.6" height="14" rx="1" />
            <rect x="13.9" y="5" width="3.6" height="14" rx="1" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="size-5" fill={surface} aria-hidden>
            <path d="M8 5.2 19 12 8 18.8 Z" />
          </svg>
        )}
      </motion.button>
    </>
  );
}
