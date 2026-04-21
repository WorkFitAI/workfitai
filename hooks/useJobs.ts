"use client";

import { useEffect, useState } from "react";

import { Job } from "@/types/job";
import { jobService } from "@/lib/job/job-service";

type Filters = {
  experienceLevel?: string[];
  employmentType?: string[];
  skillNames?: string[];
  title?: string;
  salaryMin?: number;
  salaryMax?: number;
  location?: string;
  status?: string;
  sort?: string;
};

export const useJobs = (
  page: number,
  pageSize: number,
  filters?: Filters,
  role?: string
) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const buildFilter = () => {
    const conditions: string[] = [];

    const buildCondition = (key: string, values?: string[]) => {
      if (!values || values.length === 0) return;

      if (key === "skillNames") {
        const list = values.map((v) => `'${v}'`).join(",");
        conditions.push(`${key} in [${list}]`);
        return;
      }

      if (values.length === 1 && key !== "skillNames") {
        conditions.push(`${key}:'${values[0]}'`);
      } else {
        const list = values.map((v) => `'${v}'`).join(",");
        conditions.push(`${key} in [${list}]`);
      }
    };

    buildCondition("experienceLevel", filters?.experienceLevel);
    buildCondition("employmentType", filters?.employmentType);
    buildCondition("skills.name", filters?.skillNames);

    if (filters?.title) {
      conditions.push(`title~~'${filters.title}'`);
    }

    if (filters?.salaryMin) {
      conditions.push(`salaryMin >: ${filters.salaryMin}`);
    }

    if (filters?.salaryMax) {
      conditions.push(`salaryMax :< ${filters.salaryMax}`);
    }

    if (filters?.location) {
      conditions.push(`company.address~'${filters.location}'`);
    }

    if (filters?.status) {
      conditions.push(`status:'${filters.status}'`);
    }

    return conditions.join(" and ");
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);

      const filter = buildFilter();

      const res = await jobService.getJobs({
        page,
        pageSize,
        filter,
        role,
        sort: filters?.sort
      });

      setJobs(res.data.result);
      setTotalPages(res.data.meta.pages);
      setTotal(res.data.meta.total);
    } catch (error) {
      console.error("Fetch jobs error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [
    page,
    pageSize,
    filters?.experienceLevel?.join(","),
    filters?.employmentType?.join(","),
    filters?.skillNames?.join(","),
    filters?.title,
    filters?.salaryMin,
    filters?.salaryMax,
    filters?.location,
    filters?.status,
    filters?.sort,
  ]);

  return {
    jobs,
    page,
    totalPages,
    loading,
    pageSize,
    total,
    refetch: fetchJobs
  };
};