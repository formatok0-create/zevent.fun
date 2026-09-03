"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ButtonLink } from "@/components/ui/button";
import { PhoneVideo } from "@/components/ui/phone-video";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const section = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end start"] });
  const plateY = useTransform(scrollYProgress, [0, 1], ["0%", reduced ? "0%" : "12%"]);
  const phoneY = useTransform(scrollYProgress, [0, 1], ["0%", reduced ? "0%" : "-8%"]);

  const rise = (delay: number) => ({
    initial: reduced ? undefined : { opacity: 0, y: 22, filter: "blur(7px)" },
    animate: reduced ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 1.2, delay, ease: EASE },
  });

  return (
    <section ref={section} className="relative overflow-hidden pb-24 pt-32 sm:pb-32 sm:pt-40">
      <div className="shell grid items-center gap-16 lg:grid-cols-12 lg:gap-10">
        {/* ── Le texte ───────────────────────────────────────── */}
        <div className="lg:col-span-7 lg:pr-10">
          <motion.p {...rise(0.1)} className="eyebrow flex items-center gap-4 text-gold">
            <span aria-hidden className="inline-block h-px w-10 bg-gold" />
            Mariages musulmans &amp; chrétiens
          </motion.p>

          <motion.h1
            {...rise(0.22)}
            className="mt-8 font-display text-[clamp(2.6rem,6vw,4.75rem)] leading-[1.02] tracking-[-0.02em]"
          >
            Votre histoire
            <br />
            mérite plus qu’une
            <br />
            <span className="italic text-burgundy">invitation.</span>
          </motion.h1>

          <motion.p
            {...rise(0.36)}
            className="mt-9 max-w-md text-[0.9375rem] font-light leading-[1.85] text-ink-soft"
          >
            Créez une invitation de mariage digitale élégante et entièrement personnalisée.
            Nikah, walima, coutumier, civil, religieux — chaque cérémonie a sa place.
            Un lien à partager, une émotion à transmettre.
          </motion.p>

          <motion.div {...rise(0.42)} className="mt-8 flex flex-wrap gap-3">
            {["Mariage musulman", "Mariage chrétien"].map((label) => (
              <span
                key={label}
                className="eyebrow-sm rounded-full border border-gold/45 px-4 py-2 text-brown"
              >
                {label}
              </span>
            ))}
          </motion.div>

          <motion.div {...rise(0.48)} className="mt-11 flex flex-col gap-4 sm:flex-row sm:items-center">
            <ButtonLink href="/register" size="lg">Créer mon invitation</ButtonLink>
            <ButtonLink href="#experience" variant="ghost" size="lg" className="justify-start sm:justify-center">
              Découvrir l’expérience
            </ButtonLink>
          </motion.div>

        </div>

        {/* ── L’objet ────────────────────────────────────── */}
        <div className="relative lg:col-span-5">
          {/* Le `clip-path` de la revelation portait sur tout le groupe :
              il rognait l'arche a la boite du telephone, et il ne restait
              d'elle que deux bandes sur les cotes. Il ne s'applique plus
              qu'au telephone ; l'arche, elle, se contente d'un fondu. */}
          <motion.div
            style={{ y: plateY }}
            initial={reduced ? undefined : { opacity: 0 }}
            animate={reduced ? undefined : { opacity: 1 }}
            transition={{ duration: 1.6, delay: 0.3, ease: EASE }}
            className="relative mx-auto w-full max-w-[17.5rem] pt-[3.25rem] xs:max-w-[19rem] sm:max-w-[21rem] sm:pt-16 lg:max-w-none lg:pt-20"
          >
            {/* L’arche encadre le téléphone : le motif de la maison
                sert de cadre à la démonstration. */}
            <span
              aria-hidden
              className="arch-tall filet-arche absolute inset-x-3 bottom-8 top-2 border border-gold/40 sm:inset-x-4 sm:bottom-10"
            />
            <span
              aria-hidden
              className="plate-arche arch-tall absolute inset-x-0 bottom-0 top-6 -z-10 sm:top-8"
            />
            <motion.div
              style={{ y: phoneY }}
              initial={reduced ? undefined : { opacity: 0, clipPath: "inset(100% 0 0 0)" }}
              animate={reduced ? undefined : { opacity: 1, clipPath: "inset(0% 0 0 0)" }}
              transition={{ duration: 1.5, delay: 0.5, ease: EASE }}
              className="relative"
            >
              <PhoneVideo
                src="/video/apercu-invitation.mp4"
                poster="/video/apercu-invitation.jpg"
                className="mx-auto w-full max-w-[13.5rem] xs:max-w-[15rem] sm:max-w-[17rem] lg:max-w-[19rem]"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

    </section>
  );
}

