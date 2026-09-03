import { Reveal } from "@/components/motion/reveal";
import { Section, AgePlate } from "./section";

/* Le sommaire suit l’ordre de lecture réelle de la page, du chiffre
   jusqu’au mot final. */
const SUMMARY = [
  { numeral: "I", title: "Le chiffre", body: "L’âge en grand, le prénom, une photo pleine page." },
  { numeral: "II", title: "Le mot", body: "Pourquoi vous réunissez tout le monde, écrit par vous." },
  { numeral: "III", title: "Le compte à rebours", body: "Les jours qui restent avant la soirée." },
  { numeral: "IV", title: "La galerie", body: "Vos photos, cadrées et rythmées automatiquement." },
  { numeral: "V", title: "Le lieu", body: "L’adresse, l’heure et l’itinéraire en un geste." },
  { numeral: "VI", title: "La playlist", body: "Le morceau qui donne le ton, que l’invité active." },
  { numeral: "VII", title: "Le mot final", body: "Une dernière page, signée d’un prénom." },
];

export function Experience() {
  return (
    <Section id="experience" eyebrow="L’expérience">
      <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-5">
          <h2 className="font-fete font-bold tracking-[-0.02em] text-[clamp(2.2rem,5vw,3.5rem)] leading-[1.05]">
            Ce que vos invités
            <br />
            <span className="italic">vont découvrir.</span>
          </h2>
          <AgePlate age="30" className="mx-auto mt-12 max-w-[15rem] sm:max-w-[16rem] lg:mx-0" />
        </Reveal>

        <div className="lg:col-span-7">
          <ol>
            {SUMMARY.map((entry, index) => (
              <Reveal key={entry.numeral} delay={index * 0.05}>
                <li className="group grid grid-cols-[2.5rem_1fr] items-baseline gap-5 border-t border-line py-6 transition-colors duration-500 hover:border-flamme sm:grid-cols-[3rem_10rem_1fr] sm:gap-8">
                  <span className="numeral text-sm text-ink-faint transition-colors duration-500 group-hover:text-flamme">
                    {entry.numeral}
                  </span>
                  <h3 className="font-fete font-semibold text-[1.25rem] leading-none">{entry.title}</h3>
                  <p className="col-span-2 text-sm font-light leading-[1.8] text-ink-soft sm:col-span-1">
                    {entry.body}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  );
}
