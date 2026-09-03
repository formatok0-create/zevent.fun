import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Plate } from "@/components/ui/plate";

export default function NotFound() {
  return (
    <main className="shell grid min-h-dvh items-center py-24">
      <div className="grid items-center gap-14 md:grid-cols-[minmax(0,16rem)_1fr] md:gap-20">
        <Plate shape="arch" ratio="aspect-[3/4]" monogram="Z" frame />
        <div className="max-w-md">
          <Logo />
          <p className="eyebrow mt-12 text-gold">Page introuvable</p>
          <h1 className="mt-6 font-display text-[clamp(2.4rem,6vw,3.75rem)] leading-[1.02]">
            Cette page n’existe pas
            <span className="italic"> — ou plus.</span>
          </h1>
          <p className="mt-6 text-sm font-light leading-relaxed text-ink-soft">
            Le lien a peut-être été retiré, ou l’adresse contient une faute.
            Vérifiez le lien reçu, ou revenez à l’accueil.
          </p>
          <div className="mt-10">
            <ButtonLink href="/">Retour à l’accueil</ButtonLink>
          </div>
        </div>
      </div>
    </main>
  );
}
