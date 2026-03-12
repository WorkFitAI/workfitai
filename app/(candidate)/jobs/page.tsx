import { Suspense } from "react";
import JobsPageClient from "@/components/jobs/jobs-page-client";

export default function JobsPage() {
  return (
    <Suspense fallback={<div>Loading jobs...</div>}>
      <JobsPageClient />
    </Suspense>
  );
}
