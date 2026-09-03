import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export default function BirthdayNotFound() {
  return (
    <main className="voix-agrume fond-agrume shell grid min-h-dvh items-center py-24">
      <div className="grid items-center gap-14 md:grid-cols-[minmax(0,15rem)_1fr] md:gap-20">
        <span className="quatrefoil plate-fete relative mx-auto grid aspect-square w-full max-w-[15rem] place-items-center md:mx-0">
          <span className="font-fete text-[3rem] font-bold leading-none text-ivory/70">?</span>
        </span>
        <div className="max-w-md">
          <Logo suffix="Anniversaire" />
          <p className="eyebrow mt-12 text-flamme">Invitation indisponible</p>
          <h1 className="mt-6 font-fete text-[clamp(2.1rem,6vw,3.4rem)] font-bold leading-[1.05] tracking-[-0.02em]">
            Cette invitation
            <span className="text-flamme"> n’est plus en ligne.</span>
          </h1>
          <p className="mt-6 text-sm font-light leading-relaxed text-ink-soft">
            Elle a peut-être été retirée, ou le lien contient une faute. Le plus simple est
            de redemander le lien exact aux parents.
          </p>
          <div className="mt-10">
            <ButtonLink href="/anniversaire" voice="fete" variant="outline">
              Découvrir Zevent
            </ButtonLink>
          </div>
        </div>
      </div>
    </main>
  );
}
