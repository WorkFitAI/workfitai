"use client";

import { useState } from "react";
import { StatusBadge } from "./application-table";
import { ApplicationDetailPanel } from "./application-detail-panel";
import type { CandidateDetail, Application } from "@/types/application";

interface CandidateDetailPanelProps {
  candidate: CandidateDetail;
  currentUsername: string;
  onClose: () => void;
  onRefresh: () => void;
}

export function CandidateDetailPanel({
  candidate,
  currentUsername,
  onClose,
  onRefresh,
}: CandidateDetailPanelProps) {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  return (
    <>
      <div className="fixed inset-0 z-40 flex">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
        <div className="relative ml-auto flex h-full w-[55vw] flex-col bg-white shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 shrink-0">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-gray-900">{candidate.fullName}</h2>
              <p className="text-sm text-gray-500 truncate">{candidate.email} · {candidate.phoneNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Candidate info */}
            <section>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Candidate Info</h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm rounded-xl border border-gray-200 p-4">
                <div>
                  <dt className="text-gray-500">Username</dt>
                  <dd className="font-medium text-gray-900">{candidate.username}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Account Status</dt>
                  <dd className={`font-medium ${candidate.userStatus === "ACTIVE" ? "text-green-600" : "text-gray-500"}`}>
                    {candidate.userStatus}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Phone</dt>
                  <dd className="font-medium text-gray-900">{candidate.phoneNumber || "—"}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Total Applications</dt>
                  <dd className="font-medium text-gray-900">{candidate.totalApplications}</dd>
                </div>
              </dl>
            </section>

            {/* Applications list */}
            <section>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Applications ({candidate.applications.length})
              </h3>
              <div className="space-y-3">
                {candidate.applications.map((app) => (
                  <div
                    key={app.id}
                    className="rounded-xl border border-gray-200 p-4 hover:border-blue-200 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {app.jobSnapshot?.title ?? "—"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {app.jobSnapshot?.companyName} · {app.jobSnapshot?.location}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Applied {new Date(app.createdAt).toLocaleDateString()}
                          {app.assignedTo && ` · Assigned to ${app.assignedTo}`}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge status={app.status} />
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="rounded px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {candidate.applications.length === 0 && (
                  <p className="text-sm text-gray-400 py-4 text-center">No applications found.</p>
                )}
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 shrink-0 bg-white">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {selectedApp && (
        <ApplicationDetailPanel
          application={selectedApp}
          currentUsername={currentUsername}
          onClose={() => setSelectedApp(null)}
          onRefresh={() => {
            setSelectedApp(null);
            onRefresh();
          }}
        />
      )}
    </>
  );
}
