"use client";

import { useRouter } from "next/navigation";
import { Building2, Calendar, ChevronRight } from "lucide-react";
import { Application, ApplicationStatus } from "@/types/application";
import ApplicationStatusBadge from "./application-status-badge";
import ApplicationWithdrawDialog from "./application-withdraw-dialog";

/** Statuses that allow withdrawal */
const WITHDRAWABLE: ApplicationStatus[] = ["DRAFT", "APPLIED", "REVIEWING"];

interface Props {
  application: Application;
  onWithdrawn: () => void;
}

export default function AppliedJobCard({ application, onWithdrawn }: Props) {
  const router = useRouter();
  const canWithdraw = WITHDRAWABLE.includes(application.status);

  const appliedDate = new Date(application.appliedAt).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "short", day: "numeric" }
  );

  return (
    <div className="group relative bg-white rounded-2xl border border-border p-5 flex items-center gap-5 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Company initial avatar */}
      <div className="shrink-0 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
        <Building2 className="h-6 w-6 text-primary" />
      </div>

      {/* Main info — clickable */}
      <button
        className="flex-1 text-left min-w-0"
        onClick={() => router.push(`/applied-jobs/${application.applicationId}`)}
      >
        <p className="font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">
          {application.jobTitle}
        </p>
        <p className="text-sm text-muted-foreground truncate">
          {application.companyName}
        </p>
        <div className="mt-1.5 flex items-center gap-3 flex-wrap">
          <ApplicationStatusBadge status={application.status} />
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            Applied {appliedDate}
          </span>
        </div>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {canWithdraw && (
          <ApplicationWithdrawDialog
            applicationId={application.applicationId}
            jobTitle={application.jobTitle}
            onWithdrawn={onWithdrawn}
            iconOnly
          />
        )}
        <ChevronRight
          className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors cursor-pointer"
          onClick={() =>
            router.push(`/applied-jobs/${application.applicationId}`)
          }
        />
      </div>
    </div>
  );
}
