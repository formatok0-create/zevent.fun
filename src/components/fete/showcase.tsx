import Link from "next/link";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { TemplateCover } from "@/templates/components/cover";
import { demoBirthdayInvitation } from "@/lib/demo/fete";
import { listTemplatesForProduct } from "@/templates/registry";
import { Section } from "./section";

export function Showcase() {
  /* La vitrine ne montre pas les dix-sept : elle donne un aperçu,
     une par tranche et par public. */
  const collections = listTemplatesForProduct("anniversaire").filter((t) =>
    ["royaume", "licorne", "arene", "perle", "bitume", "velours-rose", "smoking", "rubis"].includes(t.id),
  );

  return (
    <Section id="collections" eyebrow="Les collections">
      <div className="grid gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <h2 className="font-fete font-bold tracking-[-0.02em] text-[clamp(2.2rem,5vw,3.5rem)] leading-[1.05]">
            Vingt-six écritures,
            <br />
            <span className="italic">une même exigence.</span>
          </h2>
          <p className="mt-6 max-w-sm text-sm font-light leading-[1.85] text-ink-soft">
            Chaque collection possède ses couleurs, ses typographies et son rythme de lecture.
            Vous choisissez une écriture, nous nous occupons du reste.
          </p>

          <div className="mt-12 max-w-sm border-t border-line pt-5">
            <p className="eyebrow-sm text-ink-faint">
  Vingt-six collections, de 1 an à l’âge adulte
            </p>
          </div>
        </Reveal>

        <Stagger className="lg:col-span-7" stagger={0.1}>
          {/* Deux colonnes des le plus petit ecran, trois a partir de md :
                les vignettes cessent d'occuper toute la largeur. */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 md:grid-cols-3 xl:grid-cols-4">
            {collections.map((collection) => (
              <StaggerItem key={collection.id}>
                <Link href={`/anniversaire/apercu/${collection.id}`} className="group block">
                  <TemplateCover
                    template={collection}
                    invitation={demoBirthdayInvitation(collection.id, collection.audience)}
                    shape="quatrefoil"
                    className="transition-transform duration-[1.2s] ease-silk group-hover:scale-[1.03]"
                  />
                  <div className="mt-4 border-t border-line pt-3.5">
                    <h3 className="font-fete text-[1rem] font-semibold leading-tight sm:text-[1.15rem]">
                      {collection.name}
                    </h3>
                    <p className="eyebrow-sm mt-1.5 text-ink-faint">{collection.ageRange}</p>
                  </div>
                  <p className="mt-2.5 text-xs font-light leading-relaxed text-ink-soft">
                    {collection.tagline}
                  </p>
                  <span className="mt-3.5 inline-flex rounded-full bg-flamme px-4 py-1.5 font-fete text-[0.78rem] font-bold text-nuit-fete transition-colors duration-500 ease-silk group-hover:bg-nuit-fete group-hover:text-flamme">
                    Voir l’aperçu
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </div>
        </Stagger>
      </div>
    </Section>
  );
}
