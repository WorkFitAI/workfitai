import JobManagement from "@/components/jobs/job-post-client";

import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JobManagement />
    </Suspense>
  );
}