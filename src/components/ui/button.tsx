import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "outline" | "gold" | "ghost" | "danger" | "flamme" | "nuit";
type Size = "sm" | "md" | "lg";
/** La maison parle en capitales gravées ; la fête parle fort et rond. */
type Voice = "maison" | "fete";

const BASE =
  "group relative inline-flex max-w-full min-w-0 select-none items-center justify-center gap-3 text-center leading-none transition-all duration-500 ease-silk disabled:pointer-events-none disabled:opacity-35";

/* La classe `zv-maison` n'habille rien par elle-même : elle donne à la
   voix cerise un point d'accroche pour passer le libellé à la machine
   à écrire, sans que le bouton connaisse le thème. */
const MAISON = "zv-maison font-sans font-semibold uppercase";

/* Plus gros et plus gras qu'avant : le libellé se lisait mal, surtout
   sur un téléphone tenu à bout de bras. */
const SIZES: Record<Size, string> = {
  sm: "h-10 px-4 text-[0.65rem] tracking-[0.14em] sm:px-6 sm:text-[0.6875rem] sm:tracking-[0.18em]",
  md: "h-12 px-6 text-[0.72rem] tracking-[0.14em] sm:px-8 sm:text-[0.8125rem] sm:tracking-[0.16em]",
  lg: "h-14 px-7 text-[0.8rem] tracking-[0.12em] sm:px-10 sm:text-[0.9375rem] sm:tracking-[0.14em]",
};

/* Meme role que `zv-maison` : un point d'accroche pour la voix agrume. */
const FETE = "zv-fete font-fete font-bold normal-case rounded-full";

/* Les tailles montent avec l'ecran : a 390 px de large, un bouton de
   4 rem de haut et 1,2 rem de texte sortait du cadre. */
const FETE_SIZES: Record<Size, string> = {
  sm: "h-10 px-5 text-[0.85rem] sm:h-11 sm:px-7 sm:text-[0.95rem]",
  md: "h-12 px-6 text-[0.95rem] sm:h-14 sm:px-9 sm:text-[1.0625rem]",
  lg: "h-13 px-7 text-[1rem] sm:h-16 sm:px-11 sm:text-[1.1875rem]",
};

const VARIANTS: Record<Variant, string> = {
  primary: "rounded-sm bg-burgundy text-ivory hover:bg-burgundy-deep",
  outline:
    "rounded-sm border border-ink/20 text-ink hover:border-ink hover:bg-ink hover:text-ivory",
  gold: "rounded-sm bg-champagne text-ink hover:bg-gold hover:text-ivory",
  ghost: "text-ink-soft hover:text-ink",
  danger:
    "rounded-sm border border-danger/35 text-danger hover:border-danger hover:bg-danger hover:text-ivory",
  /* ── Les deux teintes de la fête ── */
  flamme: "rounded-sm bg-flamme text-nuit-fete hover:bg-flamme/85",
  nuit: "rounded-sm bg-prune text-ivory hover:bg-nuit-fete",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  voice?: Voice;
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
}

function Inner({ variant, loading, children }: { variant: Variant; loading?: boolean; children: React.ReactNode }) {
  return (
    <>
      {/* Le cadre or décalé : la signature de la maison sur l’action principale. */}
      {variant === "primary" && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-sm border border-gold opacity-0 transition-all duration-700 ease-silk group-hover:translate-x-[5px] group-hover:translate-y-[5px] group-hover:opacity-100"
        />
      )}
      {loading && (
        <span
          aria-hidden
          className="size-3 shrink-0 rounded-full border border-current border-t-transparent"
          style={{ animation: "zv-rotate 0.9s linear infinite" }}
        />
      )}
      <span className="relative">{children}</span>
    </>
  );
}

function shape(voice: Voice, size: Size, variant: Variant) {
  return voice === "fete"
    ? [BASE, FETE, FETE_SIZES[size], VARIANTS[variant], "rounded-full"]
    : [BASE, MAISON, SIZES[size], VARIANTS[variant]];
}

export function Button({
  variant = "primary",
  size = "md",
  voice = "maison",
  loading,
  className,
  children,
  ...props
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(shape(voice, size, variant), className)}
      aria-busy={loading || undefined}
      disabled={props.disabled || loading}
      {...props}
    >
      <Inner variant={variant} loading={loading}>
        {children}
      </Inner>
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  voice = "maison",
  className,
  children,
  href,
  ...props
}: CommonProps & { href: string } & Omit<React.ComponentProps<typeof Link>, "href" | "className">) {
  return (
    <Link href={href} className={cn(shape(voice, size, variant), className)} {...props}>
      <Inner variant={variant}>{children}</Inner>
    </Link>
  );
}

/** Le lien éditorial : capitales espacées, trait qui se dessine. */
export function TextLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={cn("eyebrow link-draw text-ink transition-colors hover:text-burgundy", className)}>
      {children}
    </Link>
  );
}
