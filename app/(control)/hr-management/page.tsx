import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import HrManagementClient from "./hr-management-client";

export const metadata = {
  title: "HR Management — WorkfitAI Control",
  description: "Manage and approve HR members in your company",
};

export default async function HrManagementPage() {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get("auth_session")?.value;

  if (!cookieValue) redirect("/login");

  const session = JSON.parse(decodeURIComponent(cookieValue));
  const roles: string[] = session.roles ?? [];

  // HR_MANAGER and ADMIN can view; HR cannot
  if (
    !roles.includes("ROLE_HR_MANAGER") &&
    !roles.includes("ROLE_ADMIN")
  ) {
    redirect("/dashboard");
  }

  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-400">Loading…</div>}>
      <HrManagementClient />
    </Suspense>
  );
}
