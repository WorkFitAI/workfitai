"use client";

import { useRouter } from "next/navigation";
import { Building2, Calendar, ChevronRight } from "lucide-react";
import { Application, ApplicationStatus } from "@/types/application";
import ApplicationStatusBadge from "./application-status-badge";
import ApplicationWithdrawDialog from "./application-withdraw-dialog";

/** Only APPLIED status allows withdrawal */
const WITHDRAWABLE: ApplicationStatus[] = ["APPLIED"];

interface Props {
  application: Application;
  onWithdrawn: () => void;
}

export default function AppliedJobCard({ application, onWithdrawn }: Props) {
  const router = useRouter();
  const canWithdraw = WITHDRAWABLE.includes(application.status);

  // jobTitle and companyName now live inside the embedded jobSnapshot
  const jobTitle = application.jobSnapshot?.title ?? "—";
  const companyName = application.jobSnapshot?.companyName ?? "—";

  const appliedDate = new Date(application.createdAt).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "short", day: "numeric" }
  );

  return (
    <div className="group relative bg-white rounded-2xl border border-border p-5 flex items-center gap-5 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Company logo or fallback avatar */}
      <div className="shrink-0 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
        {application.jobSnapshot?.companyLogoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={application.jobSnapshot.companyLogoUrl}
            alt={companyName}
            className="h-full w-full object-contain p-1"
          />
        ) : (
          <Building2 className="h-6 w-6 text-primary" />
        )}
      </div>

      {/* Main info — clickable */}
      <button
        className="flex-1 text-left min-w-0"
        onClick={() => router.push(`/applied-jobs/${application.id}`)}
      >
        <p className="font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">
          {jobTitle}
        </p>
        <p className="text-sm text-muted-foreground truncate">{companyName}</p>
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
            applicationId={application.id}
            jobTitle={jobTitle}
            onWithdrawn={onWithdrawn}
            iconOnly
          />
        )}
        <ChevronRight
          className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors cursor-pointer"
          onClick={() => router.push(`/applied-jobs/${application.id}`)}
        />
      </div>
    </div>
  );
}
