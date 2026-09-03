import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { Section } from "./section";

const STEPS = [
  {
    index: "01",
    title: "Créez",
    body: "Choisissez le type de cérémonie et une collection. Votre invitation existe dès la première minute, en brouillon.",
  },
  {
    index: "02",
    title: "Personnalisez",
    body: "Vos prénoms, la date, le lieu, vos photos, votre histoire, la musique. Vous voyez le résultat pendant que vous écrivez.",
  },
  {
    index: "03",
    title: "Partagez",
    body: "Publiez, récupérez votre lien zevent.fun, envoyez-le sur WhatsApp. Vous pouvez le modifier ou le retirer à tout moment.",
  },
];

export function HowItWorks() {
  return (
    <Section id="creation" eyebrow="Comment ça marche">
      <Stagger className="grid gap-px sm:grid-cols-3 sm:gap-0" stagger={0.14}>
        {STEPS.map((step, index) => (
          <StaggerItem
            key={step.index}
            className={index > 0 ? "border-t border-line pt-10 sm:border-l sm:border-t-0 sm:pl-10 sm:pt-0" : "sm:pr-10"}
          >
            <div className="group pb-10 sm:pb-0">
              <p className="numeral text-[clamp(2.5rem,6vw,4rem)] leading-none text-line-strong transition-colors duration-700 ease-silk group-hover:text-gold">
                {step.index}
              </p>
              <h3 className="mt-7 font-display text-[1.75rem] leading-tight">{step.title}</h3>
              <p className="mt-4 max-w-xs text-sm font-light leading-[1.85] text-ink-soft">{step.body}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}
