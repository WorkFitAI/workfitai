"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  useAssignedApplications,
  useHRJobs,
  useHRCandidates,
} from "@/hooks/useHrmApplications";
import { ApplicationTable, Pagination } from "@/components/hrm/application-table";
import { ApplicationFilters } from "@/components/hrm/application-filters";
import { ApplicationDetailPanel } from "@/components/hrm/application-detail-panel";
import { HRCandidatesTab } from "@/components/hrm/hr-candidates-tab";
import { applicationService } from "@/lib/application/application-service";
import type { Application, ApplicationStatus, CandidateDetail } from "@/types/application";

type Tab = "applications" | "candidates";
const PAGE_SIZE = 20;

export default function HrMyApplicationsClient() {
  const { user } = useAuth();
  const hrUsername = user?.username ?? "";

  const [activeTab, setActiveTab] = useState<Tab>("applications");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "">("");
  const [jobFilter, setJobFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const { applications, totalPages, total, loading, error, refresh } =
    useAssignedApplications(hrUsername, page, PAGE_SIZE);

  // Load HR jobs for the filter dropdown
  const { jobs } = useHRJobs(1, 100);

  // Candidates tab
  const [candidatesPage, setCandidatesPage] = useState(1);
  const [candidatesStatus, setCandidatesStatus] = useState<ApplicationStatus | "">("");
  const [candidatesSearch, setCandidatesSearch] = useState("");
  const {
    candidates,
    totalPages: candidatesTotalPages,
    total: candidatesTotal,
    loading: candidatesLoading,
    refresh: refreshCandidates,
  } = useHRCandidates(candidatesPage, PAGE_SIZE, candidatesStatus || undefined);

  const filtered = useMemo(() => {
    let list = applications;
    if (jobFilter) list = list.filter((a) => a.jobId === jobFilter);
    if (statusFilter) list = list.filter((a) => a.status === statusFilter);
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
  }, [applications, statusFilter, jobFilter, searchQuery]);

  const filteredCandidates = useMemo(() => {
    if (!candidatesSearch.trim()) return candidates;
    const q = candidatesSearch.toLowerCase();
    return candidates.filter(
      (c) => c.fullName.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
    );
  }, [candidates, candidatesSearch]);

  const tabs: { key: Tab; label: string }[] = [
    { key: "applications", label: "My Applications" },
    { key: "candidates", label: "My Candidates" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">My Work</h1>
          <p className="text-sm text-gray-500 mt-0.5">Applications and candidates assigned to you</p>
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

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setPage(1); }}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {error && activeTab === "applications" && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-4">
        {activeTab === "applications" && (
          <>
            <ApplicationFilters
              statusFilter={statusFilter}
              onStatusChange={(s) => { setStatusFilter(s); setPage(1); }}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              total={filtered.length}
              jobs={jobs}
              jobFilter={jobFilter}
              onJobChange={(id) => { setJobFilter(id); setPage(1); }}
            />
            <ApplicationTable
              applications={filtered}
              loading={loading}
              onViewDetail={(id) => { const app = applications.find((a) => a.id === id); if (app) setSelectedApp(app); }}
              onDownloadCV={(id, fileName) => {
                import("@/lib/application/application-service").then(({ applicationService }) => {
                  applicationService.downloadCv(id, fileName).catch(() => {});
                });
              }}
              showAssign={false}
            />
            <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
          </>
        )}

        {activeTab === "candidates" && (
          <HRCandidatesTab
            candidates={filteredCandidates}
            loading={candidatesLoading}
            page={candidatesPage}
            totalPages={candidatesTotalPages}
            total={candidatesTotal}
            statusFilter={candidatesStatus}
            searchQuery={candidatesSearch}
            currentUsername={hrUsername}
            onStatusChange={(s) => { setCandidatesStatus(s); setCandidatesPage(1); }}
            onSearchChange={setCandidatesSearch}
            onPageChange={setCandidatesPage}
            onRefresh={refreshCandidates}
            fetchDetail={async (username) => {
              const res = await applicationService.getHRCandidateDetail(username);
              return res.data as CandidateDetail;
            }}
          />
        )}
      </div>

      {selectedApp && user && (
        <ApplicationDetailPanel
          application={selectedApp}
          currentUsername={user.username}
          onClose={() => setSelectedApp(null)}
          onRefresh={() => { setSelectedApp(null); refresh(); }}
        />
      )}
    </div>
  );
}
