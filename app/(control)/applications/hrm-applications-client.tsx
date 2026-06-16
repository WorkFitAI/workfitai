"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useDebounce } from "@/hooks/useDebounce";
import {
  useCompanyApplications,
  useCompanyHRUsers,
  useCompanyJobs,
  useCompanyCandidates,
} from "@/hooks/useHrmApplications";
import { useAssignApplication } from "@/hooks/useApplicationManagement";
import { ApplicationTable, Pagination } from "@/components/hrm/application-table";
import { ApplicationFilters } from "@/components/hrm/application-filters";
import { AssignHRModal } from "@/components/hrm/assign-hr-modal";
import { ApplicationDetailPanel } from "@/components/hrm/application-detail-panel";
import { HRCandidatesTab } from "@/components/hrm/hr-candidates-tab";
import { AiCvRankingTab } from "@/components/hrm/ai-cv-ranking-tab";
import { applicationService } from "@/lib/application/application-service";
import type { Application, ApplicationStatus, CandidateDetail } from "@/types/application";

type Tab = "applications" | "candidates" | "ai-ranking";
const PAGE_SIZE = 20;

export default function HrmApplicationsClient() {
  const { user } = useAuth();
  const companyNo = user?.companyId ?? "";

  const [activeTab, setActiveTab] = useState<Tab>("applications");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "">("");
  const [jobFilter, setJobFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [assignTarget, setAssignTarget] = useState<{ id: string; currentAssignee: string } | null>(null);

  // Load jobs for the filter dropdown (large page size to get all)
  const { jobs } = useCompanyJobs(companyNo, 1, 100);

  // Derive jobTitle from the selected jobId for server-side filtering
  const selectedJobTitle = useMemo(
    () => jobs.find((j) => j.jobId === jobFilter)?.title,
    [jobs, jobFilter],
  );

  // Debounce keyword search to avoid excessive API calls
  const debouncedKeyword = useDebounce(searchQuery, 400);

  const { applications, totalPages, total, loading, error, refresh } =
    useCompanyApplications(
      companyNo,
      page,
      PAGE_SIZE,
      statusFilter || undefined,
      selectedJobTitle,
      debouncedKeyword || undefined,
    );
  const { hrUsers, loading: hrLoading } = useCompanyHRUsers(companyNo);
  const { assign, assigning, assignError, clearAssignError } = useAssignApplication(() => {
    setAssignTarget(null);
    refresh();
  });

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
  } = useCompanyCandidates(companyNo, candidatesPage, PAGE_SIZE, candidatesStatus || undefined);

  const filteredCandidates = useMemo(() => {
    if (!candidatesSearch.trim()) return candidates;
    const q = candidatesSearch.toLowerCase();
    return candidates.filter(
      (c) => c.fullName.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
    );
  }, [candidates, candidatesSearch]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  if (!companyNo) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
        No company associated with your account.
      </div>
    );
  }

  const tabs: { key: Tab; label: string; ai?: boolean }[] = [
    { key: "applications", label: "Applications" },
    { key: "candidates", label: "Candidates" },
    { key: "ai-ranking", label: "✦ AI Ranking", ai: true },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Applications</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage all job applications for your company</p>
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
          {tabs.map(({ key, label, ai }) => (
            <button
              key={key}
              onClick={() => handleTabChange(key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === key
                  ? ai
                    ? "border-violet-600 text-violet-600"
                    : "border-blue-600 text-blue-600"
                  : ai
                    ? "border-transparent text-violet-400 hover:text-violet-600"
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

      <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
        {activeTab === "applications" && (
          <>
            <ApplicationFilters
              statusFilter={statusFilter}
              onStatusChange={(s) => { setStatusFilter(s); setPage(1); }}
              searchQuery={searchQuery}
              onSearchChange={(q) => { setSearchQuery(q); setPage(1); }}
              total={total}
              jobs={jobs}
              jobFilter={jobFilter}
              onJobChange={(id) => { setJobFilter(id); setPage(1); }}
            />
            <ApplicationTable
              applications={applications}
              loading={loading}
              onViewDetail={(id) => { const app = applications.find((a) => a.id === id); if (app) setSelectedApp(app); }}
              onAssign={(id, currentAssignee) => setAssignTarget({ id, currentAssignee })}
              onDownloadCV={(id, fileName) => {
                import("@/lib/application/application-service").then(({ applicationService }) => {
                  applicationService.downloadCv(id, fileName).catch(() => {});
                });
              }}
              showAssign
            />
            <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
          </>
        )}

        {activeTab === "ai-ranking" && (
          <AiCvRankingTab jobs={jobs} />
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
            currentUsername={user?.username ?? ""}
            onStatusChange={(s) => { setCandidatesStatus(s); setCandidatesPage(1); }}
            onSearchChange={setCandidatesSearch}
            onPageChange={setCandidatesPage}
            onRefresh={refreshCandidates}
            fetchDetail={async (username) => {
              const res = await applicationService.getCompanyCandidateDetail(companyNo, username);
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
          onClose={() => { clearAssignError(); setAssignTarget(null); }}
        />
      )}
    </div>
  );
}
