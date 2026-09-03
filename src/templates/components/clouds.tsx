"use client";

import { motion, useReducedMotion } from "motion/react";

/* ═══════════════════════════════════════════════════════════════
   LES NUAGES
   Le motif des collections chrétiennes : une brume pastel qui monte
   doucement derrière le texte. Rien n’est chargé — trois calques de
   dégradés radiaux qui dérivent lentement, avec un flou léger.
   ═══════════════════════════════════════════════════════════════ */

export function CloudBand({
  from = "#DCEAF6",
  to = "#F6E7EC",
  className,
  height = "60%",
  position = "bottom",
}: {
  from?: string;
  to?: string;
  className?: string;
  height?: string;
  position?: "top" | "bottom";
}) {
  const reduced = useReducedMotion();

  const puff = (x: number, y: number, r: number, color: string, opacity: number) => ({
    background: `radial-gradient(closest-side, ${color} 0%, ${color}00 72%)`,
    left: `${x}%`,
    top: `${y}%`,
    width: `${r}%`,
    paddingBottom: `${r * 0.62}%`,
    opacity,
  });

  const drift = (distance: number, duration: number) =>
    reduced
      ? undefined
      : {
          animate: { x: [0, distance, 0] },
          transition: { duration, repeat: Infinity, ease: "easeInOut" as const },
        };

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 overflow-hidden ${position === "top" ? "top-0" : "bottom-0"} ${className ?? ""}`}
      style={{ height }}
    >
      <motion.span className="absolute block rounded-full" style={puff(-12, 28, 62, from, 0.75)} {...drift(26, 26)} />
      <motion.span className="absolute block rounded-full" style={puff(38, 44, 74, to, 0.62)} {...drift(-32, 32)} />
      <motion.span className="absolute block rounded-full" style={puff(8, 58, 88, from, 0.55)} {...drift(20, 38)} />
      <motion.span className="absolute block rounded-full" style={puff(56, 18, 52, to, 0.5)} {...drift(-18, 29)} />
    </div>
  );
}

/** La colombe : le pendant chrétien de l’étoile à huit branches. */
export function Dove({
  size = 26,
  color = "var(--tpl-accent)",
  className,
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 40 32" width={size} height={size * 0.8} aria-hidden className={className} style={{ color }}>
      <g fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 22 C10 24, 17 22, 22 17 C26 13, 30 9, 36 8 C33 14, 30 19, 24 23 C18 27, 10 27, 4 22 Z" />
        <path d="M22 17 C20 12, 15 9, 9 10 C13 13, 16 16, 18 20" />
        <circle cx="32.5" cy="10" r="0.9" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

/** L’anneau entrelacé : marque les points d’une chronologie chrétienne. */
export function Rings({ size = 22, color = "var(--tpl-accent)" }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 34 22" width={size} height={size * 0.65} aria-hidden style={{ color }}>
      <g fill="none" stroke="currentColor" strokeWidth="1.1">
        <circle cx="13" cy="11" r="8" />
        <circle cx="21" cy="11" r="8" />
      </g>
    </svg>
  );
}
