"use client";

import { useState } from "react";
import { StatusBadge, Pagination } from "./application-table";
import { CandidateDetailPanel } from "./candidate-detail-panel";
import type { HRCandidateItem, CandidateDetail, ApplicationStatus } from "@/types/application";
import { STATUS_FLOW } from "./application-table";
import { LottieLoader } from "@/components/ui/lottie-loader";

interface HRCandidatesTabProps {
  candidates: HRCandidateItem[];
  loading: boolean;
  page: number;
  totalPages: number;
  total: number;
  statusFilter: ApplicationStatus | "";
  searchQuery: string;
  currentUsername: string;
  onStatusChange: (s: ApplicationStatus | "") => void;
  onSearchChange: (q: string) => void;
  onPageChange: (p: number) => void;
  onRefresh: () => void;
  fetchDetail: (username: string) => Promise<CandidateDetail>;
}

export function HRCandidatesTab({
  candidates,
  loading,
  page,
  totalPages,
  total,
  statusFilter,
  searchQuery,
  currentUsername,
  onStatusChange,
  onSearchChange,
  onPageChange,
  onRefresh,
  fetchDetail,
}: HRCandidatesTabProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const handleViewCandidate = async (username: string) => {
    setDetailLoading(true);
    try {
      const detail = await fetchDetail(username);
      setSelectedCandidate(detail);
    } catch {
      // ignore — show nothing if fetch fails
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1">
          <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search candidate name or email…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-4 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value as ApplicationStatus | "")}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All statuses</option>
          {STATUS_FLOW.map((s) => (
            <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
          ))}
        </select>
        <span className="text-sm text-gray-500 whitespace-nowrap">{total} candidate{total !== 1 ? "s" : ""}</span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 text-sm gap-2">
          <LottieLoader size={80} />
          Loading candidates…
        </div>
      ) : candidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <svg className="h-10 w-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-sm font-medium">No candidates found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Candidate</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Latest Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Applications</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Applied Jobs</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Last Applied</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {candidates.map((c) => (
                <tr key={c.username} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{c.fullName}</div>
                    <div className="text-xs text-gray-500">{c.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.latestStatus} />
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{c.applicationCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      {c.appliedJobTitles.slice(0, 2).map((t, i) => (
                        <span key={i} className="text-xs text-gray-600 truncate max-w-48">{t}</span>
                      ))}
                      {c.appliedJobTitles.length > 2 && (
                        <span className="text-xs text-gray-400">+{c.appliedJobTitles.length - 2} more</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(c.latestApplicationDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleViewCandidate(c.username)}
                      disabled={detailLoading}
                      className="rounded px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors disabled:opacity-50"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} total={total} onPageChange={onPageChange} />

      {selectedCandidate && (
        <CandidateDetailPanel
          candidate={selectedCandidate}
          currentUsername={currentUsername}
          onClose={() => setSelectedCandidate(null)}
          onRefresh={() => {
            setSelectedCandidate(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}
