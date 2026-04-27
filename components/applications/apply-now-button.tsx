"use client";

/**
 * ApplyNowButton — drop-in button for any page.
 *
 * Usage:  <ApplyNowButton jobId={job.id} jobTitle={job.title} />
 *
 * Behaviour:
 *  - Auth loading or check-in-flight → pulse skeleton
 *  - Unauthenticated → redirect to /login?next=<current path>
 *  - Candidate already applied → disabled "Applied ✓"
 *  - Candidate not yet applied → open global ApplyNowModal
 *  - Non-candidate (HR, etc.) → show button (backend will reject if needed)
 */

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useApplyModal } from "@/contexts/apply-modal-context";
import { applicationService } from "@/lib/application/application-service";

interface ApplyNowButtonProps {
  jobId: string;
  jobTitle: string;
  /** Optionally override the button label */
  label?: string;
}

type CheckState = "idle" | "loading" | "applied" | "not-applied";

export default function ApplyNowButton({
  jobId,
  jobTitle,
  label = "Apply Now",
}: ApplyNowButtonProps) {
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { openApplyModal } = useApplyModal();

  const [checkState, setCheckState] = useState<CheckState>("idle");
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // Only pre-check for authenticated candidates
    const isCandidate =
      isAuthenticated && !!user?.roles.includes("ROLE_CANDIDATE");

    if (!isCandidate) {
      // Immediately idle — no spinner needed for non-candidates
      if (mountedRef.current) setCheckState("idle");
      return;
    }

    if (mountedRef.current) setCheckState("loading");

    applicationService
      .checkApplied(jobId)
      .then((res) => {
        if (!mountedRef.current) return;
        setCheckState(res.data?.applied ? "applied" : "not-applied");
      })
      .catch(() => {
        if (mountedRef.current) setCheckState("not-applied");
      });
  }, [jobId, isAuthenticated, user]);

  const handleClick = () => {
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    openApplyModal(jobId, jobTitle);
  };

  // Auth still loading or API check in flight — light skeleton
  if (isAuthLoading || checkState === "loading") {
    return (
      <Button
        disabled
        className="min-w-36 h-10 rounded-lg bg-blue-50 border border-blue-100 text-transparent animate-pulse select-none shadow-none"
      >
        Apply Now
      </Button>
    );
  }

  // Candidate has already applied
  if (checkState === "applied") {
    return (
      <Button
        disabled
        className="min-w-36 h-10 rounded-lg border border-green-200 bg-green-50 text-green-700 font-medium cursor-default shadow-none"
      >
        <CheckCircle2 className="w-4 h-4 mr-1.5" />
        Applied
      </Button>
    );
  }

  // Default — ready to apply (or unauthenticated, or non-candidate)
  return (
    <Button
      onClick={handleClick}
      className="min-w-36 h-10 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 font-medium hover:bg-blue-600 hover:text-white hover:border-blue-600 shadow-none transition-all duration-200"
    >
      {label}
    </Button>
  );
}
