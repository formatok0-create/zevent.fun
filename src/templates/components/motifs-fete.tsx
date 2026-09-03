import type { TemplateDecor } from "../types";

/* ═══════════════════════════════════════════════════════════════
   LES MOTIFS DE LA FÊTE
   Dessinés ici, au trait, comme les fleurons du mariage. Aucun
   personnage sous licence n’entre dans Zevent : ce sont des formes
   génériques — un champignon, un éclair, un nœud papillon, une
   fusée — que personne ne possède, et qu’un enfant reconnaît tout
   aussi bien. Rien à charger : tout est en SVG.
   ═══════════════════════════════════════════════════════════════ */

type MotifProps = { size?: number; className?: string; style?: React.CSSProperties };

const base = (size: number) => ({ width: size, height: size, "aria-hidden": true }) as const;

/* ── Royaume : l’aventure, les briques, les champignons ───────── */

export function Mushroom({ size = 28, className, style }: MotifProps) {
  return (
    <svg viewBox="0 0 32 32" {...base(size)} className={className} style={style}>
      <path d="M4 15a12 12 0 0 1 24 0Z" fill="currentColor" />
      <circle cx="11" cy="10" r="2.6" fill="var(--tpl-bg, #fff)" />
      <circle cx="21" cy="11" r="2" fill="var(--tpl-bg, #fff)" />
      <path d="M11 15h10v8a5 5 0 0 1-10 0Z" fill="currentColor" opacity=".45" />
    </svg>
  );
}

