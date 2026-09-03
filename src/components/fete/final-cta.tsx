import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-nuit-fete text-ivory">
      {/* Le quadrilobe, gravé au filet, à l’échelle de la page.
          Un masque ne sait pas dessiner un contour : c’est donc un
          tracé SVG, avec un trait qui ne s’épaissit pas à l’étirement. */}
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute left-1/2 top-16 h-[85%] w-[min(88vw,44rem)] -translate-x-1/2"
      >
        <path
          d="M0,30 A30,30 0 0 1 50,7.64 A30,30 0 0 1 100,30 A30,30 0 0 1 92.36,50 A30,30 0 0 1 100,70 A30,30 0 0 1 50,92.36 A30,30 0 0 1 0,70 A30,30 0 0 1 7.64,50 A30,30 0 0 1 0,30 Z"
          fill="none"
          stroke="var(--color-flamme)"
          strokeOpacity="0.22"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="shell relative py-32 text-center sm:py-40">
        <Reveal>
          <p className="eyebrow text-flamme/80">Votre tour</p>
          <h2 className="mx-auto mt-9 max-w-3xl font-fete font-bold tracking-[-0.02em] text-[clamp(2.6rem,8vw,5.5rem)] leading-[0.98] text-ivory">
            Donnez-leur
            <br />
            <span className="italic text-flamme">une date.</span>
          </h2>
          <p className="mx-auto mt-9 max-w-md text-sm font-light leading-[1.9] text-ivory/65">
            Sept ans ou soixante, créez la page de votre anniversaire en quelques minutes.
            Vous ne publiez que lorsqu’elle vous ressemble.
          </p>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <ButtonLink voice="fete" href="/dashboard/invitations/new?produit=anniversaire" variant="gold" size="lg">Créer mon invitation</ButtonLink>
            <ButtonLink voice="fete" href="#collections" variant="ghost" size="lg" className="text-ivory/70 hover:text-ivory">
              Voir les collections
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
