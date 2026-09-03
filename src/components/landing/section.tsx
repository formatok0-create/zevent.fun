import { cn } from "@/lib/utils/cn";
import { DrawnRule } from "@/components/motion/reveal";

/** Toutes les sections de la landing partagent le même cadrage :
 *  un filet, un intitulé en capitales, de l’air. */
export function Section({
  id,
  eyebrow,
  className,
  children,
}: {
  id?: string;
  eyebrow?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("scroll-mt-24 py-24 sm:py-32", className)}>
      <div className="shell">
        <DrawnRule />
        {eyebrow && <p className="eyebrow mt-6 text-gold">{eyebrow}</p>}
        <div className={eyebrow ? "mt-12 sm:mt-16" : "mt-12"}>{children}</div>
      </div>
    </section>
  );
}
