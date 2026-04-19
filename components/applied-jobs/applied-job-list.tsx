import { Application } from "@/types/application";
import AppliedJobCard from "./applied-job-card";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  applications: Application[];
  loading: boolean;
  onWithdrawn: () => void;
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-border p-5 flex items-center gap-5">
      <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </div>
  );
}

export default function AppliedJobList({
  applications,
  loading,
  onWithdrawn,
}: Props) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!applications?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <span className="text-3xl">📋</span>
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          No applications found
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Applications you submit will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {applications.map((app) => (
        <AppliedJobCard
          key={app.applicationId}
          application={app}
          onWithdrawn={onWithdrawn}
        />
      ))}
    </div>
  );
}
