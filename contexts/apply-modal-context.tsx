"use client";

/**
 * ApplyModalContext — global "Apply Now" service.
 *
 * Wraps the entire app at the root layout. Any component can call
 * openApplyModal(jobId, jobTitle) to trigger the single shared modal.
 * The modal itself handles auth-guarding, file upload, and submission.
 */

import { createContext, useCallback, useContext, useState } from "react";
import ApplyNowModal from "@/components/applications/apply-now-modal";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ModalState {
  isOpen: boolean;
  jobId: string;
  jobTitle: string;
}

interface ApplyModalContextValue {
  openApplyModal: (jobId: string, jobTitle: string) => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ApplyModalContext = createContext<ApplyModalContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function ApplyModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    jobId: "",
    jobTitle: "",
  });

  const openApplyModal = useCallback((jobId: string, jobTitle: string) => {
    setModal({ isOpen: true, jobId, jobTitle });
  }, []);

  const handleClose = useCallback(() => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <ApplyModalContext.Provider value={{ openApplyModal }}>
      {children}
      <ApplyNowModal
        isOpen={modal.isOpen}
        jobId={modal.jobId}
        jobTitle={modal.jobTitle}
        onClose={handleClose}
      />
    </ApplyModalContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/** Call from any component to open the global Apply Now modal. */
export function useApplyModal(): ApplyModalContextValue {
  const ctx = useContext(ApplyModalContext);
  if (!ctx) throw new Error("useApplyModal must be used inside ApplyModalProvider");
  return ctx;
}