export function Coin({ size = 22, className, style }: MotifProps) {
  return (
    <svg viewBox="0 0 32 32" {...base(size)} className={className} style={style}>
      <ellipse cx="16" cy="16" rx="10" ry="13" fill="none" stroke="currentColor" strokeWidth="2" />
      <ellipse cx="16" cy="16" rx="4.5" ry="7" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function Brick({ size = 34, className, style }: MotifProps) {
  return (
    <svg viewBox="0 0 48 32" width={size * 1.5} height={size} aria-hidden className={className} style={style}>
      <g fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="1" y="1" width="46" height="30" rx="2" />
        <path d="M1 16h46M24 1v15M12 16v15M36 16v15" />
      </g>
    </svg>
  );
}

/* ── Comics : la trame, l’éclair, la bulle ────────────────────── */

export function Bolt({ size = 26, className, style }: MotifProps) {
  return (
    <svg viewBox="0 0 32 32" {...base(size)} className={className} style={style}>
      <path d="M18 2 6 18h7l-3 12 14-17h-8l2-11Z" fill="currentColor" />
    </svg>
  );
}

export function Burst({ size = 34, className, style }: MotifProps) {
  const points = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * Math.PI) / 6;
    const radius = i % 2 === 0 ? 15 : 8.5;
    return `${16 + Math.cos(angle) * radius},${16 + Math.sin(angle) * radius}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 32 32" {...base(size)} className={className} style={style}>
      <polygon points={points} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function SpeechBubble({ size = 30, className, style }: MotifProps) {
  return (
    <svg viewBox="0 0 36 32" width={size * 1.12} height={size} aria-hidden className={className} style={style}>
      <path
        d="M4 4h28v18H16l-8 7v-7H4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Petit Patron : le nœud, la montgolfière, le nuage ────────── */

export function BowTie({ size = 30, className, style }: MotifProps) {
  return (
    <svg viewBox="0 0 40 24" width={size * 1.6} height={size} aria-hidden className={className} style={style}>
      <path d="M17 12 4 4v16Z" fill="currentColor" />
      <path d="M23 12 36 4v16Z" fill="currentColor" />
      <rect x="16" y="8" width="8" height="8" rx="2" fill="currentColor" opacity=".55" />
    </svg>
  );
}

export function Balloon({ size = 34, className, style }: MotifProps) {
  return (
    <svg viewBox="0 0 24 40" width={size * 0.6} height={size} aria-hidden className={className} style={style}>
      <g fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 1a10 10 0 0 1 10 10c0 7-10 15-10 15S2 18 2 11A10 10 0 0 1 12 1Z" />
        <path d="M8 26h8l-1 12H9Z" />
        <path d="M12 26v12" />
      </g>
    </svg>
  );
}

export function Cloud({ size = 40, className, style }: MotifProps) {
  return (
    <svg viewBox="0 0 64 32" width={size * 2} height={size} aria-hidden className={className} style={style}>
      <path
        d="M14 28a9 9 0 0 1 1-18 13 13 0 0 1 24-3 10 10 0 0 1 11 21Z"
        fill="currentColor"
      />
    </svg>
  );
}

/* ── Cosmos : la fusée, la planète, la comète ─────────────────── */

export function Rocket({ size = 32, className, style }: MotifProps) {
  return (
    <svg viewBox="0 0 24 40" width={size * 0.6} height={size} aria-hidden className={className} style={style}>
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
        <path d="M12 1c5 5 7 12 7 19l-3 6H8l-3-6C5 13 7 6 12 1Z" />
        <circle cx="12" cy="14" r="3.2" />
        <path d="M5 22 1 30l6-2M19 22l4 8-6-2M10 32h4l-2 6Z" />
      </g>
    </svg>
  );
}

export function Planet({ size = 34, className, style }: MotifProps) {
  return (
    <svg viewBox="0 0 40 32" width={size * 1.25} height={size} aria-hidden className={className} style={style}>
      <g fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="20" cy="16" r="9" />
        <ellipse cx="20" cy="16" rx="18" ry="5.5" transform="rotate(-16 20 16)" />
      </g>
    </svg>
  );
}

export function Star({ size = 20, className, style }: MotifProps) {
  return (
    <svg viewBox="0 0 24 24" {...base(size)} className={className} style={style}>
      <path d="M12 0c1 7 4 11 12 12-8 1-11 5-12 12-1-7-4-11-12-12C8 11 11 7 12 0Z" fill="currentColor" />
    </svg>
  );
}

/* ── Le décor de fond ────────────────────────────────────────── */

type Scatter = { Motif: (p: MotifProps) => React.ReactElement; top: string; left: string; size: number; opacity: number; rotate: number };

const SCATTERS: Record<string, Scatter[]> = {
  royaume: [
    { Motif: Mushroom, top: "6%", left: "5%", size: 58, opacity: 0.26, rotate: -10 },
    { Motif: Coin, top: "16%", left: "84%", size: 40, opacity: 0.3, rotate: 0 },
    { Motif: Brick, top: "34%", left: "-2%", size: 34, opacity: 0.2, rotate: 0 },
    { Motif: Mushroom, top: "72%", left: "86%", size: 50, opacity: 0.24, rotate: 14 },
    { Motif: Coin, top: "52%", left: "91%", size: 30, opacity: 0.26, rotate: 0 },
    { Motif: Brick, top: "84%", left: "6%", size: 30, opacity: 0.18, rotate: 0 },
    { Motif: Mushroom, top: "44%", left: "8%", size: 34, opacity: 0.2, rotate: 6 },
  ],
  comics: [
    { Motif: Bolt, top: "7%", left: "86%", size: 54, opacity: 0.28, rotate: 10 },
    { Motif: Burst, top: "26%", left: "2%", size: 66, opacity: 0.22, rotate: -6 },
    { Motif: SpeechBubble, top: "60%", left: "84%", size: 56, opacity: 0.2, rotate: 4 },
    { Motif: Bolt, top: "80%", left: "6%", size: 42, opacity: 0.26, rotate: -14 },
    { Motif: Burst, top: "88%", left: "80%", size: 40, opacity: 0.18, rotate: 12 },
    { Motif: SpeechBubble, top: "16%", left: "6%", size: 34, opacity: 0.16, rotate: -8 },
  ],
  patron: [
    { Motif: Cloud, top: "6%", left: "70%", size: 58, opacity: 0.5, rotate: 0 },
    { Motif: Balloon, top: "58%", left: "-2%", size: 54, opacity: 0.24, rotate: 8 },
    { Motif: BowTie, top: "14%", left: "8%", size: 34, opacity: 0.22, rotate: -10 },
    { Motif: Cloud, top: "40%", left: "-4%", size: 62, opacity: 0.4, rotate: 0 },
    { Motif: Balloon, top: "20%", left: "10%", size: 48, opacity: 0.22, rotate: -6 },
    { Motif: BowTie, top: "70%", left: "84%", size: 30, opacity: 0.2, rotate: 8 },
    { Motif: Cloud, top: "84%", left: "12%", size: 52, opacity: 0.45, rotate: 0 },
  ],
  cristal: [
    { Motif: Snowflake, top: "8%", left: "6%", size: 46, opacity: 0.22, rotate: -8 },
    { Motif: Snowflake, top: "26%", left: "84%", size: 32, opacity: 0.26, rotate: 14 },
    { Motif: Snowflake, top: "60%", left: "3%", size: 26, opacity: 0.2, rotate: 0 },
    { Motif: Snowflake, top: "80%", left: "86%", size: 40, opacity: 0.22, rotate: -12 },
    { Motif: Blossom, top: "44%", left: "90%", size: 22, opacity: 0.18, rotate: 0 },
  ],
  papillons: [
    { Motif: Butterfly, top: "7%", left: "78%", size: 52, opacity: 0.26, rotate: -12 },
    { Motif: Butterfly, top: "34%", left: "2%", size: 40, opacity: 0.22, rotate: 14 },
    { Motif: Blossom, top: "18%", left: "10%", size: 30, opacity: 0.24, rotate: 0 },
    { Motif: Butterfly, top: "76%", left: "84%", size: 36, opacity: 0.2, rotate: 8 },
    { Motif: Blossom, top: "86%", left: "8%", size: 34, opacity: 0.22, rotate: 0 },
  ],
  licorne: [
    { Motif: Rainbow, top: "9%", left: "72%", size: 46, opacity: 0.24, rotate: 0 },
    { Motif: Unicorn, top: "36%", left: "3%", size: 52, opacity: 0.2, rotate: -6 },
    { Motif: Star, top: "22%", left: "16%", size: 18, opacity: 0.3, rotate: 0 },
    { Motif: Star, top: "62%", left: "88%", size: 14, opacity: 0.28, rotate: 0 },
    { Motif: Blossom, top: "82%", left: "12%", size: 26, opacity: 0.22, rotate: 0 },
    { Motif: Rainbow, top: "84%", left: "76%", size: 32, opacity: 0.18, rotate: 0 },
  ],
  lagon: [
    { Motif: Hibiscus, top: "6%", left: "8%", size: 48, opacity: 0.26, rotate: -10 },
    { Motif: Hibiscus, top: "72%", left: "84%", size: 44, opacity: 0.24, rotate: 12 },
    { Motif: Shell, top: "40%", left: "90%", size: 32, opacity: 0.2, rotate: 0 },
    { Motif: Wave, top: "88%", left: "4%", size: 26, opacity: 0.24, rotate: 0 },
    { Motif: Wave, top: "20%", left: "76%", size: 22, opacity: 0.18, rotate: 0 },
  ],
  cosmos: [
    { Motif: Planet, top: "9%", left: "78%", size: 66, opacity: 0.28, rotate: 0 },
    { Motif: Star, top: "46%", left: "3%", size: 14, opacity: 0.4, rotate: 0 },
    { Motif: Star, top: "64%", left: "22%", size: 10, opacity: 0.32, rotate: 0 },
    { Motif: Rocket, top: "78%", left: "88%", size: 40, opacity: 0.22, rotate: -12 },
    { Motif: Rocket, top: "38%", left: "6%", size: 46, opacity: 0.18, rotate: 18 },
    { Motif: Star, top: "22%", left: "18%", size: 16, opacity: 0.35, rotate: 0 },
    { Motif: Star, top: "56%", left: "90%", size: 12, opacity: 0.3, rotate: 0 },
    { Motif: Star, top: "74%", left: "10%", size: 18, opacity: 0.28, rotate: 0 },
    { Motif: Planet, top: "86%", left: "76%", size: 36, opacity: 0.14, rotate: 0 },
  ],
};

/** Le fond d’une collection de la fête : des motifs semés, très
 *  discrets, qui ne gênent jamais la lecture du texte. */
export function FeteDecor({
  decor,
  tone = "accent",
  scale = 1,
}: {
  decor?: TemplateDecor;
  /** Sur un fond saturé, les motifs passent en clair. */
  tone?: "accent" | "surface";
  scale?: number;
}) {
  const scatters = decor ? SCATTERS[decor] : undefined;
  if (!scatters) return null;

  const color = tone === "surface" ? "var(--tpl-surface)" : "var(--tpl-accent)";

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden" style={{ color }}>
      {scatters.map((s, index) => (
        <span
          key={index}
          className="absolute"
          style={{
            top: s.top,
            left: s.left,
            opacity: tone === "surface" ? Math.min(1, s.opacity * 3.4) : Math.min(1, s.opacity * 2.6),
            transform: `rotate(${s.rotate}deg)`,
          }}
        >
          <s.Motif size={s.size * scale} />
        </span>
      ))}
    </div>
  );
}

/** Le séparateur de section : trois motifs entre deux filets.
 *  L’équivalent du fleuron du mariage. */
export function FeteRule({ decor, className }: { decor?: TemplateDecor; className?: string }) {
  const MOTIF_BY_DECOR = {
    royaume: Mushroom,
    comics: Bolt,
    patron: BowTie,
    cosmos: Star,
    cristal: Snowflake,
    papillons: Butterfly,
    licorne: Star,
    lagon: Hibiscus,
  } as const;
  const Motif = (decor && MOTIF_BY_DECOR[decor as keyof typeof MOTIF_BY_DECOR]) || Star;

  return (
    <div className={`flex items-center justify-center gap-4 text-[var(--tpl-accent)] ${className ?? ""}`}>
      <span aria-hidden className="h-px w-14 bg-current opacity-40" />
      <Motif size={18} style={{ opacity: 0.55 }} />
      <Motif size={24} />
      <Motif size={18} style={{ opacity: 0.55 }} />
      <span aria-hidden className="h-px w-14 bg-current opacity-40" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LES MOTIFS DES COLLECTIONS FILLES
   Même règle : rien sous licence. Un flocon, un papillon, une
   licorne, un hibiscus — des formes que personne ne possède.
   ═══════════════════════════════════════════════════════════════ */

export function Snowflake({ size = 30, className, style }: MotifProps) {
  const branches = [0, 60, 120];
  return (
    <svg viewBox="0 0 32 32" {...base(size)} className={className} style={style}>
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none">
        {branches.map((angle) => (
          <g key={angle} transform={`rotate(${angle} 16 16)`}>
            <path d="M16 2 V30" />
            <path d="M16 8 l-4 -4 M16 8 l4 -4 M16 24 l-4 4 M16 24 l4 4" />
          </g>
        ))}
        <circle cx="16" cy="16" r="2.4" />
      </g>
    </svg>
  );
}

export function Butterfly({ size = 32, className, style }: MotifProps) {
  return (
    <svg viewBox="0 0 40 32" width={size * 1.25} height={size} aria-hidden className={className} style={style}>
      <g fill="currentColor">
        <path d="M19 16 C13 4, 2 3, 3 12 C4 19, 13 19, 19 16 Z" />
        <path d="M21 16 C27 4, 38 3, 37 12 C36 19, 27 19, 21 16 Z" />
        <path d="M19 16 C13 21, 5 24, 7 29 C9 33, 17 24, 19 17 Z" opacity=".65" />
        <path d="M21 16 C27 21, 35 24, 33 29 C31 33, 23 24, 21 17 Z" opacity=".65" />
      </g>
      <g stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round">
        <path d="M20 8 V25" />
        <path d="M20 8 l-3 -5 M20 8 l3 -5" />
      </g>
    </svg>
  );
}

export function Blossom({ size = 26, className, style }: MotifProps) {
  return (
    <svg viewBox="0 0 32 32" {...base(size)} className={className} style={style}>
      <g fill="currentColor">
        {[0, 72, 144, 216, 288].map((angle) => (
          <ellipse key={angle} cx="16" cy="8" rx="4.6" ry="7" transform={`rotate(${angle} 16 16)`} />
        ))}
      </g>
      <circle cx="16" cy="16" r="3" fill="var(--tpl-bg, #fff)" />
    </svg>
  );
}

export function Unicorn({ size = 34, className, style }: MotifProps) {
  return (
    <svg viewBox="0 0 36 40" width={size * 0.9} height={size} aria-hidden className={className} style={style}>
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
        {/* La corne */}
        <path d="M18 2 L14 13 h8 Z" />
        <path d="M15.4 9 h5.2 M16.4 6 h3.2" />
        {/* La tête */}
        <path d="M11 13 C6 16, 5 24, 9 29 l2 9 M22 13 c5 3, 6 11, 2 16 l-2 9" />
        <path d="M11 38 h11" />
        {/* L'oreille et la crinière */}
        <path d="M10 14 l-5 -3 1 6" />
        <path d="M24 16 c5 2, 6 8, 3 13 c-2 3, -5 3, -6 1" />
      </g>
    </svg>
  );
}

export function Rainbow({ size = 34, className, style }: MotifProps) {
  return (
    <svg viewBox="0 0 48 28" width={size * 1.7} height={size} aria-hidden className={className} style={style}>
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        <path d="M4 26 A20 20 0 0 1 44 26" strokeWidth="3" />
        <path d="M10 26 A14 14 0 0 1 38 26" strokeWidth="3" opacity=".62" />
        <path d="M16 26 A8 8 0 0 1 32 26" strokeWidth="3" opacity=".34" />
      </g>
    </svg>
  );
}

export function Hibiscus({ size = 32, className, style }: MotifProps) {
  return (
    <svg viewBox="0 0 34 34" {...base(size)} className={className} style={style}>
      <g fill="currentColor">
        {[0, 72, 144, 216, 288].map((angle) => (
          <path
            key={angle}
            d="M17 17 C11 13, 10 5, 17 2 C24 5, 23 13, 17 17 Z"
            transform={`rotate(${angle} 17 17)`}
          />
        ))}
      </g>
      <g stroke="var(--tpl-bg, #fff)" strokeWidth="1.4" strokeLinecap="round">
        <path d="M17 17 V6" />
      </g>
    </svg>
  );
}

export function Shell({ size = 28, className, style }: MotifProps) {
  return (
    <svg viewBox="0 0 32 30" width={size * 1.06} height={size} aria-hidden className={className} style={style}>
      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M16 28 C4 22, 2 10, 16 2 C30 10, 28 22, 16 28 Z" />
        <path d="M16 28 V4 M16 28 C11 21, 9 12, 12 5 M16 28 c5 -7, 7 -16, 4 -23" />
      </g>
    </svg>
  );
}

export function Wave({ size = 30, className, style }: MotifProps) {
  return (
    <svg viewBox="0 0 48 20" width={size * 1.9} height={size} aria-hidden className={className} style={style}>
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M2 12 C8 4, 14 4, 20 12 S32 20, 38 12 S46 6, 46 8" />
        <path d="M2 18 C8 12, 14 12, 20 18" opacity=".5" />
      </g>
    </svg>
  );
}
