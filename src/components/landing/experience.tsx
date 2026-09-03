import { Reveal } from "@/components/motion/reveal";
import { PhoneVideo } from "@/components/ui/phone-video";
import { Section } from "./section";

/* Un sommaire de magazine : l’ordre est celui de la lecture réelle
   de l’invitation, du hero jusqu’au mot final. */
const SUMMARY = [
  { numeral: "I", title: "Le hero", body: "Vos prénoms, la date, une photo pleine page." },
  { numeral: "II", title: "L’histoire", body: "Comment vous vous êtes rencontrés, écrit par vous." },
  { numeral: "III", title: "Le compte à rebours", body: "Les jours qui vous séparent du grand jour." },
  { numeral: "IV", title: "La galerie", body: "Vos photos, cadrées et rythmées automatiquement." },
  { numeral: "V", title: "Le lieu", body: "L’adresse, l’heure et l’itinéraire en un geste." },
  { numeral: "VI", title: "La musique", body: "Une ambiance sonore discrète, que l’invité active." },
  { numeral: "VII", title: "Le mot final", body: "Une dernière page, signée de vos deux prénoms." },
];

export function Experience() {
  return (
    <Section id="experience" eyebrow="L’expérience">
      <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-5">
          <h2 className="font-display text-[clamp(2.2rem,5vw,3.5rem)] leading-[1.05]">
            Ce que vos invités
            <br />
            <span className="italic">vont découvrir.</span>
          </h2>
          <div className="relative mx-auto mt-12 max-w-[12.5rem] xs:max-w-[14rem] sm:max-w-[16rem] lg:mx-0">
            <span aria-hidden className="arch-tall absolute -inset-x-7 -bottom-5 -top-9 border border-gold/40" />
            <span
              aria-hidden
              className="plate arch-tall absolute -inset-x-5 -bottom-3 -top-7 -z-10"
              style={{ "--plate-from": "#F6EDEE", "--plate-to": "#8E1428" } as React.CSSProperties}
            />
            <PhoneVideo
              src="/video/apercu-experience.mp4"
              poster="/video/apercu-experience.jpg"
              className="relative w-full"
            />
          </div>
        </Reveal>

        <div className="lg:col-span-7">
          <ol>
            {SUMMARY.map((entry, index) => (
              <Reveal key={entry.numeral} delay={index * 0.05}>
                <li className="group grid grid-cols-[2.5rem_1fr] items-baseline gap-5 border-t border-line py-6 transition-colors duration-500 hover:border-gold sm:grid-cols-[3rem_10rem_1fr] sm:gap-8">
                  <span className="numeral text-sm text-ink-faint transition-colors duration-500 group-hover:text-gold">
                    {entry.numeral}
                  </span>
                  <h3 className="font-display text-[1.25rem] leading-none">{entry.title}</h3>
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
