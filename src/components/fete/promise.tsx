import { Reveal } from "@/components/motion/reveal";
import { Section } from "./section";

const PILLARS = [
  {
    title: "Une direction artistique",
    body: "Un anniversaire n’oblige pas aux ballons. Chaque collection est dessinée comme un carton gravé : typographies, filets, couleurs, rythme.",
  },
  {
    title: "Une page qui respire",
    body: "L’âge, la date, le lieu, la playlist, les photos, le mot de fin. La page se découvre au fil du défilement, comme un magazine.",
  },
  {
    title: "Un lien, partout",
    body: "Un seul lien à envoyer dans le groupe. Il s’ouvre en une seconde sur n’importe quel téléphone, avec un aperçu soigné sur WhatsApp.",
  },
];

export function Promise() {
  return (
    <Section id="promesse" eyebrow="La promesse">
      <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-6">
          <h2 className="font-fete font-bold tracking-[-0.02em] text-[clamp(2.2rem,5.4vw,4rem)] leading-[1.03]">
            Un message de groupe
            <br />
            se perd.
            <br />
            <span className="italic text-prune">Une page se garde.</span>
          </h2>
        </Reveal>

        <div className="lg:col-span-6 lg:pt-3">
          <Reveal delay={0.1}>
            <p className="text-[0.9375rem] font-light leading-[1.9] text-ink-soft">
              Zevent remplace le message improvisé la veille par une page entière, conçue pour
              être ouverte sur un téléphone. Vos invités y trouvent l’heure, l’adresse,
              l’itinéraire, la playlist et le ton de la soirée — au même endroit.
            </p>
          </Reveal>

          <div className="mt-12 space-y-0">
            {PILLARS.map((pillar, index) => (
              <Reveal key={pillar.title} delay={0.16 + index * 0.08}>
                <div className="grid gap-2 border-t border-line py-7 sm:grid-cols-[9rem_1fr] sm:gap-8">
                  <h3 className="font-fete font-semibold text-[1.0625rem] leading-snug">{pillar.title}</h3>
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
