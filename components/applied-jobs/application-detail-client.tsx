"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Download,
  ExternalLink,
  MapPin,
  DollarSign,
  Clock,
  FileText,
  GraduationCap,
  Star,
} from "lucide-react";
import { useApplicationDetail } from "@/hooks/useApplicationDetail";
import ApplicationStatusBadge from "./application-status-badge";
import ApplicationWithdrawDialog from "./application-withdraw-dialog";
import { ApplicationStatus } from "@/types/application";
import { Skeleton } from "@/components/ui/skeleton";
import { applicationService } from "@/lib/application/application-service";

/** Only APPLIED status allows withdrawal */
const WITHDRAWABLE: ApplicationStatus[] = ["APPLIED"];

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
  const { application, statusHistory, loading, error } =
    useApplicationDetail(applicationId);
  const [cvDownloading, setCvDownloading] = useState(false);
  const [cvError, setCvError] = useState<string | null>(null);

  const handleDownloadCv = async () => {
    if (!application) return;
    setCvDownloading(true);
    setCvError(null);
    try {
      await applicationService.downloadCv(
        application.id,
        application.cvFileName,
      );
    } catch {
      setCvError("Download failed. Please try again.");
    } finally {
      setCvDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-10">
        <DetailSkeleton />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-10 text-center">
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
  const snap = application.jobSnapshot;

  const appliedDate = new Date(application.createdAt).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  const jobTitle = snap?.title ?? "—";
  const companyName = snap?.companyName ?? "—";

  const salaryLabel =
    snap?.salaryMin && snap?.salaryMax
      ? `${snap.salaryMin.toLocaleString()} – ${snap.salaryMax.toLocaleString()} ${snap.currency ?? "USD"}`
      : "—";

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      {/* Back link */}
      <Link
        href="/applied-jobs"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Applications
      </Link>

      {/* ── Header card — clean white with accent ── */}
      <div className="mb-6 rounded-2xl border border-border bg-white shadow-sm overflow-hidden flex">
        {/* Left accent stripe */}
        <div className="w-1.5 shrink-0 bg-blue-500 rounded-l-2xl" />

        <div className="flex-1 px-6 py-5 flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            {/* Company logo */}
            <div className="shrink-0 h-14 w-14 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center overflow-hidden">
              {snap?.companyLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={snap.companyLogoUrl}
                  alt={companyName}
                  className="h-full w-full object-contain p-1"
                />
              ) : (
                <Building2 className="h-7 w-7 text-blue-400" />
              )}
            </div>

            <div>
              {/* Job title → link to job detail page */}
              {snap?.postId ? (
                <Link
                  href={`/jobs/${snap.postId}`}
                  className="group inline-flex items-center gap-1.5 text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
                >
                  {jobTitle}
                  <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-60 transition-opacity" />
                </Link>
              ) : (
                <h1 className="text-2xl font-bold text-gray-900">{jobTitle}</h1>
              )}
              <p className="mt-0.5 text-gray-500 flex items-center gap-1.5 text-sm">
                <Building2 className="h-4 w-4 text-gray-400" />
                {companyName}
                {snap?.companyAddress && (
                  <span className="text-gray-400">· {snap.companyAddress}</span>
                )}
              </p>
              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <ApplicationStatusBadge status={application.status} />
                <span className="text-xs text-gray-400">
                  Applied {appliedDate}
                </span>
                {/* CV filename + download button */}
                {application.cvFileName && (
                  <button
                    onClick={handleDownloadCv}
                    disabled={cvDownloading}
                    title="Download CV"
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    {application.cvFileName}
                    <Download className="h-3 w-3 ml-0.5" />
                  </button>
                )}
                {cvError && (
                  <span className="text-xs text-red-500">{cvError}</span>
                )}
              </div>
            </div>
          </div>

          {canWithdraw && (
            <ApplicationWithdrawDialog
              applicationId={application.id}
              jobTitle={jobTitle}
            />
          )}
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="flex gap-6 items-start">
        {/* ── LEFT: main content ── */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Job snapshot grid */}
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-foreground">
              Job Details
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <InfoTile
                icon={<Briefcase className="h-4 w-4 text-primary" />}
                label="Employment Type"
                value={snap?.employmentType?.replace("_", " ") ?? "—"}
              />
              <InfoTile
                icon={<MapPin className="h-4 w-4 text-primary" />}
                label="Location"
                value={snap?.location ?? "—"}
              />
              <InfoTile
                icon={<DollarSign className="h-4 w-4 text-primary" />}
                label="Salary Range"
                value={salaryLabel}
              />
              <InfoTile
                icon={<Star className="h-4 w-4 text-primary" />}
                label="Experience Level"
                value={snap?.experienceLevel ?? "—"}
              />
              <InfoTile
                icon={<GraduationCap className="h-4 w-4 text-primary" />}
                label="Required Experience"
                value={snap?.requiredExperience ?? "—"}
              />
              <InfoTile
                icon={<Building2 className="h-4 w-4 text-primary" />}
                label="Company"
                value={companyName}
              />
            </div>

            {/* Required skills */}
            {snap?.skillNames && snap.skillNames.length > 0 && (
              <div className="mt-5">
                <h3 className="mb-2 text-sm font-medium text-foreground">
                  Required Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {snap.skillNames.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Job description */}
            {snap?.description && (
              <div className="mt-5">
                <h3 className="mb-2 text-sm font-medium text-foreground">
                  Job Description
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-6 whitespace-pre-line">
                  {snap.description}
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

        {/* ── RIGHT: status history sidebar ── */}
        <div className="w-72 shrink-0">
          <div className="rounded-2xl border border-border bg-white p-5 shadow-sm sticky top-6">
            <div className="flex items-center gap-2 mb-5">
              <Clock className="h-4 w-4 text-primary" />
              <h2 className="text-base font-semibold text-foreground">
                Status History
              </h2>
              {statusHistory.length > 0 && (
                <span className="ml-auto text-xs font-medium bg-primary/10 text-primary rounded-full px-2 py-0.5">
                  {statusHistory.length}
                </span>
              )}
            </div>
            {statusHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No status changes yet.
              </p>
            ) : (
              <ol className="relative border-l border-border pl-5 space-y-5">
                {statusHistory.map((item, idx) => (
                  <li key={idx} className="relative">
                    {/* Timeline dot */}
                    <span className="absolute -left-5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-primary bg-white">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <ApplicationStatusBadge status={item.newStatus} />
                      </div>
                      {item.previousStatus && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          from{" "}
                          <ApplicationStatusBadge
                            status={item.previousStatus}
                            className="text-xs"
                          />
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(item.changedAt).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                        {" · "}by {item.changedBy}
                      </p>
                      {item.reason && (
                        <p className="mt-1.5 text-xs text-foreground italic">
                          &ldquo;{item.reason}&rdquo;
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
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
