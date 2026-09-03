import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

/** L'icone de l'application : le Z-enveloppe au coeur. C'est un PNG,
 *  donc il ne prend pas la couleur du texte comme le fait `Mark` —
 *  a n'utiliser que la ou on veut le logo en couleur. */
export function Icone({ className }: { className?: string }) {
  return (
    <Image
      src="/icone-512.png"
      alt=""
      width={512}
      height={512}
      priority
      className={cn("size-7 shrink-0", className)}
    />
  );
}

/** L’arche, réduite à son trait : la marque de Zevent. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 28" fill="none" aria-hidden className={cn("size-5", className)}>
      <path
        d="M1 27V12a11 11 0 0 1 22 0v15"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="square"
      />
      <path d="M12 27V17" stroke="currentColor" strokeWidth="1" strokeLinecap="square" opacity=".45" />
    </svg>
  );
}

export function Logo({
  href = "/",
  className,
  tone = "ink",
  suffix,
}: {
  href?: string;
  className?: string;
  tone?: "ink" | "ivory";
  /** Le produit dans lequel on se trouve : « Mariage », « Anniversaire ». */
  suffix?: string;
}) {
  return (
    <Link
      href={href}
      aria-label="Zevent, accueil"
      className={cn(
        "min-h-11",
        "group inline-flex items-center gap-2.5 transition-opacity duration-500 hover:opacity-70",
        tone === "ivory" ? "text-ivory" : "text-ink",
        className,
      )}
    >
      <Icone className="size-6 sm:size-7" />
      {/* L'interlettrage se resserre sur telephone : a 0,34 em, le mot
          plus le produit ne tenaient pas a cote du bouton de menu. */}
      <span className="font-display text-[1.0625rem] leading-none tracking-[0.24em] sm:tracking-[0.34em]">
        ZEVENT
      </span>
      {suffix && (
        /* Le produit etait masque sous 640 px : on le voyait sur
           ordinateur et jamais sur telephone, la ou il sert le plus. */
        <span className="eyebrow-sm whitespace-nowrap border-l border-line-strong pl-2 text-ink-faint sm:pl-2.5">
          {suffix}
        </span>
      )}
    </Link>
  );
}
