"use client";

import { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useAdminApplications,
  useAdminDeleteApplication,
  useAdminRestoreApplication,
} from "@/hooks/useAdminApplications";
import { ApplicationTable, Pagination, StatusBadge } from "@/components/hrm/application-table";
import { ApplicationDetailPanel } from "@/components/hrm/application-detail-panel";
import { applicationService } from "@/lib/application/application-service";
import type { Application, ApplicationStatus } from "@/types/application";

const STATUS_OPTIONS: ApplicationStatus[] = [
  "APPLIED", "REVIEWING", "INTERVIEW", "OFFER", "HIRED", "REJECTED", "WITHDRAWN",
];

const PAGE_SIZE = 50;

export default function AdminApplicationsClient() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "">("");
  const [companyIdFilter, setCompanyIdFilter] = useState("");
  const [usernameFilter, setUsernameFilter] = useState("");
  const [jobTitleFilter, setJobTitleFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const debouncedKeyword = useDebounce(searchQuery, 400);
  const debouncedJobTitle = useDebounce(jobTitleFilter, 400);
  const debouncedUsername = useDebounce(usernameFilter, 400);
  const debouncedCompanyId = useDebounce(companyIdFilter, 400);

  const { applications, totalPages, total, loading, error, refresh } = useAdminApplications(
    page,
    PAGE_SIZE,
    statusFilter || undefined,
    debouncedCompanyId || undefined,
    debouncedUsername || undefined,
    debouncedJobTitle || undefined,
    debouncedKeyword || undefined,
  );

  const { deleteApplication, deleting, deleteError, clearDeleteError } = useAdminDeleteApplication(
    () => { setConfirmDeleteId(null); setDeleteReason(""); refresh(); },
  );

  const { restoreApplication, restoring, restoreError } = useAdminRestoreApplication(refresh);

  const handleDelete = (id: string) => {
    setConfirmDeleteId(id);
    clearDeleteError();
  };

  const confirmDelete = () => {
    if (confirmDeleteId) deleteApplication(confirmDeleteId, deleteReason || undefined);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">All Applications</h1>
          <p className="text-sm text-gray-500 mt-0.5">Platform-wide view — all companies and candidates</p>
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

      {/* Error banners */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {deleteError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{deleteError}</div>
      )}
      {restoreError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{restoreError}</div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
          {/* Keyword search */}
          <div className="relative flex-1 min-w-48">
            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search candidate or job…"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-4 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Job title filter */}
          <input
            type="text"
            placeholder="Job title…"
            value={jobTitleFilter}
            onChange={(e) => { setJobTitleFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-40"
          />

          {/* Company ID filter */}
          <input
            type="text"
            placeholder="Company ID…"
            value={companyIdFilter}
            onChange={(e) => { setCompanyIdFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-36"
          />

          {/* HRM/HR username filter */}
          <input
            type="text"
            placeholder="HRM username…"
            value={usernameFilter}
            onChange={(e) => { setUsernameFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-40"
          />

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as ApplicationStatus | ""); setPage(1); }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
            ))}
          </select>

          <span className="text-sm text-gray-500 whitespace-nowrap shrink-0">
            {total} result{total !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Table */}
        <AdminApplicationTable
          applications={applications}
          loading={loading}
          onViewDetail={(id) => { const app = applications.find((a) => a.id === id); if (app) setSelectedApp(app); }}
          onDelete={handleDelete}
          onRestore={(id) => restoreApplication(id)}
          restoring={restoring}
          deleting={deleting}
          onDownloadCV={(id, fileName) => {
            applicationService.downloadCv(id, fileName).catch(() => {});
          }}
        />

        <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
      </div>

      {/* Detail panel (read-only for admin) */}
      {selectedApp && (
        <ApplicationDetailPanel
          application={selectedApp}
          currentUsername="admin"
          canUpdateStatus={false}
          onClose={() => setSelectedApp(null)}
          onRefresh={() => { setSelectedApp(null); refresh(); }}
        />
      )}

      {/* Delete confirmation dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setConfirmDeleteId(null)} />
          <div className="relative z-10 bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4 space-y-4">
            <h2 className="text-base font-semibold text-gray-900">Delete Application</h2>
            <p className="text-sm text-gray-600">
              This will mark the application as <StatusBadge status="WITHDRAWN" className="mx-1" />.
              The candidate will no longer see it as active.
            </p>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Reason (optional)</label>
              <input
                type="text"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="e.g. Duplicate, spam, policy violation…"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setConfirmDeleteId(null); setDeleteReason(""); }}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Admin-specific table (adds Company column + Delete/Restore actions) ──────

interface AdminAppRow {
  id: string;
  username: string;
  email: string;
  status: ApplicationStatus;
  jobSnapshot: { title: string; companyName: string };
  assignedTo: string;
  updatedAt: string;
  cvFileName: string;
  companyId: string;
}

interface AdminApplicationTableProps {
  applications: AdminAppRow[];
  loading?: boolean;
  onViewDetail: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onDownloadCV: (id: string, fileName: string) => void;
  deleting?: boolean;
  restoring?: boolean;
}

function AdminApplicationTable({
  applications,
  loading,
  onViewDetail,
  onDelete,
  onRestore,
  onDownloadCV,
}: AdminApplicationTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
        <svg className="animate-spin h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        Loading applications…
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <svg className="h-10 w-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm font-medium">No applications found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-500 whitespace-nowrap">Candidate</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 whitespace-nowrap">Job / Company</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 whitespace-nowrap">Status</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 whitespace-nowrap">Assigned To</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 whitespace-nowrap">Last Updated</th>
            <th className="px-4 py-3 text-right font-medium text-gray-500 whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {applications.map((app) => (
            <tr key={app.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900">{app.username}</div>
                <div className="text-xs text-gray-500">{app.email}</div>
              </td>
              <td className="px-4 py-3">
                <div className="text-gray-800 max-w-48 truncate">{app.jobSnapshot?.title ?? "—"}</div>
                <div className="text-xs text-gray-400 truncate">{app.jobSnapshot?.companyName}</div>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={app.status} />
              </td>
              <td className="px-4 py-3 text-xs text-gray-600">
                {app.assignedTo || <span className="text-gray-300 italic">Unassigned</span>}
              </td>
              <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                {app.updatedAt ? new Date(app.updatedAt).toLocaleDateString() : "—"}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onDownloadCV(app.id, app.cvFileName)}
                    title="Download CV"
                    className="rounded p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                  {app.status === "WITHDRAWN" ? (
                    <button
                      onClick={() => onRestore(app.id)}
                      title="Restore application"
                      className="rounded px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                    >
                      Restore
                    </button>
                  ) : (
                    <button
                      onClick={() => onDelete(app.id)}
                      title="Delete application"
                      className="rounded p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => onViewDetail(app.id)}
                    className="rounded px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    View
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
