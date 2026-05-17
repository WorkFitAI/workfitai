"use client";

import { cn } from "@/lib/utils";
import type { ApplicationStatus } from "@/types/application";

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; classes: string }
> = {
  DRAFT:     { label: "Draft",     classes: "bg-gray-100 text-gray-600 ring-gray-200" },
  APPLIED:   { label: "Applied",   classes: "bg-blue-50 text-blue-700 ring-blue-200" },
  REVIEWING: { label: "Reviewing", classes: "bg-yellow-50 text-yellow-700 ring-yellow-200" },
  INTERVIEW: { label: "Interview", classes: "bg-purple-50 text-purple-700 ring-purple-200" },
  OFFER:     { label: "Offer",     classes: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  HIRED:     { label: "Hired",     classes: "bg-green-50 text-green-700 ring-green-200" },
  REJECTED:  { label: "Rejected",  classes: "bg-red-50 text-red-700 ring-red-200" },
  WITHDRAWN: { label: "Withdrawn", classes: "bg-slate-100 text-slate-500 ring-slate-200" },
};

/** Ordered status flow for the update dropdown (valid transitions only shown) */
export const STATUS_FLOW: ApplicationStatus[] = [
  "APPLIED",
  "REVIEWING",
  "INTERVIEW",
  "OFFER",
  "HIRED",
  "REJECTED",
];

interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, classes: "bg-gray-100 text-gray-600 ring-gray-200" };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        cfg.classes,
        className,
      )}
    >
      {cfg.label}
    </span>
  );
}

interface ApplicationTableProps {
  applications: {
    id: string;
    username: string;
    email: string;
    status: ApplicationStatus;
    jobSnapshot: { title: string; companyName: string };
    assignedTo: string;
    createdAt: string;
    cvFileName: string;
  }[];
  loading?: boolean;
  onViewDetail: (id: string) => void;
  onAssign?: (id: string, currentAssignee: string) => void;
  onDownloadCV?: (id: string, fileName: string) => void;
  showAssign?: boolean;
}

export function ApplicationTable({
  applications,
  loading,
  onViewDetail,
  onAssign,
  onDownloadCV,
  showAssign = false,
}: ApplicationTableProps) {
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
            <th className="px-4 py-3 text-left font-medium text-gray-500 whitespace-nowrap">Job</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500 whitespace-nowrap">Status</th>
            {showAssign && (
              <th className="px-4 py-3 text-left font-medium text-gray-500 whitespace-nowrap">Assigned To</th>
            )}
            <th className="px-4 py-3 text-left font-medium text-gray-500 whitespace-nowrap">Applied</th>
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
                <div className="text-gray-800 max-w-50 truncate">{app.jobSnapshot?.title ?? "—"}</div>
                <div className="text-xs text-gray-400 truncate">{app.jobSnapshot?.companyName}</div>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={app.status} />
              </td>
              {showAssign && (
                <td className="px-4 py-3 text-gray-600 text-xs">
                  {app.assignedTo || <span className="text-gray-300 italic">Unassigned</span>}
                </td>
              )}
              <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                {new Date(app.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  {onDownloadCV && (
                    <button
                      onClick={() => onDownloadCV(app.id, app.cvFileName)}
                      title="Download CV"
                      className="rounded p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                  )}
                  {showAssign && onAssign && (
                    <button
                      onClick={() => onAssign(app.id, app.assignedTo)}
                      title="Assign to HR"
                      className="rounded p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between py-3 text-sm text-gray-600">
      <span>{total} total</span>
      <div className="flex items-center gap-1">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="px-2.5 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ‹
        </button>
        <span className="px-3 py-1">
          {page} / {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="px-2.5 py-1 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ›
        </button>
      </div>
    </div>
  );
}
