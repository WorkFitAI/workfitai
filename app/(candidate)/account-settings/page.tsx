import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import AccountSettingsPageClient from "@/components/account-settings/account-settings-page-client";

export const metadata = {
  title: "Account Settings | WorkfitAI",
  description: "Manage your profile, notifications, and privacy settings.",
};

function AccountSettingsSkeleton() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <Skeleton className="h-9 w-56 mb-2" />
      <Skeleton className="h-5 w-80 mb-8" />
      <div className="flex gap-8">
        <div className="w-52 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-xl" />
          ))}
        </div>
        <div className="flex-1 rounded-2xl border border-border p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function AccountSettingsPage() {
  return (
    <Suspense fallback={<AccountSettingsSkeleton />}>
      <AccountSettingsPageClient />
    </Suspense>
  );
}
