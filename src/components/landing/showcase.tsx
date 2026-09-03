import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { TemplateCover } from "@/templates/components/cover";
import { demoWeddingInvitation } from "@/lib/demo/mariage";
import { listTemplates } from "@/templates/registry";
import { Section } from "./section";

const CATEGORY_LABEL: Record<string, string> = {
  editorial: "Éditorial",
  romantique: "Romantique",
  minimal: "Minimal",
  traditionnel: "Traditionnel",
  moderne: "Moderne",
  oriental: "Oriental",
};

const TYPE_LABEL: Record<string, string> = { chretien: "Chrétien", musulman: "Musulman" };

/** Les collections viennent du registre : ajouter un template ici
 *  ne demande aucune modification de cette section. */
export function Showcase() {
  const templates = listTemplates();

  return (
    <Section id="collections" eyebrow="Les collections">
      <div className="grid gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <h2 className="font-display text-[clamp(2.2rem,5vw,3.5rem)] leading-[1.05]">
            Quatre écritures,
            <br />
            <span className="italic">une même exigence.</span>
          </h2>
          <p className="mt-6 max-w-sm text-sm font-light leading-[1.85] text-ink-soft">
            Chaque collection possède ses couleurs, ses typographies et son rythme de lecture.
            Vous choisissez une écriture, nous nous occupons du reste.
          </p>

          <div className="mt-12 max-w-sm border-t border-line pt-5">
            <p className="eyebrow-sm text-ink-faint">
              De nouvelles collections sont ajoutées chaque saison
            </p>
          </div>
        </Reveal>

        <Stagger className="lg:col-span-7" stagger={0.1}>
          {/* Deux colonnes des le plus petit ecran, trois a partir de md :
                les vignettes cessent d'occuper toute la largeur. */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 md:grid-cols-3 xl:grid-cols-4">
            {templates.map((template) => (
              <StaggerItem key={template.id}>
                <article className="group">
                  <div className="overflow-hidden">
                    <TemplateCover
                      template={template}
                      invitation={demoWeddingInvitation(template.id, template.supportedWeddingTypes[0])}
                      shape="arch"
                      className="transition-transform duration-[1.2s] ease-silk group-hover:scale-[1.03]"
                    />
                  </div>
                  {/* Le nom et la catégorie sur deux lignes : côte à côte,
                      ils se chevauchaient dès que le nom dépassait un mot. */}
                  <div className="mt-4 border-t border-line pt-3.5">
                    <h3 className="font-display text-[1rem] leading-tight sm:text-[1.15rem]">
                      {template.name}
                    </h3>
                    <p className="eyebrow-sm mt-1.5 text-ink-faint">
                      {CATEGORY_LABEL[template.category] ?? template.category}
                    </p>
                  </div>
                  <p className="mt-2.5 text-xs font-light leading-relaxed text-ink-soft">
                    {template.tagline}
                  </p>
                  <p className="eyebrow-sm mt-2.5 text-gold">
                    {template.supportedWeddingTypes.map((t) => TYPE_LABEL[t]).join(" · ")}
                  </p>
                </article>
              </StaggerItem>
            ))}
          </div>
        </Stagger>
      </div>
    </Section>
  );
}
