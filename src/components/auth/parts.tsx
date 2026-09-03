import Link from "next/link";

/* L'en-tete est centre : la carte est etroite, et un titre cale a
   gauche au-dessus de champs cales a gauche donnait une colonne
   molle. Les champs, eux, restent alignes a gauche — on ne centre
   jamais un formulaire qu'on doit remplir. */
export function AuthHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
}) {
  return (
    <header className="mb-9 text-center">
      <p className="eyebrow-sm text-gold">{eyebrow}</p>
      <h1 className="mt-4 font-display text-[clamp(1.75rem,7vw,2.25rem)] leading-[1.06]">
        {title}
      </h1>
      {description && (
        <p className="mx-auto mt-4 max-w-[22rem] text-[0.82rem] font-light leading-relaxed text-ink-soft">
          {description}
        </p>
      )}
      <span aria-hidden className="rule-gold mx-auto mt-7 block h-px w-24" />
    </header>
  );
}

export function AuthFooterLink({
  children,
  href,
  label,
}: {
  children: React.ReactNode;
  href: string;
  label: string;
}) {
  return (
    <p className="mt-9 border-t border-line pt-6 text-center text-[0.82rem] font-light text-ink-soft">
      {children}{" "}
      <Link href={href} className="link-draw text-ink transition-colors hover:text-burgundy">
        {label}
      </Link>
    </p>
  );
}

/** Bandeau affiché uniquement lorsque Supabase n’est pas configuré. */
export function DemoHint({ email, password }: { email: string; password: string }) {
  return (
    <div className="mb-8 rounded-sm border border-line bg-ivory-deep px-5 py-4">
      <p className="eyebrow-sm text-gold">Mode démonstration</p>
      <p className="mt-2 text-xs font-light leading-relaxed text-ink-soft">
        Supabase n’est pas configuré : les données vivent en mémoire. Connectez-vous avec{" "}
        <span className="text-ink">{email}</span> / <span className="text-ink">{password}</span>.
      </p>
    </div>
  );
}
