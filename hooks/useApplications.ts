"use client";

import { useEffect, useState, useCallback } from "react";
import { Application, ApplicationStatus } from "@/types/application";
import { applicationService } from "@/lib/application/application-service";

export const useApplications = (
  page: number,
  pageSize: number,
  statusFilter?: ApplicationStatus
) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // API is 0-indexed; our UI pagination is 1-indexed
      const res = await applicationService.getMyApplications(
        page - 1,
        pageSize,
        statusFilter
      );
      setApplications(res.data?.items ?? []);
      setTotalPages(res.data?.meta.totalPages ?? 1);
      setTotal(res.data?.meta.totalElements ?? 0);

    } catch (err) {
      console.error("Fetch applications error:", err);
      setError("Failed to load applications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return {
    applications,
    totalPages,
    total,
    loading,
    error,
    refresh: fetchApplications,
  };
};
