"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export const useJobFilters = () => {
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("size")) || 12;

  const experienceLevel = searchParams.get("experienceLevel")
    ? searchParams.get("experienceLevel")!.split(",")
    : [];

  const employmentType = searchParams.get("employmentType")
    ? searchParams.get("employmentType")!.split(",")
    : [];

  const skillNames = searchParams.get("skillNames")
    ? searchParams.get("skillNames")!.split(",")
    : [];

  const salaryMin = searchParams.get("salaryMin")
    ? Number(searchParams.get("salaryMin"))
    : undefined;

  const salaryMax = searchParams.get("salaryMax")
    ? Number(searchParams.get("salaryMax"))
    : undefined;

  const filters = useMemo(() => {
    return {
      experienceLevel,
      employmentType,
      skillNames,
      salaryMin,
      salaryMax,
    };
  }, [experienceLevel, employmentType, skillNames, salaryMin, salaryMax]);

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