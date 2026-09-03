"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils/cn";

export interface MenuAction {
  label: string;
  onSelect: () => void;
  tone?: "default" | "danger";
  hidden?: boolean;
}

/* Chaque carte d'invitation est enveloppée dans une animation qui laisse
   un `filter` sur l'élément. Un filtre crée un contexte d'empilement :
   le panneau, même en z-30, restait prisonnier de sa carte et passait
   derrière la carte suivante. On le sort donc du flux, dans un portail
   attaché au body, et on le place à la main sous le bouton. */

const LARGEUR = 208; /* 13rem */
const HAUTEUR_ITEM = 42;
const MARGE = 12;

export function Menu({
  actions,
  label = "Actions",
  className,
}: {
  actions: MenuAction[];
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [monte, setMonte] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const bouton = useRef<HTMLButtonElement>(null);
  const panneau = useRef<HTMLDivElement>(null);

  const visible = actions.filter((a) => !a.hidden);

  useEffect(() => setMonte(true), []);

  const placer = useCallback(() => {
    const b = bouton.current?.getBoundingClientRect();
    if (!b) return;
    const hauteur = visible.length * HAUTEUR_ITEM + 16;
    /* Le panneau s'aligne à droite du bouton, sans jamais sortir de
       l'écran — sur un téléphone, la carte touche le bord. */
    const left = Math.min(
      Math.max(MARGE, b.right - LARGEUR),
      Math.max(MARGE, window.innerWidth - LARGEUR - MARGE),
    );
    /* Pas la place en dessous : on déplie vers le haut. */
    const versLeBas = b.bottom + hauteur + MARGE <= window.innerHeight;
    setPos({ top: versLeBas ? b.bottom + 6 : Math.max(MARGE, b.top - hauteur - 6), left });
  }, [visible.length]);

  useEffect(() => {
    if (!open) return;
    placer();

    const dehors = (event: Event) => {
      const cible = event.target as Node;
      if (bouton.current?.contains(cible) || panneau.current?.contains(cible)) return;
      setOpen(false);
    };
    const auClavier = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);

    /* Le panneau suit son bouton au lieu de se refermer : sur un
       telephone, l'elan du defilement se poursuit apres l'appui, et
       une fermeture au scroll rendait le menu inouvrable. On ne le
       referme que si le bouton quitte l'ecran. */
    let trame = 0;
    const suivre = () => {
      if (trame) return;
      trame = requestAnimationFrame(() => {
        trame = 0;
        const b = bouton.current?.getBoundingClientRect();
        if (!b || b.bottom < 0 || b.top > window.innerHeight) {
          setOpen(false);
          return;
        }
        placer();
      });
    };

    document.addEventListener("mousedown", dehors);
    document.addEventListener("touchstart", dehors);
    document.addEventListener("keydown", auClavier);
    window.addEventListener("scroll", suivre, true);
    window.addEventListener("resize", suivre);
    return () => {
      if (trame) cancelAnimationFrame(trame);
      document.removeEventListener("mousedown", dehors);
      document.removeEventListener("touchstart", dehors);
      document.removeEventListener("keydown", auClavier);
      window.removeEventListener("scroll", suivre, true);
      window.removeEventListener("resize", suivre);
    };
  }, [open, placer]);

  return (
    <div className={cn("relative", className)}>
      <button
        ref={bouton}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
        /* Trois gros points blancs sur bordeaux : le bouton de la
           maison, rien de plus à lire. */
        className={cn(
          "inline-flex size-10 items-center justify-center gap-1 rounded-sm text-ivory transition-colors duration-400",
          open ? "bg-burgundy-deep" : "bg-burgundy hover:bg-burgundy-deep",
        )}
      >
        <span aria-hidden className="size-1.5 rounded-full bg-current" />
        <span aria-hidden className="size-1.5 rounded-full bg-current" />
        <span aria-hidden className="size-1.5 rounded-full bg-current" />
      </button>

      {monte &&
        createPortal(
          <AnimatePresence>
            {open && pos && (
              <motion.div
                ref={panneau}
                role="menu"
                initial={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -4, filter: "blur(3px)" }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                style={{ top: pos.top, left: pos.left, width: LARGEUR }}
                className="fixed z-[80] rounded-sm border border-line bg-surface py-2 shadow-[0_18px_50px_-20px_rgba(26,23,24,0.35)]"
              >
                {visible.map((action) => (
                  <button
                    key={action.label}
                    role="menuitem"
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      action.onSelect();
                    }}
                    className={cn(
                      "eyebrow-sm block w-full px-5 py-2.5 text-left transition-colors duration-300",
                      action.tone === "danger"
                        ? "text-danger hover:bg-danger/5"
                        : "text-ink-soft hover:bg-ivory-deep hover:text-ink",
                    )}
                  >
                    {action.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
