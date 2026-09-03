import { Logo } from "@/components/ui/logo";

/* ═══════════════════════════════════════════════════════════════
   L'ENTREE
   Plus de demi-page imprimee / demi-page vide : le fond est un seul
   aplat profond, et la carte y est posee, seule, au centre. Le mot
   grave derriere, le logo au-dessus, la ligne de preuves en dessous.

   La reference etait une affiche de jeu ; ce qu'on lui reprend est
   sa composition — champ sature, carte flottante, typographie
   monumentale — pas sa couleur ni son vocabulaire. Le papier, le
   bordeaux, l'or et la Bodoni ne bougent pas : c'est ce qui fait
   que cette page reste le meme site que les deux landings.
   ═══════════════════════════════════════════════════════════════ */

const PREUVES = [
  { valeur: "26", label: "Collections" },
  { valeur: "1", label: "Lien à partager" },
  { valeur: "0", label: "Appli à installer" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-burgundy-deep px-5 py-12">
      {/* La lumiere tombe du haut, comme sur un carton pose sur une table. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-[30%] h-[85svh] bg-[radial-gradient(50%_55%_at_50%_50%,rgba(184,155,106,0.20),transparent_72%)]"
      />
      {/* L'arche en tres grand : le decor est la signature elle-meme,
          jamais un ornement pose par-dessus. */}
      <span
        aria-hidden
        className="arch-tall pointer-events-none absolute left-1/2 top-[10%] hidden h-[80%] w-[36rem] -translate-x-1/2 border border-champagne/10 sm:block"
      />

      <div className="relative w-full max-w-[27rem]">
        <div className="flex justify-center">
          <Logo tone="ivory" />
        </div>

        {/* Le mot grave dans le fond, que la carte vient couper. */}
        <p
          aria-hidden
          className="pointer-events-none mt-8 select-none text-center font-display text-[clamp(3.6rem,16vw,5.75rem)] leading-[0.78] tracking-[0.08em] text-ivory/[0.07]"
        >
          ZEVENT
        </p>

        <div className="paper relative -mt-7 rounded-sm border border-champagne/25 px-6 py-10 shadow-[0_50px_90px_-40px_rgba(0,0,0,0.9)] sm:px-9 sm:py-12">
          {children}
        </div>

        {/* Trois chiffres, trois filets : ce que la maison promet, dit
            en six mots plutot qu'en un paragraphe. */}
        <ul className="mt-9 grid grid-cols-3">
          {PREUVES.map(({ valeur, label }, index) => (
            <li
              key={label}
              className={
                index === 0
                  ? "px-2 text-center"
                  : "border-l border-champagne/15 px-2 text-center"
              }
            >
              <p className="numeral text-[1.35rem] leading-none text-champagne">{valeur}</p>
              <p className="eyebrow-sm mt-2 text-ivory/45">{label}</p>
            </li>
          ))}
        </ul>

        <p className="mx-auto mt-9 max-w-[19rem] text-center text-[0.7rem] font-light leading-relaxed text-ivory/35">
          Vos invitations et vos photos restent votre propriété. Vous pouvez les retirer du web
          à tout moment, en un geste.
        </p>
      </div>
    </div>
  );
}
