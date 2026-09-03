import { Reveal } from "@/components/motion/reveal";
import { DrawnRule } from "@/components/motion/reveal";

export function MobileFirst() {
  return (
    <section className="bg-ivory-deep py-24 sm:py-32">
      <div className="shell">
        <DrawnRule />
        <div className="mt-16 grid gap-14 lg:grid-cols-12 lg:gap-20">
          <Reveal className="lg:col-span-6">
            <p className="eyebrow text-gold">Pensé pour le pouce</p>
            <h2 className="mt-8 font-display text-[clamp(2.2rem,5vw,3.5rem)] leading-[1.05]">
              Le lien sera ouvert
              <br />
              <span className="italic">dans un fil WhatsApp.</span>
            </h2>
            <p className="mt-7 max-w-md text-[0.9375rem] font-light leading-[1.9] text-ink-soft">
              Entre deux messages, sur un écran de six pouces, souvent d’une seule main.
              C’est là que tout se joue. Chaque collection est composée d’abord pour le
              mobile : typographie lisible, images légères, zéro attente.
            </p>
          </Reveal>

          <Reveal delay={0.12} className="lg:col-span-6 lg:pt-4">
            <ul className="space-y-5 border-t border-line pt-8 lg:border-t-0 lg:pt-0">
              {[
                "Aperçu soigné dès le partage du lien",
                "Chargement immédiat, même en 3G",
                "Compte à rebours et musique sans application",
              ].map((line) => (
                <li key={line} className="flex items-start gap-4 text-sm font-light text-ink-soft">
                  <span aria-hidden className="mt-2.5 h-px w-6 shrink-0 bg-gold" />
                  {line}
                </li>
              ))}
            </ul>
          </Reveal>

        </div>
      </div>
    </section>
  );
}
