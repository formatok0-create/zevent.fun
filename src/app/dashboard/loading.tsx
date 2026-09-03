import { PageFrame } from "@/components/dashboard/page-frame";
import { Skeleton, InvitationGridSkeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <PageFrame>
      <div className="pb-16">
        <Skeleton className="h-2 w-32" />
        <Skeleton className="mt-6 h-12 w-full max-w-lg" />
        <Skeleton className="mt-4 h-12 w-full max-w-sm" />
      </div>
      <InvitationGridSkeleton count={3} />
    </PageFrame>
  );
}
