import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import HrmApplicationsClient from "./hrm-applications-client";
import AdminApplicationsClient from "./admin-applications-client";

export const metadata = {
  title: "Applications — WorkfitAI Control",
  description: "Manage and review all company job applications",
};

export default async function ApplicationsPage() {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get("auth_session")?.value;

  if (!cookieValue) redirect("/login");

  const session = JSON.parse(decodeURIComponent(cookieValue));
  const roles: string[] = session.roles ?? [];

  if (!roles.includes("ROLE_HR_MANAGER") && !roles.includes("ROLE_ADMIN")) {
    if (roles.includes("ROLE_HR")) redirect("/applications/my");
    else redirect("/dashboard");
  }

  const isAdmin = roles.includes("ROLE_ADMIN");

  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-400">Loading…</div>}>
      {isAdmin ? <AdminApplicationsClient /> : <HrmApplicationsClient />}
    </Suspense>
  );
}
