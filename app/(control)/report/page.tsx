import { Suspense } from "react";
import ReportManagementClient from "@/components/report/ReportManagementClient";

export default async function ReportManagementPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReportManagementClient />
    </Suspense>
  );
}