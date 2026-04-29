import JobManagement from "@/components/jobs/job-post-client";

import { Suspense } from "react";
import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get("auth_session")?.value;

  let roles: string[] | null = null;

  if (cookieValue) {
    const decoded = decodeURIComponent(cookieValue);
    const data = JSON.parse(decoded);
    roles = data.roles;
  }
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JobManagement roles={roles as string[]} />
    </Suspense>
  );
}