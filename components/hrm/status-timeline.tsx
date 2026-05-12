"use client";

import { Loader2, AlertCircle } from "lucide-react";
import type { StatusHistoryItem } from "@/types/application";

const STATUS_DOT: Record<string, string> = {
  APPLIED: "bg-blue-500",
  REVIEWING: "bg-amber-500",
  INTERVIEWING: "bg-purple-500",
  OFFERED: "bg-green-500",
  ACCEPTED: "bg-emerald-600",
  REJECTED: "bg-red-500",
  WITHDRAWN: "bg-gray-400",
};

interface StatusTimelineProps {
  history: StatusHistoryItem[];
  loading: boolean;
  error: string | null;
}

export function StatusTimeline({ history, loading, error }: StatusTimelineProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 text-gray-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading timeline…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600">
        <AlertCircle className="h-4 w-4 shrink-0" />
        {error}
      </div>
    );
  }

  if (history.length === 0) {
    return <p className="text-sm text-gray-400 italic">No status history available.</p>;
  }

  return (
    <ol className="relative border-l border-gray-200 ml-2">
      {history.map((item, idx) => (
        <li key={idx} className="mb-5 ml-6 last:mb-0">
          {/* timeline dot */}
          <span
            className={`absolute -left-2 flex h-4 w-4 items-center justify-center rounded-full ring-2 ring-white ${STATUS_DOT[item.newStatus] ?? "bg-gray-400"}`}
          />

          {/* transition label */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {item.previousStatus && (
              <>
                <span className="text-xs text-gray-400">{item.previousStatus}</span>
                <svg className="h-3 w-3 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
            <span className="text-xs font-semibold text-gray-900">{item.newStatus}</span>
          </div>

          {/* meta */}
          <p className="text-[11px] text-gray-500 mt-0.5">
            by <span className="font-medium text-gray-700">@{item.changedBy}</span>
            {" · "}
            {new Date(item.changedAt).toLocaleString("en-GB", {
              day: "2-digit", month: "short", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            })}
          </p>

          {item.reason && (
            <p className="text-xs text-gray-500 mt-1 italic">{item.reason}</p>
          )}
        </li>
      ))}
    </ol>
  );
}
