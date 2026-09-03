import { cn } from "@/lib/utils/cn";

/** Cadre téléphone : l’invitation sera lue là, entre deux messages. */
export function Phone({
  children,
  className,
  tone = "ivory",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "ivory" | "ink";
}) {
  return (
    <div
      className={cn(
        "relative aspect-[9/19] w-full rounded-[2.25rem] p-[6px]",
        tone === "ink" ? "bg-noir" : "bg-ink/85",
        className,
      )}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[1.9rem] bg-ivory">
        {children}
      </div>
      <span
        aria-hidden
        className="absolute left-1/2 top-[10px] h-[3px] w-10 -translate-x-1/2 rounded-full bg-ivory/25"
      />
    </div>
  );
}
