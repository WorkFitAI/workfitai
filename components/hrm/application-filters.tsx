"use client";

import { type ApplicationStatus } from "@/types/application";
import { STATUS_FLOW } from "./application-table";

interface JobOption {
  jobId: string;
  title: string;
}

interface ApplicationFiltersProps {
  statusFilter: ApplicationStatus | "";
  onStatusChange: (s: ApplicationStatus | "") => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  total: number;
  jobs?: JobOption[];
  jobFilter?: string;
  onJobChange?: (jobId: string) => void;
}

export function ApplicationFilters({
  statusFilter,
  onStatusChange,
  searchQuery,
  onSearchChange,
  total,
  jobs,
  jobFilter,
  onJobChange,
}: ApplicationFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
      {/* Search input */}
      <div className="relative flex-1 min-w-0">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          id="hrm-search"
          type="text"
          placeholder="Search candidate or job…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-4 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Job filter — shown only when jobs list is provided */}
      {jobs && onJobChange && (
        <select
          value={jobFilter ?? ""}
          onChange={(e) => onJobChange(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-56 truncate"
        >
          <option value="">All jobs</option>
          {jobs.map((j) => (
            <option key={j.jobId} value={j.jobId}>
              {j.title}
            </option>
          ))}
        </select>
      )}

      {/* Status filter */}
      <select
        id="hrm-status-filter"
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value as ApplicationStatus | "")}
        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="">All statuses</option>
        {STATUS_FLOW.map((s) => (
          <option key={s} value={s}>
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </option>
        ))}
        <option value="WITHDRAWN">Withdrawn</option>
      </select>

      {/* Total count */}
      <span className="text-sm text-gray-500 whitespace-nowrap shrink-0">
        {total} result{total !== 1 ? "s" : ""}
      </span>
    </div>
  );
}
