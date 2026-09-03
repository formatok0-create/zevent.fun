import { Plate } from "./plate";
import { cn } from "@/lib/utils/cn";

/** Un écran vide est une invitation à agir, jamais un « aucune donnée ». */
export function EmptyState({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid items-center gap-12 border-t border-line pt-14 md:grid-cols-[minmax(0,15rem)_1fr] md:gap-16", className)}>
      <Plate shape="arch" ratio="aspect-[3/4]" monogram="&" from="#F6EEE3" to="#E4D2BC" frame />
      <div className="max-w-md">
        {eyebrow && <p className="eyebrow mb-5 text-gold">{eyebrow}</p>}
        <h2 className="font-display text-[clamp(2rem,5vw,3rem)] leading-[1.05]">{title}</h2>
        <p className="mt-5 text-sm font-light leading-relaxed text-ink-soft">{description}</p>
        {action && <div className="mt-9">{action}</div>}
      </div>
    </div>
  );
}
