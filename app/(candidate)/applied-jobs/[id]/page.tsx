import { Suspense } from "react";
import ApplicationDetailClient from "@/components/applied-jobs/application-detail-client";

export const metadata = {
  title: "Application Detail | WorkfitAI",
  description: "View your job application details and status history.",
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ApplicationDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-muted-foreground">Loading application…</p>
        </div>
      }
    >
      <ApplicationDetailClient applicationId={id} />
    </Suspense>
  );
}
