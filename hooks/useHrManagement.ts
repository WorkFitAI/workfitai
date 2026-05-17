"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { applicationService } from "@/lib/application/application-service";
import { adminUserService } from "@/lib/admin/admin-user-service";
import type { HRUser } from "@/types/application";

// ─── Company HR users list ──────────────────────────────────────────────────

export function useCompanyHRManagement(companyNo: string) {
  const [hrUsers, setHrUsers] = useState<HRUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!companyNo) return;
    try {
      setLoading(true);
      setError(null);
      const res = await applicationService.getCompanyHRUsers(companyNo);
      setHrUsers(res.data ?? []);
    } catch {
      setError("Failed to load HR users.");
    } finally {
      setLoading(false);
    }
  }, [companyNo]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { hrUsers, loading, error, refresh: fetch };
}

// ─── Approve HR action ────────────────────────────────────────────────────

export function useApproveHR(onSuccess?: () => void) {
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [approveError, setApproveError] = useState<string | null>(null);

  const approve = useCallback(
    async (user: HRUser) => {
      try {
        setApprovingId(user.userId);
        setApproveError(null);
        await adminUserService.approveHR(user.username);
        toast.success(`${user.fullName} approved successfully`);
        onSuccess?.();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to approve HR user.";
        toast.error(msg);
        setApproveError(msg);
      } finally {
        setApprovingId(null);
      }
    },
    [onSuccess],
  );

  return { approve, approvingId, approveError, clearError: () => setApproveError(null) };
}

// ─── Reject HR action (HR_MANAGER only) ───────────────────────────────────

export function useRejectHR(onSuccess?: () => void) {
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectError, setRejectError] = useState<string | null>(null);

  const reject = useCallback(
    async (user: HRUser) => {
      try {
        setRejectingId(user.userId);
        setRejectError(null);
        await adminUserService.rejectHR(user.username);
        toast.success(`${user.fullName} has been rejected`);
        onSuccess?.();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to reject HR user.";
        toast.error(msg);
        setRejectError(msg);
      } finally {
        setRejectingId(null);
      }
    },
    [onSuccess],
  );

  return { reject, rejectingId, rejectError, clearError: () => setRejectError(null) };
}
