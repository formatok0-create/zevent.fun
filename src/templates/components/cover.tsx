"use client";

import { useEffect, useRef, useState } from "react";
import { HeroSection } from "./opening";
import { HeroFeteSection } from "./fete";
import { templateCssVars } from "../types";
import { cn } from "@/lib/utils/cn";
import type { TemplateDefinition } from "../types";
import type { InvitationWithPhotos } from "@/types/database";

/* ═══════════════════════════════════════════════════════════════
   LA VIGNETTE D'UNE COLLECTION
   Une plaque dégradée ne dit rien de ce qu'on achète. On montre donc
   la vraie première page de l'invitation : ses couleurs, sa
   typographie, sa mise en page.

   Elle n'est pas rendue à la taille de la vignette. Les sections ont
   un plancher de taille de texte — à 150 px de large, « Yassine » se
   coupait en deux et débordait de l'arche. On la rend donc à 360 px,
   la largeur d'un téléphone, puis on la réduit d'un bloc. Ce que l'on
   voit est exactement ce que verra l'invité, en plus petit.
   ═══════════════════════════════════════════════════════════════ */

const LARGEUR_BASE = 360;
const RATIOS = { arch: 4 / 3, quatrefoil: 1 } as const;

/* L'arche epouse la page : le hero du mariage porte deja une arche.
   Le quadrilobe non — le carton blanc de la fete a des bords droits
   qui tranchaient les lobes. On rentre donc la page a l'interieur de
   la forme, et le fond de la collection remplit le tour. */
const MARGES = { arch: 1, quatrefoil: 0.76 } as const;

export function TemplateCover({
  template,
  invitation,
  shape,
  className,
}: {
  template: TemplateDefinition;
  invitation: InvitationWithPhotos;
  shape: "arch" | "quatrefoil";
  className?: string;
}) {
  const Section = shape === "quatrefoil" ? HeroFeteSection : HeroSection;
  const boite = useRef<HTMLDivElement>(null);
  const [echelle, setEchelle] = useState(0);

  useEffect(() => {
    const el = boite.current;
    if (!el) return;
    const observateur = new ResizeObserver(([entree]) => {
      setEchelle(entree.contentRect.width / LARGEUR_BASE);
    });
    observateur.observe(el);
    return () => observateur.disconnect();
  }, []);

  return (
    <div
      ref={boite}
      aria-hidden
      className={cn(
        "relative overflow-hidden",
        /* Le tour de la page prend le degrade de la collection : sur
           un quadrilobe, c'est lui qu'on voit dans les lobes. */
        "bg-[linear-gradient(168deg,var(--tpl-plate-from),var(--tpl-plate-to))]",
        shape === "quatrefoil" ? "quatrefoil aspect-square" : "arch aspect-[3/4]",
        className,
      )}
      style={templateCssVars(template) as React.CSSProperties}
    >
      {/* Décorative : le lien de la carte porte déjà l'intitulé, et
          rien ici ne doit intercepter le doigt. */}
      <div
        className="zv-vignette pointer-events-none absolute left-1/2 top-1/2 text-[var(--tpl-ink)] transition-opacity duration-500"
        style={{
          width: LARGEUR_BASE,
          height: LARGEUR_BASE * RATIOS[shape],
          transform: `translate(-50%, -50%) scale(${echelle * MARGES[shape]})`,
          /* Tant que la mesure n'est pas faite, on ne montre rien :
             sinon la page apparaît un instant à taille réelle. */
          opacity: echelle ? 1 : 0,
        }}
      >
        <div className="zv-canvas h-full">
          <Section invitation={invitation} template={template} compact />
        </div>
      </div>
    </div>
  );
}
