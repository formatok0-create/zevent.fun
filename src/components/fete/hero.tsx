"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ButtonLink } from "@/components/ui/button";

const EASE = [0.16, 1, 0.3, 1] as const;

/* La thèse de la page : un mariage montre deux prénoms, un anniversaire
   montre un âge. Le chiffre est donc l’image, pas une décoration. */
export function Hero() {
  const section = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end start"] });
  const plateY = useTransform(scrollYProgress, [0, 1], ["0%", reduced ? "0%" : "10%"]);

  const rise = (delay: number) => ({
    initial: reduced ? undefined : { opacity: 0, y: 22, filter: "blur(7px)" },
    animate: reduced ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 1.2, delay, ease: EASE },
  });

  return (
    <section ref={section} className="relative overflow-hidden pb-24 pt-32 sm:pb-32 sm:pt-40">
      <div className="shell grid items-center gap-16 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7 lg:pr-10">
          <motion.p {...rise(0.1)} className="eyebrow flex items-center gap-4 text-flamme">
            <span aria-hidden className="inline-block h-px w-10 bg-flamme" />
            Anniversaires — de 1 an à 100 ans
          </motion.p>

          <motion.h1
            {...rise(0.22)}
            className="mt-8 font-fete font-bold tracking-[-0.02em] text-[clamp(2.6rem,6vw,4.75rem)] leading-[1.02] tracking-[-0.02em]"
          >
            On ne fête pas
            <br />
            un âge. On fête
            <br />
            <span className="italic text-prune">quelqu’un.</span>
          </motion.h1>

          <motion.p
            {...rise(0.36)}
            className="mt-9 max-w-md text-[0.9375rem] font-light leading-[1.85] text-ink-soft"
          >
            Créez la page de votre anniversaire : le chiffre, la date, le lieu, la playlist,
            les photos et le mot que vous voulez laisser. Un lien à envoyer, et tout le monde
            sait quand, où, et pourquoi il compte.
          </motion.p>

          <motion.div {...rise(0.42)} className="mt-8 flex flex-wrap gap-3">
            {["Sept ans", "Treize ans", "Seize ans", "Trente ans"].map((label) => (
              <span
                key={label}
                className="eyebrow-sm rounded-full border border-flamme/45 px-4 py-2 text-brown"
              >
                {label}
              </span>
            ))}
          </motion.div>

          <motion.div {...rise(0.5)} className="mt-11 flex flex-col gap-4 sm:flex-row sm:items-center">
            <ButtonLink voice="fete" href="/dashboard/invitations/new?produit=anniversaire" size="lg">Créer mon invitation</ButtonLink>
            <ButtonLink voice="fete" href="#collections" variant="ghost" size="lg">Voir les collections</ButtonLink>
          </motion.div>
        </div>

        {/* Le chiffre, cadré par le quadrilobe. */}
        <motion.div
          {...rise(0.3)}
          style={{ y: plateY }}
          className="relative mx-auto w-full max-w-[20rem] lg:col-span-5 lg:mx-0"
        >
          <span
            aria-hidden
            className="absolute -inset-6 bg-[radial-gradient(60%_50%_at_50%_62%,rgba(233,161,59,.22),transparent_70%)]"
          />
          <div className="quatrefoil plate-fete relative grid aspect-square w-full place-items-center">
            <div className="text-center">
              <p className="font-fete text-[clamp(4.5rem,16vw,8rem)] font-semibold leading-none tracking-[-0.04em] text-ivory">
                7
              </p>
              <span aria-hidden className="mx-auto mt-4 block h-px w-10 bg-flamme" />
              <p className="mt-4 text-[0.55rem] uppercase tracking-[0.28em] text-champagne/80">
                Samedi 12 juillet · 15h
              </p>
            </div>
          </div>
          <p className="eyebrow-sm mt-6 text-center text-ink-faint">Collection Royaume</p>
        </motion.div>
      </div>
    </section>
  );
}
