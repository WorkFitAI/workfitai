"use client";

import { useState } from "react";
import { useApplications } from "@/hooks/useApplications";
import { ApplicationStatus } from "@/types/application";
import AppliedJobList from "./applied-job-list";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

const STATUS_TABS: { label: string; value: ApplicationStatus | undefined }[] = [
  { label: "All", value: undefined },
  { label: "Applied", value: "APPLIED" },
  { label: "Reviewing", value: "REVIEWING" },
  { label: "Interview", value: "INTERVIEW_SCHEDULED" },
  { label: "Offer", value: "OFFER" },
  { label: "Hired", value: "HIRED" },
  { label: "Rejected", value: "REJECTED" },
];

const PAGE_SIZE = 10;

export default function AppliedJobsPageClient() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<
    ApplicationStatus | undefined
  >(undefined);

  const { applications, totalPages, total, loading, error, refresh } =
    useApplications(page, PAGE_SIZE, statusFilter);

  const handleTabChange = (value: ApplicationStatus | undefined) => {
    setStatusFilter(value);
    setPage(1); // reset to first page on filter change
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          My Applications
        </h1>
        <p className="mt-1 text-muted-foreground">
          {loading
            ? "Loading…"
            : `${total} application${total !== 1 ? "s" : ""} total`}
        </p>
      </div>

      {/* Status filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-3">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => handleTabChange(tab.value)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              statusFilter === tab.value
                ? "bg-primary text-white shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Application list */}
      <AppliedJobList
        applications={applications}
        loading={loading}
        onWithdrawn={refresh}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) setPage((p) => p - 1);
                  }}
                  className={
                    page === 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(p);
                    }}
                    isActive={p === page}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < totalPages) setPage((p) => p + 1);
                  }}
                  className={
                    page === totalPages ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
