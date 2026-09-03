import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-burgundy-deep text-ivory">
      {/* L’arche, en creux, à l’échelle de la page. */}
      <span
        aria-hidden
        className="arch-tall pointer-events-none absolute left-1/2 top-16 h-[85%] w-[min(88vw,44rem)] -translate-x-1/2 border border-champagne/15"
      />
      <div className="shell relative py-32 text-center sm:py-40">
        <Reveal>
          <p className="eyebrow text-champagne/70">Votre tour</p>
          <h2 className="mx-auto mt-9 max-w-3xl font-display text-[clamp(2.6rem,8vw,5.5rem)] leading-[0.98] text-ivory">
            Commencez
            <br />
            <span className="italic text-champagne">votre histoire.</span>
          </h2>
          <p className="mx-auto mt-9 max-w-md text-sm font-light leading-[1.9] text-ivory/65">
            Mariage musulman ou chrétien, créez votre invitation en quelques minutes.
            Vous ne publiez que lorsqu’elle vous ressemble.
          </p>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <ButtonLink href="/register" variant="gold" size="lg">Créer mon invitation</ButtonLink>
            <ButtonLink href="#collections" variant="ghost" size="lg" className="text-ivory/70 hover:text-ivory">
              Voir les collections
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
