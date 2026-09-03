import { ButtonLink } from "@/components/ui/button";
import { Plate } from "@/components/ui/plate";
import { Logo } from "@/components/ui/logo";

export default function InvitationNotFound() {
  return (
    <main className="voix-cerise fond-cerise shell grid min-h-dvh items-center py-24">
      <div className="grid items-center gap-14 md:grid-cols-[minmax(0,15rem)_1fr] md:gap-20">
        <Plate shape="arch" ratio="aspect-[3/4]" monogram="?" frame />
        <div className="max-w-md">
          <Logo />
          <p className="eyebrow mt-12 text-gold">Invitation indisponible</p>
          <h1 className="mt-6 font-display text-[clamp(2.2rem,6vw,3.5rem)] leading-[1.03]">
            Cette invitation
            <span className="italic"> n’est plus en ligne.</span>
          </h1>
          <p className="mt-6 text-sm font-light leading-relaxed text-ink-soft">
            Les mariés l’ont peut-être retirée, ou le lien contient une faute. Le plus simple
            est de leur redemander le lien exact.
          </p>
          <div className="mt-10">
            <ButtonLink href="/" variant="outline">Découvrir Zevent</ButtonLink>
          </div>
        </div>
      </div>
    </main>
  );
}
