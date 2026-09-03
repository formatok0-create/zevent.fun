import { cn } from "@/lib/utils/cn";
import type { InvitationStatus } from "@/types/database";

const STATUS: Record<InvitationStatus, { label: string; className: string }> = {
  draft: { label: "Brouillon", className: "border-line-strong text-ink-soft" },
  published: { label: "En ligne", className: "border-success/40 text-success" },
  unpublished: { label: "Hors ligne", className: "border-brown/35 text-brown" },
};

export function StatusBadge({ status, className }: { status: InvitationStatus; className?: string }) {
  const tone = STATUS[status];
  return (
    <span
      className={cn(
        "eyebrow-sm inline-flex items-center gap-2 rounded-xs border px-2.5 py-1",
        tone.className,
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-1 rounded-full bg-current",
          status === "published" && "animate-[zv-breathe_2.6s_ease-in-out_infinite]",
        )}
      />
      {tone.label}
    </span>
  );
}

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("eyebrow-sm inline-flex items-center rounded-xs border border-line-strong px-2.5 py-1 text-ink-soft", className)}>
      {children}
    </span>
  );
}
