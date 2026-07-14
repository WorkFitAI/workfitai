"use client";

import { useState } from "react";
import Link from "next/link";
import { StatusBadge } from "./application-table";
import { StatusUpdateModal } from "./status-update-modal";
import { NotesPanel } from "./notes-panel";
import { StatusTimeline } from "./status-timeline";
import { CvViewer } from "@/components/applications/cv-viewer";
import { CvMatchAnalysis } from "@/components/hrm/cv-match-analysis";
import { useApplicationNotes, useStatusUpdate, useStatusHistory } from "@/hooks/useApplicationManagement";
import type { Application, CvRankedApplication } from "@/types/application";

interface ApplicationDetailPanelProps {
  application: Application;
  currentUsername: string;
  onClose: () => void;
  onRefresh: () => void;
  canUpdateStatus?: boolean;
  /** Present only when opened from the AI CV ranking tab — drives the AI Match Analysis section. */
  rankingInfo?: CvRankedApplication;
}

export function ApplicationDetailPanel({
  application,
  currentUsername,
  onClose,
  onRefresh,
  canUpdateStatus = true,
  rankingInfo,
}: ApplicationDetailPanelProps) {
  const [showStatusModal, setShowStatusModal] = useState(false);

  const { notes, loading: notesLoading, submitting, error: notesError, addNote, editNote, deleteNote } =
    useApplicationNotes(application.id);

  const { updateStatus, updating, statusError, clearStatusError } = useStatusUpdate(
    application.id,
    () => {
      setShowStatusModal(false);
      onRefresh();
    },
  );

  const { history, loading: historyLoading, error: historyError } = useStatusHistory(application.id);

  const snap = application.jobSnapshot;
  // Mirrors ai-cv-ranking-tab.tsx's isPastRanking: HIRED/OFFER rows keep ranked=true
  // but the table mutes their ranking UI, so the panel must match that behavior.
  const isPastRanking = application.status === "HIRED" || application.status === "OFFER";
  const showRankingInfo = rankingInfo?.ranked && !isPastRanking;

  return (
    <>
      {/* Slide-over panel */}
      <div className="fixed inset-0 z-40 flex">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

        {/* Panel — extended wide to accommodate CV preview on the right */}
        <div className="relative ml-auto flex h-full w-[70vw] flex-col bg-white shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 shrink-0">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-gray-900 truncate">
                {application.username}
              </h2>
              <p className="text-sm text-gray-500 truncate">{application.email}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-4">
              <StatusBadge status={application.status} />
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Two-column body: left = details, right = CV preview */}
          <div className="flex flex-1 overflow-hidden min-h-0">
            {/* Left pane — scrollable details */}
            <div className="w-100 shrink-0 overflow-y-auto border-r border-gray-100 p-6 space-y-6">
              {/* AI Match Analysis — only when opened from the ranking tab, and not for HIRED/OFFER (table mutes those too) */}
              {showRankingInfo && (
                <section>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">AI Match Analysis</h3>
                  <div className="rounded-xl border border-gray-200 p-4">
                    <CvMatchAnalysis
                      score={rankingInfo.score}
                      label={rankingInfo.label}
                      similarityScore={rankingInfo.similarityScore}
                      crossScore={rankingInfo.crossScore}
                      inputCoverage={rankingInfo.inputCoverage}
                      matchPoints={rankingInfo.matchPoints ?? []}
                      missPoints={rankingInfo.missPoints ?? []}
                      variant="panel"
                    />
                  </div>
                </section>
              )}

              {/* Job info */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Job Details</h3>
                <div className="rounded-xl border border-gray-200 p-4 space-y-2">
                  <div className="font-semibold text-gray-900">
                    {application.jobId ? (
                      <Link
                        href={`/jobs/${application.jobId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600 hover:underline transition-colors"
                      >
                        {snap?.title}
                      </Link>
                    ) : (
                      snap?.title
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{snap?.companyName} · {snap?.location}</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {snap?.employmentType && (
                      <span className="rounded-full bg-blue-50 text-blue-700 px-2.5 py-0.5 text-xs font-medium">
                        {snap.employmentType}
                      </span>
                    )}
                    {snap?.experienceLevel && (
                      <span className="rounded-full bg-purple-50 text-purple-700 px-2.5 py-0.5 text-xs font-medium">
                        {snap.experienceLevel}
                      </span>
                    )}
                    {snap?.skillNames?.map((sk) => (
                      <span key={sk} className="rounded-full bg-gray-100 text-gray-600 px-2.5 py-0.5 text-xs font-medium">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </section>

              {/* Application info */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Application Info</h3>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div>
                    <dt className="text-gray-500">Applied</dt>
                    <dd className="text-gray-900 font-medium">
                      {new Date(application.createdAt).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Assigned To</dt>
                    <dd className="text-gray-900 font-medium">
                      {application.assignedTo || <span className="text-gray-400 italic">Unassigned</span>}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-gray-500 mb-1">Cover Letter</dt>
                    <dd className="text-gray-800 whitespace-pre-wrap text-sm leading-relaxed rounded-lg bg-gray-50 p-3">
                      {application.coverLetter || <span className="text-gray-400 italic">No cover letter provided</span>}
                    </dd>
                  </div>
                </dl>
              </section>

              {/* Status timeline */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Status Timeline</h3>
                <StatusTimeline history={history} loading={historyLoading} error={historyError} />
              </section>

              {/* Notes */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">HR Notes</h3>
                <NotesPanel
                  notes={notes}
                  loading={notesLoading}
                  submitting={submitting}
                  error={notesError}
                  currentUsername={currentUsername}
                  onAdd={addNote}
                  onEdit={editNote}
                  onDelete={deleteNote}
                />
              </section>
            </div>

            {/* Right pane — CV preview fills full height */}
            <div className="flex-1 flex flex-col overflow-hidden p-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 shrink-0">CV / Resume</h3>
              <CvViewer
                applicationId={application.id}
                fileName={application.cvFileName}
                highlightTerms={showRankingInfo ? rankingInfo?.matchPoints : undefined}
              />
            </div>
          </div>

          {/* Footer actions */}
          <div className="border-t border-gray-200 px-6 py-4 shrink-0 flex items-center justify-between bg-white">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            {canUpdateStatus && (
              <button
                onClick={() => {
                  clearStatusError();
                  setShowStatusModal(true);
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Update Status
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Status update modal */}
      <StatusUpdateModal
        isOpen={showStatusModal}
        currentStatus={application.status}
        updating={updating}
        error={statusError}
        onUpdate={updateStatus}
        onClose={() => {
          clearStatusError();
          setShowStatusModal(false);
        }}
      />
    </>
  );
}
