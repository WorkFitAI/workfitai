"use client";

import { useCallback, useEffect, useState } from "react";
import { applicationService } from "@/lib/application/application-service";
import type { Application, ApplicationStatus, HRUser, HRJobItem, HRCandidateItem } from "@/types/application";

// ─── Company applications (HRM only) ──────────────────────────────────────

export function useCompanyApplications(
  companyNo: string,
  page: number,
  pageSize = 50,
  statusFilter?: ApplicationStatus,
  jobTitle?: string,
  keyword?: string,
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
        statusFilter,
        undefined,
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
  }, [companyNo, page, pageSize, statusFilter, jobTitle, keyword]);

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

// ─── HR jobs (assigned to HR user) ────────────────────────────────────────

export function useHRJobs(page: number, pageSize = 20, jobTitle?: string) {
  const [jobs, setJobs] = useState<HRJobItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await applicationService.getHRJobs(page - 1, pageSize, jobTitle);
      setJobs(res.data?.items ?? []);
      setTotalPages(res.data?.meta.totalPages ?? 1);
      setTotal(res.data?.meta.totalElements ?? 0);
    } catch {
      setError("Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, jobTitle]);

  useEffect(() => { fetch(); }, [fetch]);
  return { jobs, totalPages, total, loading, error, refresh: fetch };
}

// ─── HR candidates (assigned to HR user) ──────────────────────────────────

export function useHRCandidates(page: number, pageSize = 20, status?: ApplicationStatus) {
  const [candidates, setCandidates] = useState<HRCandidateItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await applicationService.getHRCandidates(page - 1, pageSize, status);
      setCandidates(res.data?.items ?? []);
      setTotalPages(res.data?.meta.totalPages ?? 1);
      setTotal(res.data?.meta.totalElements ?? 0);
    } catch {
      setError("Failed to load candidates.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, status]);

  useEffect(() => { fetch(); }, [fetch]);
  return { candidates, totalPages, total, loading, error, refresh: fetch };
}

// ─── HRM company jobs ──────────────────────────────────────────────────────

export function useCompanyJobs(companyNo: string, page: number, pageSize = 20, jobTitle?: string) {
  const [jobs, setJobs] = useState<HRJobItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!companyNo) return;
    try {
      setLoading(true);
      setError(null);
      const res = await applicationService.getCompanyJobs(companyNo, page - 1, pageSize, jobTitle);
      setJobs(res.data?.items ?? []);
      setTotalPages(res.data?.meta.totalPages ?? 1);
      setTotal(res.data?.meta.totalElements ?? 0);
    } catch {
      setError("Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  }, [companyNo, page, pageSize, jobTitle]);

  useEffect(() => { fetch(); }, [fetch]);
  return { jobs, totalPages, total, loading, error, refresh: fetch };
}

// ─── HRM company candidates ────────────────────────────────────────────────

export function useCompanyCandidates(companyNo: string, page: number, pageSize = 20, status?: ApplicationStatus) {
  const [candidates, setCandidates] = useState<HRCandidateItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!companyNo) return;
    try {
      setLoading(true);
      setError(null);
      const res = await applicationService.getCompanyCandidates(companyNo, page - 1, pageSize, status);
      setCandidates(res.data?.items ?? []);
      setTotalPages(res.data?.meta.totalPages ?? 1);
      setTotal(res.data?.meta.totalElements ?? 0);
    } catch {
      setError("Failed to load candidates.");
    } finally {
      setLoading(false);
    }
  }, [companyNo, page, pageSize, status]);

  useEffect(() => { fetch(); }, [fetch]);
  return { candidates, totalPages, total, loading, error, refresh: fetch };
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
