import { Suspense } from "react";
import MyCVsPageClient from "@/components/my-cvs/my-cvs-page-client";

export const metadata = {
  title: "My CVs | WorkfitAI",
  description: "Upload and manage your curriculum vitae files.",
};

export default function MyCVsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-muted-foreground">Loading your CVs…</p>
        </div>
      }
    >
      <MyCVsPageClient />
    </Suspense>
  );
}
