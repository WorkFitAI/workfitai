"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useAssignedApplications } from "@/hooks/useHrmApplications";
import { ApplicationTable, Pagination } from "@/components/hrm/application-table";
import { ApplicationFilters } from "@/components/hrm/application-filters";
import { ApplicationDetailPanel } from "@/components/hrm/application-detail-panel";
import type { Application, ApplicationStatus } from "@/types/application";

const PAGE_SIZE = 20;

export default function HrMyApplicationsClient() {
  const { user } = useAuth();
  const hrUsername = user?.username ?? "";

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "">("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const { applications, totalPages, total, loading, error, refresh } =
    useAssignedApplications(hrUsername, page, PAGE_SIZE);

  const filtered = useMemo(() => {
    let list = statusFilter
      ? applications.filter((a) => a.status === statusFilter)
      : applications;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.username.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.jobSnapshot?.title?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [applications, statusFilter, searchQuery]);

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">My Assigned Applications</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Applications assigned to you for review
          </p>
        </div>
        <button
          onClick={refresh}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <ApplicationFilters
          statusFilter={statusFilter}
          onStatusChange={(s) => {
            setStatusFilter(s);
            setPage(1);
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          total={filtered.length}
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-4">
        <ApplicationTable
          applications={filtered}
          loading={loading}
          onViewDetail={(id) => {
            const app = applications.find((a) => a.id === id);
            if (app) setSelectedApp(app);
          }}
          onDownloadCV={(id, fileName) => {
            import("@/lib/application/application-service").then(({ applicationService }) => {
              applicationService.downloadCv(id, fileName).catch(() => {});
            });
          }}
          showAssign={false}
        />
        <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
      </div>

      {selectedApp && user && (
        <ApplicationDetailPanel
          application={selectedApp}
          currentUsername={user.username}
          onClose={() => setSelectedApp(null)}
          onRefresh={() => {
            setSelectedApp(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}
