import { Suspense } from "react";
import AppliedJobsPageClient from "@/components/applied-jobs/applied-jobs-page-client";

export const metadata = {
  title: "My Applications | WorkfitAI",
  description: "Track and manage all your job applications in one place.",
};

export default function AppliedJobsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-muted-foreground">Loading your applications…</p>
        </div>
      }
    >
      <AppliedJobsPageClient />
    </Suspense>
  );
}
