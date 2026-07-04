"use client";

import { useState } from "react";
import type { ApplicationStatus } from "@/types/application";

/** Forward-only transition order. REJECTED is reachable from any non-terminal status. */
const MAIN_FLOW: ApplicationStatus[] = ["APPLIED", "REVIEWING", "INTERVIEW", "OFFER", "HIRED"];

/** Statuses to show in the modal: current status plus valid forward transitions. Past statuses are hidden. */
function getVisibleStatuses(current: ApplicationStatus): ApplicationStatus[] {
  if (current === "HIRED" || current === "REJECTED") return [current];
  const idx = MAIN_FLOW.indexOf(current);
  const forward = idx === -1 ? MAIN_FLOW : MAIN_FLOW.slice(idx);
  return [...forward, "REJECTED"];
}

interface StatusUpdateModalProps {
  isOpen: boolean;
  currentStatus: ApplicationStatus;
  updating: boolean;
  error?: string | null;
  onUpdate: (status: string) => void;
  onClose: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  APPLIED:   "Applied",
  REVIEWING: "Reviewing",
  INTERVIEW: "Interview",
  OFFER:     "Offer",
  HIRED:     "Hired",
  REJECTED:  "Rejected",
};

const STATUS_DESC: Record<string, string> = {
  APPLIED:   "Application received, awaiting review",
  REVIEWING: "HR is actively reviewing the application",
  INTERVIEW: "Candidate invited for an interview",
  OFFER:     "Job offer extended to the candidate",
  HIRED:     "Candidate has accepted the offer",
  REJECTED:  "Application has been declined",
};

export function StatusUpdateModal({
  isOpen,
  currentStatus,
  updating,
  error,
  onUpdate,
  onClose,
}: StatusUpdateModalProps) {
  const [selected, setSelected] = useState<string>(currentStatus);
  // Tracks whether the modal was open on the previous render, so we can detect the
  // closed→open transition and re-sync `selected` (modal stays mounted between opens).
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (isOpen && !wasOpen) {
    setWasOpen(true);
    setSelected(currentStatus);
  } else if (!isOpen && wasOpen) {
    setWasOpen(false);
  }

  if (!isOpen) return null;

  const visibleStatuses = getVisibleStatuses(currentStatus);

  const handleConfirm = () => {
    if (!selected || selected === currentStatus) return;
    onUpdate(selected);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="status-modal-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-gray-900/10 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 id="status-modal-title" className="text-base font-semibold text-gray-900">
            Update Application Status
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Current status:{" "}
          <span className="font-medium text-gray-800">{STATUS_LABELS[currentStatus] ?? currentStatus}</span>
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {visibleStatuses.map((s) => {
            const isCurrent = s === currentStatus;
            return (
              <label
                key={s}
                className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                  isCurrent
                    ? "border-amber-300 bg-amber-50 cursor-default"
                    : selected === s
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="app-status"
                  value={s}
                  checked={selected === s}
                  disabled={isCurrent}
                  onChange={() => setSelected(s)}
                  className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    {STATUS_LABELS[s]}
                    {isCurrent && (
                      <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-800">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">{STATUS_DESC[s]}</div>
                </div>
              </label>
            );
          })}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selected || selected === currentStatus || updating}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {updating ? "Updating…" : "Update Status"}
          </button>
        </div>
      </div>
    </div>
  );
}
