import { Reveal } from "@/components/motion/reveal";
import { Section } from "./section";

const PILLARS = [
  {
    title: "Une direction artistique",
    body: "Chaque collection est dessinée comme une papeterie de maison : typographies, filets, couleurs, rythme. Rien n’est laissé au hasard.",
  },
  {
    title: "Une page qui respire",
    body: "Votre histoire, vos photos, la musique, le compte à rebours. L’invitation se découvre au fil du défilement, comme un magazine.",
  },
  {
    title: "Un lien, partout",
    body: "Un seul lien à envoyer. Il s’ouvre en une seconde sur n’importe quel téléphone, et affiche un aperçu soigné sur WhatsApp.",
  },
];

export function Promise() {
  return (
    <Section id="promesse" eyebrow="La promesse">
      <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-6">
          <h2 className="font-display text-[clamp(2.05rem,5vw,3.6rem)] leading-[1.06]">
            Un faire-part se range
            <br />
            dans un tiroir.
            <br />
            <span className="italic text-burgundy">Une expérience se partage.</span>
          </h2>
        </Reveal>

        <div className="lg:col-span-6 lg:pt-3">
          <Reveal delay={0.1}>
            <p className="text-[0.9375rem] font-light leading-[1.9] text-ink-soft">
              Zevent remplace le carton par une page entière, conçue pour être ouverte sur un
              téléphone. Vos invités y trouvent la date, le lieu, l’itinéraire, la playlist et
              votre histoire — au même endroit, dans la même lumière.
            </p>
          </Reveal>

          <div className="mt-12 space-y-0">
            {PILLARS.map((pillar, index) => (
              <Reveal key={pillar.title} delay={0.16 + index * 0.08}>
                <div className="grid gap-2 border-t border-line py-7 sm:grid-cols-[9rem_1fr] sm:gap-8">
                  <h3 className="font-display text-[1.0625rem] leading-snug">{pillar.title}</h3>
                  <p className="text-sm font-light leading-[1.8] text-ink-soft">{pillar.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
