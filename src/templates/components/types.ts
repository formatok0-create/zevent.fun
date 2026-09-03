import type { InvitationWithPhotos } from "@/types/database";
import type { TemplateDefinition } from "../types";

/** Contrat unique de toutes les sections d’invitation.
 *  Une section ne connaît jamais un template en particulier :
 *  elle lit la définition qu’on lui passe. */
export interface SectionProps {
  invitation: InvitationWithPhotos;
  template: TemplateDefinition;
  /** Aperçu intégré à l’éditeur : le hero n’occupe pas tout l’écran. */
  compact?: boolean;
}
