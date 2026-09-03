"use client";

import { motion } from "motion/react";
import { Plate } from "@/components/ui/plate";
import { listTemplatesFor } from "@/templates/registry";
import { cn } from "@/lib/utils/cn";

/** La croix et le croissant — gravés au trait, comme le reste. */
function Croix({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 40 56" width="34" aria-hidden style={{ color }} fill="none">
      <g stroke="currentColor" strokeWidth="1.1" strokeLinecap="square">
        <path d="M20 3 V53" />
        <path d="M6 19 H34" />
        <circle cx="20" cy="19" r="3.6" opacity=".5" />
      </g>
    </svg>
  );
}

function Croissant({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 48 48" width="38" aria-hidden style={{ color }} fill="none">
      <g stroke="currentColor" strokeWidth="1.1">
        <path d="M31 6 A19 19 0 1 0 31 42 A15 15 0 1 1 31 6 Z" />
        <path d="M38 15 l1.7 4.4 4.4 1.7 -4.4 1.7 -1.7 4.4 -1.7 -4.4 -4.4 -1.7 4.4 -1.7 Z" />
      </g>
    </svg>
  );
}
import type { WeddingType } from "@/types/database";

const TYPES: Array<{
  value: WeddingType;
  name: string;
  description: string;
  from: string;
  to: string;
  Icon: (props: { color: string }) => React.ReactElement;
}> = [
  {
    value: "chretien",
    name: "Mariage chrétien",
    description: "Cérémonie à l’église ou au temple, bénédiction, réception.",
    from: "#F8F0F1",
    to: "#C08D95",
    Icon: Croix,
  },
  {
    value: "musulman",
    name: "Mariage musulman",
    description: "Nikah, dot, henné et réception : le déroulé vous appartient.",
    from: "#E7D3D6",
    to: "#8E1428",
    Icon: Croissant,
  },
];

/* ── Étape 1 : le type de cérémonie ─────────────────────────── */

export function TypeStep({
  value,
  onChange,
}: {
  value: WeddingType | null;
  onChange: (type: WeddingType) => void;
}) {
  return (
    <fieldset>
      <legend className="sr-only">Type de cérémonie</legend>
      <div className="grid max-w-2xl gap-8 sm:grid-cols-2">
        {TYPES.map((type, index) => {
          const selected = value === type.value;
          return (
            <motion.button
              key={type.value}
              type="button"
              onClick={() => onChange(type.value)}
              aria-pressed={selected}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group text-left"
            >
              <div className={cn("relative transition-transform duration-700 ease-silk", selected && "-translate-y-1")}>
                <Plate
                  shape="arch"
                  ratio="aspect-[4/5]"
                  from={type.from}
                  to={type.to}
                  frame={selected}
                  className="transition-transform duration-[1.2s] ease-silk group-hover:scale-[1.02]"
                >
                  <span className="absolute inset-0 grid place-items-center">
                    <type.Icon color={selected ? "#350A13" : "#550812"} />
                  </span>
                </Plate>
              </div>
              <div
                className={cn(
                  "mt-6 border-t pt-4 transition-colors duration-500",
                  selected ? "border-gold" : "border-line group-hover:border-line-strong",
                )}
              >
                <h3 className={cn("font-display text-[1.5rem] leading-none transition-colors", selected && "text-burgundy")}>
                  {type.name}
                </h3>
                <p className="mt-3 text-sm font-light leading-relaxed text-ink-soft">
                  {type.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </fieldset>
  );
}

/* ── Étape 2 : la collection ────────────────────────────────── */

export function TemplateStep({
  weddingType,
  value,
  onChange,
}: {
  weddingType: WeddingType;
  value: string;
  onChange: (id: string) => void;
}) {
  const templates = listTemplatesFor(weddingType);

  return (
    <fieldset>
      <legend className="sr-only">Collection</legend>
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:gap-x-8 lg:grid-cols-4">
        {templates.map((template, index) => {
          const selected = value === template.id;
          return (
            <motion.button
              key={template.id}
              type="button"
              disabled={template.comingSoon}
              onClick={() => onChange(template.id)}
              aria-pressed={selected}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
              className={cn("group text-left", template.comingSoon && "cursor-not-allowed opacity-45")}
            >
              <div className={cn("transition-transform duration-700 ease-silk", selected && "-translate-y-1")}>
                <Plate
                  shape="arch"
                  ratio="aspect-[3/4]"
                  from={template.preview.from}
                  to={template.preview.to}
                  monogram="A & Y"
                  frame={selected}
                  className="transition-transform duration-[1.2s] ease-silk group-hover:scale-[1.02]"
                />
              </div>
              <div
                className={cn(
                  "mt-5 border-t pt-3 transition-colors duration-500",
                  selected ? "border-gold" : "border-line",
                )}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className={cn("font-display text-[1.125rem] leading-none", selected && "text-burgundy")}>
                    {template.name}
                  </h3>
                  {template.comingSoon && <span className="eyebrow-sm text-ink-faint">Bientôt</span>}
                </div>
                <p className="mt-2 text-xs font-light leading-relaxed text-ink-soft">
                  {template.tagline}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </fieldset>
  );
}
