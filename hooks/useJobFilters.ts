"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export const useJobFilters = () => {
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("size")) || 12;

  const filters = useMemo(() => {
    const experienceLevel = searchParams.get("experienceLevel")?.split(",") ?? [];
    const employmentType = searchParams.get("employmentType")?.split(",") ?? [];
    const skillNames = searchParams.get("skillNames")?.split(",") ?? [];

    const salaryMin = searchParams.get("salaryMin")
      ? Number(searchParams.get("salaryMin"))
      : undefined;

    const salaryMax = searchParams.get("salaryMax")
      ? Number(searchParams.get("salaryMax"))
      : undefined;

    const title = searchParams.get("title") || undefined;

    const jobCategoryName = searchParams.get("categoryName") || undefined;

    const location = searchParams.get("location") || undefined;

    const status = searchParams.get("status") || undefined;

    const sort = searchParams.get("sort") || "desc";

    const hrName = searchParams.get("hrName") || undefined;

    return {
      experienceLevel,
      employmentType,
      skillNames,
      salaryMin,
      salaryMax,
      title,
      location,
      status,
      sort,
      hrName,
      jobCategoryName,
    };
  }, [searchParams]);

  const buildUrl = (newPage: number, newSize?: number) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("page", String(newPage));

    if (newSize) {
      params.set("size", String(newSize));
    }

    return `?${params.toString()}`;
  };

  return {
    page,
    pageSize,
    filters,
    buildUrl,
  };
};