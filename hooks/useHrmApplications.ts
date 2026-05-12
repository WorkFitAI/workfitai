"use client";

import { useCallback, useEffect, useState } from "react";
import { applicationService } from "@/lib/application/application-service";
import type { Application, ApplicationStatus, HRUser } from "@/types/application";

// ─── Company applications (HRM only) ──────────────────────────────────────

export function useCompanyApplications(
  companyNo: string,
  page: number,
  pageSize = 50,
  statusFilter?: ApplicationStatus,
) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!companyNo) return;
    try {
      setLoading(true);
      setError(null);
      // API is 0-indexed; UI pagination is 1-indexed
      const res = await applicationService.getCompanyApplications(
        companyNo,
        page - 1,
        pageSize,
      );
      let items = res.data?.items ?? [];
      if (statusFilter) {
        items = items.filter((a) => a.status === statusFilter);
      }
      setApplications(items);
      setTotalPages(res.data?.meta.totalPages ?? 1);
      setTotal(res.data?.meta.totalElements ?? 0);
    } catch {
      setError("Failed to load applications.");
    } finally {
      setLoading(false);
    }
  }, [companyNo, page, pageSize, statusFilter]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { applications, totalPages, total, loading, error, refresh: fetch };
}

// ─── Company HR users (for assignment dropdown) ────────────────────────────

export function useCompanyHRUsers(companyNo: string) {
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

// ─── Assigned applications (HR only) ──────────────────────────────────────

export function useAssignedApplications(
  hrUsername: string,
  page: number,
  pageSize = 20,
) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!hrUsername) return;
    try {
      setLoading(true);
      setError(null);
      const res = await applicationService.getAssignedApplications(
        hrUsername,
        page - 1,
        pageSize,
      );
      setApplications(res.data?.items ?? []);
      setTotalPages(res.data?.meta.totalPages ?? 1);
      setTotal(res.data?.meta.totalElements ?? 0);
    } catch {
      setError("Failed to load assigned applications.");
    } finally {
      setLoading(false);
    }
  }, [hrUsername, page, pageSize]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { applications, totalPages, total, loading, error, refresh: fetch };
}
