import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import HrMyApplicationsClient from "./hr-my-applications-client";

export const metadata = {
  title: "My Applications — WorkfitAI Control",
  description: "Applications assigned to you for review",
};

export default async function HrMyApplicationsPage() {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get("auth_session")?.value;

  if (!cookieValue) redirect("/login");

  const session = JSON.parse(decodeURIComponent(cookieValue));
  const roles: string[] = session.roles ?? [];

  if (!roles.includes("ROLE_HR") && !roles.includes("ROLE_HR_MANAGER") && !roles.includes("ROLE_ADMIN")) {
    redirect("/dashboard");
  }

  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-400">Loading…</div>}>
      <HrMyApplicationsClient />
    </Suspense>
  );
}
