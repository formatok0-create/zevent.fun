import type { Metadata } from "next";
import Link from "next/link";
import { Icone } from "@/components/ui/logo";
import { SITE } from "@/lib/config";

/* ═══════════════════════════════════════════════════════════════
   LA PORTE
   Première chose que voit un visiteur : deux célébrations, deux
   formes. L'arche pour le mariage, le quadrilobe pour la fête.
   Un seul écran, aucune scroll : on la traverse en une seconde.
   ═══════════════════════════════════════════════════════════════ */

export const metadata: Metadata = {
  title: `${SITE.name} — Mariage ou anniversaire`,
  description:
    "Créez l'invitation digitale de votre mariage ou de votre anniversaire. Un lien à partager, une émotion à transmettre.",
};

export default function GatePage() {
  return (
    /* La porte parle la voix cerise : blanc pur, bordeaux, Playfair.
       Seul le quadrilobe garde sa nuit et sa flamme — c'est ce qui
       distingue les deux produits au premier coup d'oeil. */
    <div className="voix-cerise fond-cerise relative flex min-h-[100dvh] flex-col px-5 pb-6 pt-7 sm:px-6">
      <div className="flex items-center justify-center gap-3">
        <Icone className="size-8" />
        <span className="font-display text-[1.05rem] font-semibold leading-none tracking-[0.3em]">
          ZEVENT
        </span>
      </div>

      <main className="flex flex-1 flex-col items-center justify-center gap-[clamp(1.75rem,4vh,3rem)] py-[clamp(1.5rem,4vh,3rem)]">
        <div className="anim-fade-up grid justify-items-center gap-4 text-center">
          <p className="eyebrow flex items-center gap-3.5 text-gold">
            <span aria-hidden className="inline-block h-px w-9 bg-gold/60" />
            Deux célébrations
            <span aria-hidden className="inline-block h-px w-9 bg-gold/60" />
          </p>
          <h1 className="font-display text-[clamp(2rem,7vw,3.4rem)] leading-[1.06]">
            Que <em className="italic text-burgundy">célébrez-vous</em> ?
          </h1>
        </div>

        <nav
          aria-label="Choisissez votre célébration"
          className="anim-fade grid w-full max-w-[13rem] gap-7 xs:max-w-[40rem] xs:grid-cols-2 xs:gap-[clamp(1.1rem,3vw,2.5rem)]"
        >
          {/* ── Le mariage : l'arche, en bordeaux plein ─────── */}
          <Link href="/mariage" className="group grid justify-items-center gap-3.5 text-center xs:gap-4">
            <span className="arch relative grid aspect-[1/0.82] w-full place-items-center bg-[linear-gradient(158deg,#8e1428_0%,#6b1020_45%,#3d070f_100%)] transition-transform duration-[900ms] ease-silk group-hover:-translate-y-1.5 xs:aspect-square">
              <span
                aria-hidden
                className="absolute inset-[0.5rem] rounded-[inherit] border border-champagne/45 transition-all duration-[900ms] ease-silk group-hover:inset-3 group-hover:border-champagne/80"
              />
              <span className="relative font-sans text-[0.72rem] font-semibold uppercase leading-[1.4] tracking-[0.26em] text-white xs:text-[clamp(0.72rem,2.1vw,0.95rem)]">
                Mariage
              </span>
            </span>
            <span className="grid gap-1.5">
              <b className="font-display text-[1.15rem] font-bold tracking-[-0.01em] xs:text-[1.3rem]">
                Le grand jour
              </b>
              <small className="text-[0.8rem] font-light leading-[1.65] text-ink-soft xs:text-[0.85rem]">
                Musulman ou chrétien.
                <br />
                Dix collections.
              </small>
            </span>
          </Link>

          {/* ── L'anniversaire : le quadrilobe, sa nuit ─────── */}
          <Link href="/anniversaire" className="group grid justify-items-center gap-3.5 text-center xs:gap-4">
            <span className="relative grid aspect-[1/0.82] w-full place-items-center transition-transform duration-[900ms] ease-silk group-hover:-translate-y-1.5 xs:aspect-square">
              <span
                aria-hidden
                className="absolute -inset-2.5 bg-[radial-gradient(60%_50%_at_50%_60%,rgba(233,161,59,.22),transparent_70%)] opacity-0 transition-opacity duration-[900ms] ease-silk group-hover:opacity-100"
              />
              <span className="quatrefoil plate-fete absolute inset-0" />
              <span className="relative font-fete text-[0.72rem] font-bold uppercase leading-[1.4] tracking-[0.18em] text-white xs:text-[clamp(0.72rem,2.1vw,0.95rem)]">
                <span
                  aria-hidden
                  className="mx-auto mb-3 block size-1.5 animate-[zv-breathe_3.4s_var(--ease-silk)_infinite] rounded-full bg-flamme shadow-[0_0_0_5px_rgba(233,161,59,.16)]"
                />
                Anniversaire
              </span>
            </span>
            <span className="grid gap-1.5">
              <b className="font-display text-[1.15rem] font-bold tracking-[-0.01em] xs:text-[1.3rem]">
                La fête
              </b>
              <small className="text-[0.8rem] font-light leading-[1.65] text-ink-soft xs:text-[0.85rem]">
                De un an à cent ans.
                <br />
                Vingt-six collections.
              </small>
            </span>
          </Link>
        </nav>
      </main>

      <footer className="grid justify-items-center gap-4 text-center">
        <div className="rule w-[min(100%,20rem)]" />
        <p className="text-[0.78rem] font-light text-ink-soft">
          Déjà une invitation en cours ?{" "}
          <Link href="/login" className="link-draw inline-flex min-h-11 items-center font-medium text-burgundy">
            Se connecter
          </Link>
        </p>
      </footer>
    </div>
  );
}
