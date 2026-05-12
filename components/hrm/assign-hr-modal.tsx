"use client";

import { useState, useMemo } from "react";
import type { HRUser } from "@/types/application";
import { cn } from "@/lib/utils";

interface AssignHRModalProps {
  isOpen: boolean;
  applicationId: string;
  currentAssignee: string;
  hrUsers: HRUser[];
  loadingHRUsers: boolean;
  assigning: boolean;
  error?: string | null;
  onAssign: (applicationId: string, hrUsername: string) => void;
  onClose: () => void;
}

export function AssignHRModal({
  isOpen,
  applicationId,
  currentAssignee,
  hrUsers,
  loadingHRUsers,
  assigning,
  error,
  onAssign,
  onClose,
}: AssignHRModalProps) {
  const defaultSelected = useMemo(
    () => (isOpen ? currentAssignee || "" : ""),
    [isOpen, currentAssignee],
  );
  const [selected, setSelected] = useState(defaultSelected);

  // Sync when modal re-opens with a different assignee
  if (selected !== defaultSelected && !assigning) {
    setSelected(defaultSelected);
  }

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!selected) return;
    onAssign(applicationId, selected);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="assign-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-gray-900/10 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 id="assign-modal-title" className="text-base font-semibold text-gray-900">
            Assign Application to HR
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

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select HR member
        </label>

        {loadingHRUsers ? (
          <div className="h-10 flex items-center text-sm text-gray-400">
            Loading HR members…
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {hrUsers.map((hr) => (
              <label
                key={hr.userId}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors",
                  selected === hr.username
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                )}
              >
                <input
                  type="radio"
                  name="hr-assignee"
                  value={hr.username}
                  checked={selected === hr.username}
                  onChange={() => setSelected(hr.username)}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {hr.fullName}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    @{hr.username} · {hr.userRole === "HR_MANAGER" ? "HR Manager" : "HR"}
                  </div>
                </div>
                {currentAssignee === hr.username && (
                  <span className="ml-auto shrink-0 text-xs text-blue-600 font-medium">
                    Current
                  </span>
                )}
              </label>
            ))}
            {hrUsers.length === 0 && (
              <p className="text-sm text-gray-400 py-4 text-center">No HR members found</p>
            )}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selected || assigning}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {assigning ? "Assigning…" : "Assign"}
          </button>
        </div>
      </div>
    </div>
  );
}
