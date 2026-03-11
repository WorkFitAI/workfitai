"use client";

import { useEffect, useState } from "react";
import { getJobs } from "@/app/api/job-api";
import { Job } from "@/types/job";

export const useJobs = (page: number) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [loading, setLoading] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);

      const res = await getJobs({ page });

      console.log(res.data);

      setJobs(res.data.result);
      setTotalPages(res.data.meta.pages);
      setPageSize(res.data.meta.pageSize);
    } catch (error) {
      console.error("Fetch jobs error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page]);

  return {
    jobs,
    page,
    totalPages,
    loading,
    pageSize,
  };
};