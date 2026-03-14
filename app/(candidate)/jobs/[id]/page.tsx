import { Suspense } from "react";
import JobDetailPageClient from "@/components/jobs/detail/job-detail-page-client";

export default function JobDetail() {
  return (
    <Suspense fallback={<div>Loading job details...</div>}>
      <JobDetailPageClient />
    </Suspense>
  );
}
