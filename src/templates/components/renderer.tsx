import { templateCssVars } from "../types";
import { AnnonceSection, CountdownSection, HeroSection } from "./opening";
import { GallerySection, StorySection } from "./story";
import { CeremoniesSection, CoupleSection, FamiliesSection } from "./couple";
import { EnvelopeGate } from "./envelope";
import { ClosingSection, DetailsSection, ProgramSection } from "./practical";
import { MusicPlayer } from "./music-player";
import {
  AlbumSection,
  ClosingFeteSection,
  GalleryFeteSection,
  HeroFeteSection,
  MotFeteSection,
} from "./fete";
import type { SectionId } from "../types";
import type { SectionProps } from "./types";
import type { TemplateDefinition } from "../types";
import type { InvitationWithPhotos } from "@/types/database";

/* Le registre de sections : une seule table de correspondance.
   Ajouter une section = ajouter un identifiant dans SectionId et
   une entrée ici. Aucun template n’a besoin d’être modifié. */
const SECTIONS: Record<SectionId, (props: SectionProps) => React.ReactNode> = {
  hero: HeroSection,
  couple: CoupleSection,
  familles: FamiliesSection,
  ceremonies: CeremoniesSection,
  annonce: AnnonceSection,
  countdown: CountdownSection,
  story: StorySection,
  gallery: GallerySection,
  details: DetailsSection,
  program: ProgramSection,
  closing: ClosingSection,
  /* ── La fête ── */
  heroFete: HeroFeteSection,
  motFete: MotFeteSection,
  album: AlbumSection,
  galleryFete: GalleryFeteSection,
  closingFete: ClosingFeteSection,
};

export function InvitationExperience({
  invitation,
  template,
  withMusic = true,
  compact = false,
  withEnvelope = true,
}: {
  invitation: InvitationWithPhotos;
  template: TemplateDefinition;
  withMusic?: boolean;
  compact?: boolean;
  /** Désactivé dans l’aperçu de l’éditeur : les mariés voient
   *  directement leur page, sans avoir à ouvrir l’enveloppe. */
  withEnvelope?: boolean;
}) {
  const experience = (
    <div
      className="zv-invitation grain relative min-h-dvh bg-[var(--tpl-bg)] text-[var(--tpl-ink)]"
      style={templateCssVars(template) as React.CSSProperties}
    >
      {template.sections.map((section) => {
        const Section = SECTIONS[section.id];
        if (!Section) return null;
        return (
          <div key={section.id}>
            <Section invitation={invitation} template={template} compact={compact} />
          </div>
        );
      })}

      {/* Le lecteur reste accessible : l’invité peut couper le son
          lancé par l’enveloppe, ou le relancer. */}
      {withMusic && invitation.music_url && (
        <MusicPlayer
          url={invitation.music_url}
          startsPlaying={withEnvelope}
          accent={template.colors.accent}
          surface={template.colors.surface}
        />
      )}
    </div>
  );

  /* Le conteneur n'est pose que dans l'apercu. Sur la page publique,
     les unites cqw retombent sur la fenetre — le rendu ne change pas,
     et l'enveloppe reste bien en plein ecran. */
  const framed = (node: React.ReactNode) =>
    compact ? <div className="zv-canvas relative min-h-full">{node}</div> : node;

  if (!withEnvelope || !template.animations.envelope) return framed(experience);

  return framed(
    <EnvelopeGate
      template={template}
      /* Dans l'aperçu, l'enveloppe vit dans son cadre : elle ne doit
         pas bloquer le défilement de la page qui l'entoure. */
      contained={compact}
      age={invitation.celebrant_age}
      brideName={invitation.bride_name ?? invitation.celebrant_name ?? ""}
      groomName={invitation.groom_name ?? ""}
      musicUrl={withMusic ? invitation.music_url : null}
    >
      {experience}
    </EnvelopeGate>,
  );
}
