import Image from "next/image";
import { cn } from "@/lib/utils/cn";

/* ═══════════════════════════════════════════════════════════════
   LA PLAQUE
   Toute image de Zevent est cadrée par une arche. C’est le motif
   unique de la marque : la voûte d’une chapelle, d’une mosquée,
   d’un portail de cour. En l’absence de photo, on ne montre jamais
   d’illustration générique — on montre un monogramme sur un
   dégradé chaud, comme un carton gravé.
   ═══════════════════════════════════════════════════════════════ */

type Shape = "arch" | "arch-tall" | "arch-low" | "square" | "quatrefoil";

const SHAPES: Record<Shape, string> = {
  arch: "arch",
  "arch-tall": "arch-tall",
  "arch-low": "arch-low",
  square: "rounded-sm",
  /* La signature de la fete. Un masque : il rogne aussi le filet grave. */
  quatrefoil: "quatrefoil",
};

export interface PlateProps {
  src?: string | null;
  alt?: string;
  shape?: Shape;
  ratio?: string;
  monogram?: string;
  caption?: string;
  from?: string;
  to?: string;
  frame?: boolean;
  dark?: boolean;
  priority?: boolean;
  sizes?: string;
  className?: string;
  children?: React.ReactNode;
}

export function Plate({
  src,
  alt = "",
  shape = "arch",
  ratio = "aspect-[4/5]",
  monogram,
  caption,
  from,
  to,
  frame = false,
  dark = false,
  priority,
  sizes = "(max-width: 768px) 100vw, 33vw",
  className,
  children,
}: PlateProps) {
  const style = from || to ? ({ "--plate-from": from, "--plate-to": to } as React.CSSProperties) : undefined;

  return (
    <figure className={cn("relative", frame && "frame-offset", SHAPES[shape], className)}>
      <div
        className={cn(
          "relative isolate w-full overflow-hidden",
          ratio,
          SHAPES[shape],
          dark ? "plate-dark" : "plate",
        )}
        style={style}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            unoptimized={src.startsWith("data:")}
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            {/* Arche gravée à l’intérieur de l’arche : le filet de la maison.
                Le quadrilobe est un masque : il couperait ce filet en
                morceaux, on ne le dessine donc pas. */}
            {shape !== "quatrefoil" && (
              <span
                aria-hidden
                className={cn(
                  "absolute inset-x-[14%] bottom-[9%] top-[9%] border",
                  dark ? "border-champagne/30" : "border-gold/35",
                  SHAPES[shape],
                )}
              />
            )}
            {monogram && (
              <span
                className={cn(
                  "font-display relative text-[clamp(1.5rem,4vw,2.5rem)] font-normal tracking-[0.08em]",
                  dark ? "text-champagne/85" : "text-brown/60",
                )}
              >
                {monogram}
              </span>
            )}
          </div>
        )}
        {children}
      </div>
      {caption && (
        <figcaption className="eyebrow-sm mt-4 text-ink-faint">{caption}</figcaption>
      )}
    </figure>
  );
}

/** Monogramme « A & Y » à partir de deux prénoms. */
export function monogramOf(a?: string | null, b?: string | null): string {
  const first = a?.trim()?.[0]?.toUpperCase();
  const second = b?.trim()?.[0]?.toUpperCase();
  if (first && second) return `${first} & ${second}`;
  return first ?? second ?? "Z";
}
