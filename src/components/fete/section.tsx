import { cn } from "@/lib/utils/cn";
import { DrawnRule } from "@/components/motion/reveal";

/** Même cadrage que le mariage — filet, intitulé, de l’air — mais
 *  l’intitulé est à la flamme, pas à l’or. */
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
        {eyebrow && <p className="eyebrow mt-6 text-flamme">{eyebrow}</p>}
        <div className={eyebrow ? "mt-12 sm:mt-16" : "mt-12"}>{children}</div>
      </div>
    </section>
  );
}

/** L’âge, dans le quadrilobe. La signature du produit fête. */
export function AgePlate({
  age,
  className,
  ratio = "aspect-square",
}: {
  age: string;
  className?: string;
  ratio?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <span
        aria-hidden
        className="absolute -inset-4 bg-[radial-gradient(60%_50%_at_50%_62%,rgba(233,161,59,.2),transparent_70%)]"
      />
      <div className={cn("quatrefoil plate-fete relative grid w-full place-items-center", ratio)}>
        <span className="font-fete text-[clamp(3.5rem,13vw,7rem)] font-semibold leading-none tracking-[-0.03em] text-ivory">
          {age}
        </span>
      </div>
    </div>
  );
}
