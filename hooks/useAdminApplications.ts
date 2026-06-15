"use client";

import { useCallback, useEffect, useState } from "react";
import { applicationService } from "@/lib/application/application-service";
import type { Application, ApplicationStatus } from "@/types/application";

export function useAdminApplications(
  page: number,
  pageSize = 50,
  statusFilter?: ApplicationStatus,
  companyId?: string,
  username?: string,
  jobTitle?: string,
  keyword?: string,
) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await applicationService.getAdminApplications(
        page - 1,
        pageSize,
        statusFilter,
        companyId,
        username,
        jobTitle,
        keyword,
      );
      setApplications(res.data?.items ?? []);
      setTotalPages(res.data?.meta.totalPages ?? 1);
      setTotal(res.data?.meta.totalElements ?? 0);
    } catch {
      setError("Failed to load applications.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, companyId, username, jobTitle, keyword]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { applications, totalPages, total, loading, error, refresh: fetch };
}

export function useAdminDeleteApplication(onSuccess?: () => void) {
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const deleteApplication = useCallback(
    async (applicationId: string, reason?: string) => {
      try {
        setDeleting(true);
        setDeleteError(null);
        await applicationService.adminDeleteApplication(applicationId, reason);
        onSuccess?.();
      } catch {
        setDeleteError("Failed to delete application.");
      } finally {
        setDeleting(false);
      }
    },
    [onSuccess],
  );

  return { deleteApplication, deleting, deleteError, clearDeleteError: () => setDeleteError(null) };
}

export function useAdminRestoreApplication(onSuccess?: () => void) {
  const [restoring, setRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  const restoreApplication = useCallback(async (applicationId: string) => {
    try {
      setRestoring(true);
      setRestoreError(null);
      await applicationService.adminRestoreApplication(applicationId);
      onSuccess?.();
    } catch {
      setRestoreError("Failed to restore application.");
    } finally {
      setRestoring(false);
    }
  }, [onSuccess]);

  return { restoreApplication, restoring, restoreError, clearRestoreError: () => setRestoreError(null) };
}
