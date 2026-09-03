import { cn } from "@/lib/utils/cn";

export function PageFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto w-full max-w-[74rem] px-6 py-12 sm:px-8 lg:px-14 lg:py-16", className)}>
      {children}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-8 pb-12 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-xl">
        <p className="eyebrow text-gold">{eyebrow}</p>
        <h1 className="mt-5 font-display text-[clamp(2rem,5vw,3.25rem)] leading-[1.04]">{title}</h1>
        {description && (
          <p className="mt-4 max-w-md text-sm font-light leading-relaxed text-ink-soft">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
