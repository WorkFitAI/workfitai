"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  MessageSquare,
  Clock,
  FileText,
} from "lucide-react";
import { useApplicationDetail } from "@/hooks/useApplicationDetail";
import ApplicationStatusBadge from "./application-status-badge";
import ApplicationWithdrawDialog from "./application-withdraw-dialog";
import { ApplicationStatus } from "@/types/application";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Statuses that allow withdrawal */
const WITHDRAWABLE: ApplicationStatus[] = ["DRAFT", "APPLIED", "REVIEWING"];

type Tab = "overview" | "history" | "notes";

interface Props {
  applicationId: string;
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-5 w-40" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function ApplicationDetailClient({ applicationId }: Props) {
  const { application, statusHistory, notes, loading, error } =
    useApplicationDetail(applicationId);
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-10">
        <DetailSkeleton />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-10 text-center">
        <p className="text-muted-foreground">
          {error ?? "Application not found."}
        </p>
        <Link
          href="/applied-jobs"
          className="mt-4 inline-block text-sm text-primary hover:underline"
        >
          ← Back to My Applications
        </Link>
      </div>
    );
  }

  const canWithdraw = WITHDRAWABLE.includes(application.status);

  const appliedDate = new Date(application.appliedAt).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    {
      key: "overview",
      label: "Overview",
      icon: <Briefcase className="h-4 w-4" />,
    },
    {
      key: "history",
      label: `Status History (${statusHistory.length})`,
      icon: <Clock className="h-4 w-4" />,
    },
    {
      key: "notes",
      label: `HR Notes (${notes.length})`,
      icon: <MessageSquare className="h-4 w-4" />,
    },
  ];

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      {/* Back link */}
      <Link
        href="/applied-jobs"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Applications
      </Link>

      {/* Header card */}
      <div className="mb-6 rounded-2xl border border-border bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {application.jobTitle}
            </h1>
            <p className="mt-0.5 text-muted-foreground flex items-center gap-1.5">
              <Building2 className="h-4 w-4" />
              {application.companyName}
            </p>
            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <ApplicationStatusBadge status={application.status} />
              <span className="text-xs text-muted-foreground">
                Applied {appliedDate}
              </span>
              {application.cvFileName && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" />
                  {application.cvFileName}
                </span>
              )}
            </div>
          </div>

          {canWithdraw && (
            <ApplicationWithdrawDialog
              applicationId={application.applicationId}
              jobTitle={application.jobTitle}
            />
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-xl border border-border bg-muted p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
              activeTab === tab.key
                ? "bg-white shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="space-y-5">
          {/* Job snapshot */}
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-foreground">
              Job Details
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <InfoTile
                icon={<Briefcase className="h-4 w-4 text-primary" />}
                label="Employment Type"
                value={application.jobSnapshot?.employmentType ?? "—"}
              />
              <InfoTile
                icon={<MapPin className="h-4 w-4 text-primary" />}
                label="Location"
                value={application.jobSnapshot?.location ?? "—"}
              />
              <InfoTile
                icon={<DollarSign className="h-4 w-4 text-primary" />}
                label="Salary Range"
                value={
                  application.jobSnapshot?.salaryMin &&
                  application.jobSnapshot?.salaryMax
                    ? `$${application.jobSnapshot.salaryMin.toLocaleString()} – $${application.jobSnapshot.salaryMax.toLocaleString()}`
                    : "—"
                }
              />
              <InfoTile
                icon={<Building2 className="h-4 w-4 text-primary" />}
                label="Company"
                value={application.jobSnapshot?.companyName ?? "—"}
              />
            </div>

            {application.jobSnapshot?.description && (
              <div className="mt-5">
                <h3 className="mb-2 text-sm font-medium text-foreground">
                  Job Description
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-6">
                  {application.jobSnapshot.description}
                </p>
              </div>
            )}
          </div>

          {/* Cover letter */}
          {application.coverLetter && (
            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-base font-semibold text-foreground">
                Your Cover Letter
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {application.coverLetter}
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "history" && (
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-base font-semibold text-foreground">
            Status History
          </h2>
          {statusHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No status changes yet.
            </p>
          ) : (
            <ol className="relative border-l border-border pl-6 space-y-6">
              {statusHistory.map((item, idx) => (
                <li key={idx} className="relative">
                  {/* Timeline dot */}
                  <span className="absolute -left-6 flex h-4 w-4 items-center justify-center rounded-full border-2 border-primary bg-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <ApplicationStatusBadge status={item.newStatus} />
                      {item.previousStatus && (
                        <span className="text-xs text-muted-foreground">
                          from{" "}
                          <ApplicationStatusBadge
                            status={item.previousStatus}
                            className="text-xs"
                          />
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(item.changedAt).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}{" "}
                      · by {item.changedBy}
                    </p>
                    {item.reason && (
                      <p className="mt-1.5 text-sm text-foreground italic">
                        &ldquo;{item.reason}&rdquo;
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {activeTab === "notes" && (
        <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-base font-semibold text-foreground">
            Messages from HR
          </h2>
          {notes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No messages from the hiring team yet.
            </p>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-xl border border-border bg-muted/40 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                      {note.author}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(note.createdAt).toLocaleDateString("en-US", {
                        dateStyle: "medium",
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {note.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Small info tile for grid layout */
function InfoTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-3">
      <div className="mb-1.5 flex items-center gap-1.5">
        {icon}
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="text-sm font-semibold text-foreground truncate">{value}</p>
    </div>
  );
}
