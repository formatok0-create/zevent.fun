import { cn } from "@/lib/utils/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-xs", className)} />;
}

/** Squelette d’une invitation : reprend exactement la composition
 *  de la carte réelle pour qu’aucun saut ne se produise. */
export function InvitationCardSkeleton() {
  return (
    <div className="border-t border-line pt-6">
      <Skeleton className="arch aspect-[4/5] w-full" />
      <div className="mt-6 space-y-3">
        <Skeleton className="h-2 w-16" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-2 w-1/3" />
      </div>
    </div>
  );
}

export function InvitationGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <InvitationCardSkeleton key={i} />
      ))}
    </div>
  );
}
