/* ═══════════════════════════════════════════════════════════════
   LES ORNEMENTS
   Un filet nu n’a pas sa place ici. Chaque respiration de
   l’invitation est marquée par un fleuron gravé — comme sur une
   papeterie imprimée. Tout est dessiné en SVG : rien à charger.
   ═══════════════════════════════════════════════════════════════ */

/** Le fleuron de séparation : deux filets et une arabesque. */
export function Fleuron({
  color = "var(--tpl-accent)",
  width = 220,
  className,
}: {
  color?: string;
  width?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 220 24"
      width={width}
      aria-hidden
      className={className}
      style={{ color, maxWidth: "78%" }}
    >
      <g fill="none" stroke="currentColor" strokeWidth="0.85">
        <path d="M2 12 H86" />
        <path d="M134 12 H218" />
        {/* Volutes symétriques */}
        <path d="M86 12 C92 12, 94 7, 99 7 C103 7, 104 11, 100 12 C104 13, 103 17, 99 17 C94 17, 92 12, 86 12 Z" />
        <path d="M134 12 C128 12, 126 7, 121 7 C117 7, 116 11, 120 12 C116 13, 117 17, 121 17 C126 17, 128 12, 134 12 Z" />
        {/* Losange central */}
        <path d="M110 4 L115 12 L110 20 L105 12 Z" />
        <circle cx="110" cy="12" r="1.5" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

/** La rosace : marque le premier point d’une chronologie. */
export function Rosette({
  color = "var(--tpl-accent)",
  size = 34,
  className,
}: {
  color?: string;
  size?: number;
  className?: string;
}) {
  const petals = Array.from({ length: 8 }, (_, index) => index * 45);
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden className={className} style={{ color }}>
      <g fill="none" stroke="currentColor" strokeWidth="0.9">
        {petals.map((angle) => (
          <ellipse key={angle} cx="20" cy="20" rx="4.5" ry="12" transform={`rotate(${angle} 20 20)`} />
        ))}
        <circle cx="20" cy="20" r="3.4" />
        <circle cx="20" cy="20" r="1.4" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

/** Le losange discret : marque les points suivants d’une chronologie. */
export function Lozenge({ color = "var(--tpl-accent)", size = 12 }: { color?: string; size?: number }) {
  return (
    <svg viewBox="0 0 12 12" width={size} height={size} aria-hidden style={{ color }}>
      <g fill="currentColor">
        <path d="M6 0 L8 6 L6 12 L4 6 Z" />
        <path d="M0 6 L6 4 L12 6 L6 8 Z" opacity=".7" />
      </g>
    </svg>
  );
}

/** L’angle gravé : pose un cadre sur une image ou un bloc. */
export function CornerFlourish({
  color = "var(--tpl-accent)",
  size = 56,
  className,
}: {
  color?: string;
  size?: number;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} aria-hidden className={className} style={{ color }}>
      <g fill="none" stroke="currentColor" strokeWidth="0.9">
        <path d="M2 58 V22 C2 10, 10 2, 22 2 H58" />
        <path d="M8 58 V24 C8 15, 15 8, 24 8 H58" opacity=".45" />
        <circle cx="24" cy="24" r="2" fill="currentColor" stroke="none" opacity=".6" />
      </g>
    </svg>
  );
}

/** Le cartouche : un double filet et quatre angles gravés.
 *  C’est le cadre de papeterie qui pose un texte important. */
export function Cartouche({
  children,
  className,
  padded = true,
}: {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div className={`relative ${padded ? "px-5 py-10 sm:px-12 sm:py-14" : ""} ${className ?? ""}`}>
      <span
        aria-hidden
        className="absolute inset-0 border"
        style={{ borderColor: "color-mix(in srgb, var(--tpl-accent) 42%, transparent)" }}
      />
      <span
        aria-hidden
        className="absolute inset-[6px] border"
        style={{ borderColor: "color-mix(in srgb, var(--tpl-accent) 20%, transparent)" }}
      />
      <CornerFlourish className="absolute -left-px -top-px -scale-y-100" size={44} />
      <CornerFlourish className="absolute -right-px -top-px -scale-100" size={44} />
      <CornerFlourish className="absolute -bottom-px -left-px" size={44} />
      <CornerFlourish className="absolute -bottom-px -right-px -scale-x-100" size={44} />
      <div className="relative">{children}</div>
    </div>
  );
}
