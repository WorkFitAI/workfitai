"use client";

import { useEffect, useState, useCallback } from "react";
import { CVMetadata } from "@/types/cv";
import { cvService } from "@/lib/cv/cv-service";
import { getSessionCookie } from "@/lib/auth/session-cookie";

const PAGE_SIZE = 10;

export const useCVs = (page: number) => {
  const [cvs, setCvs] = useState<CVMetadata[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCVs = useCallback(async () => {
    const session = getSessionCookie();
    if (!session?.username) {
      setError("Not authenticated.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await cvService.listMyCVs(session.username, page, PAGE_SIZE);
      setCvs(res.data?.result ?? []);
      setTotalPages(res.data?.meta?.pages ?? 1);
      setTotal(res.data?.meta?.total ?? 0);
    } catch {
      setError("Failed to load CVs. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchCVs();
  }, [fetchCVs]);

  return { cvs, totalPages, total, loading, error, refresh: fetchCVs };
};
