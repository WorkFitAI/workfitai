"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useCompanyApplications, useCompanyHRUsers } from "@/hooks/useHrmApplications";
import { useAssignApplication } from "@/hooks/useApplicationManagement";
import { ApplicationTable, Pagination } from "@/components/hrm/application-table";
import { ApplicationFilters } from "@/components/hrm/application-filters";
import { AssignHRModal } from "@/components/hrm/assign-hr-modal";
import { ApplicationDetailPanel } from "@/components/hrm/application-detail-panel";
import type { Application, ApplicationStatus } from "@/types/application";

const PAGE_SIZE = 20;

export default function HrmApplicationsClient() {
  const { user } = useAuth();
  const companyNo = user?.companyId ?? "";

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "">("");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [assignTarget, setAssignTarget] = useState<{ id: string; currentAssignee: string } | null>(null);

  const { applications, totalPages, total, loading, error, refresh } =
    useCompanyApplications(companyNo, page, PAGE_SIZE, statusFilter || undefined);

  const { hrUsers, loading: hrLoading } = useCompanyHRUsers(companyNo);

  const { assign, assigning, assignError, clearAssignError } = useAssignApplication(() => {
    setAssignTarget(null);
    refresh();
  });

  // Client-side search filter
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return applications;
    const q = searchQuery.toLowerCase();
    return applications.filter(
      (a) =>
        a.username.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.jobSnapshot?.title?.toLowerCase().includes(q),
    );
  }, [applications, searchQuery]);

  const handleStatusChange = (s: ApplicationStatus | "") => {
    setStatusFilter(s);
    setPage(1);
  };

  if (!companyNo) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
        No company associated with your account.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Applications</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            All job applications received by your company
          </p>
        </div>
        <button
          onClick={refresh}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
        {/* Filters */}
        <ApplicationFilters
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          total={filtered.length}
        />
        <ApplicationTable
          applications={filtered}
          loading={loading}
          onViewDetail={(id) => {
            const app = applications.find((a) => a.id === id);
            if (app) setSelectedApp(app);
          }}
          onAssign={(id, currentAssignee) =>
            setAssignTarget({ id, currentAssignee })
          }
          onDownloadCV={(id, fileName) => {
            const app = applications.find((a) => a.id === id);
            if (app) {
              import("@/lib/application/application-service").then(
                ({ applicationService }) => {
                  applicationService.downloadCv(id, fileName).catch(() => {});
                },
              );
            }
          }}
          showAssign
        />
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          onPageChange={setPage}
        />
      </div>

      {/* Application detail slide-over */}
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

      {/* Assign HR modal */}
      {assignTarget && (
        <AssignHRModal
          isOpen
          applicationId={assignTarget.id}
          currentAssignee={assignTarget.currentAssignee}
          hrUsers={hrUsers}
          loadingHRUsers={hrLoading}
          assigning={assigning}
          error={assignError}
          onAssign={assign}
          onClose={() => {
            clearAssignError();
            setAssignTarget(null);
          }}
        />
      )}
    </div>
  );
}
