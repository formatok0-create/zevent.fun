"use client";

import { Dove } from "./clouds";

/* ═══════════════════════════════════════════════════════════════
   LES CADRES
   Deux variantes d’un même bloc : arc outrepassé, étoiles à huit
   branches et frise de zellige pour le musulman ; arc plein cintre
   et colombes pour le chrétien. Tout est vectoriel — la couleur
   suit l’accent de la collection, le trait reste net partout.
   ═══════════════════════════════════════════════════════════════ */

/** L’étoile à huit branches — le motif fondateur du décor islamique. */
export function EightPointStar({
  size = 26,
  color = "var(--tpl-accent)",
  className,
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden className={className} style={{ color }}>
      <g fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round">
        <rect x="8" y="8" width="24" height="24" />
        <rect x="8" y="8" width="24" height="24" transform="rotate(45 20 20)" />
      </g>
    </svg>
  );
}

/** La frise : une suite d’étoiles reliées, posée en haut ou en bas d’un cadre. */
export function ZelligeBand({ color = "var(--tpl-accent)", className }: { color?: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 120 12"
      preserveAspectRatio="none"
      aria-hidden
      className={className}
      style={{ color, width: "100%", height: 12 }}
    >
      <defs>
        <pattern id="zv-zellige" width="20" height="12" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="0.7">
            <rect x="5.5" y="1.5" width="9" height="9" />
            <rect x="5.5" y="1.5" width="9" height="9" transform="rotate(45 10 6)" />
            <path d="M0 6 H3.5" />
            <path d="M16.5 6 H20" />
          </g>
        </pattern>
      </defs>
      <rect width="120" height="12" fill="url(#zv-zellige)" />
    </svg>
  );
}

/**
 * Le cadre à arc outrepassé : deux montants, un arc en fer à cheval
 * en haut, une frise de zellige en bas. Il enferme un contenu court
 * — un compte à rebours, un récit — comme un panneau de moucharabieh.
 */
export function MoorishFrame({
  children,
  className,
  band = true,
  christian = false,
}: {
  children: React.ReactNode;
  className?: string;
  band?: boolean;
  /** Décor chrétien : arc plein cintre, colombes, pas de zellige. */
  christian?: boolean;
}) {
  return (
    <div className={`relative px-4 py-10 sm:px-10 sm:py-14 ${className ?? ""}`}>
      {/* L’arc, dessiné au trait, qui coiffe le bloc */}
      <svg
        viewBox="0 0 300 120"
        preserveAspectRatio="none"
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-24 w-full"
        style={{ color: "var(--tpl-accent)" }}
      >
        <g fill="none" stroke="currentColor" strokeWidth="1.1" vectorEffect="non-scaling-stroke">
          {christian ? (
            <>
              <path d="M2 120 V70 C2 30, 62 4, 150 4 C238 4, 298 30, 298 70 V120" />
              <path d="M14 120 V72 C14 38, 68 16, 150 16 C232 16, 286 38, 286 72 V120" opacity=".34" />
            </>
          ) : (
            <>
              <path d="M2 120 V78 C2 34, 60 2, 150 2 C240 2, 298 34, 298 78 V120" />
              <path d="M12 120 V80 C12 42, 66 13, 150 13 C234 13, 288 42, 288 80 V120" opacity=".38" />
            </>
          )}
        </g>
      </svg>

      {/* Les montants */}
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 top-20 w-px"
        style={{ background: "color-mix(in srgb, var(--tpl-accent) 55%, transparent)" }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 top-20 w-px"
        style={{ background: "color-mix(in srgb, var(--tpl-accent) 55%, transparent)" }}
      />

      {/* Les étoiles d’angle */}
      {christian ? (
        <>
          <Dove size={24} className="absolute -bottom-[9px] -left-[12px]" />
          <Dove size={24} className="absolute -bottom-[9px] -right-[12px] -scale-x-100" />
        </>
      ) : (
        <>
          <EightPointStar size={22} className="absolute -bottom-[11px] -left-[11px]" />
          <EightPointStar size={22} className="absolute -bottom-[11px] -right-[11px]" />
        </>
      )}

      {band && !christian && (
        <span aria-hidden className="pointer-events-none absolute inset-x-6 bottom-0">
          <ZelligeBand />
        </span>
      )}

      <div className="relative pt-4">{children}</div>
    </div>
  );
}
