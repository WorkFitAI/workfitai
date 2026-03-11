"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { useJobs } from "@/hooks/useJobs";

import JobsHeadPage from "@/components/jobs/head-page";
import JobList from "@/components/jobs/job-list";
import JobNavbar from "@/components/jobs/job-navbar";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function JobsPage() {
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const pageSize = Number(searchParams.get("size")) || 12;
  const experienceLevel = searchParams.get("experienceLevel")
    ? searchParams.get("experienceLevel")!.split(",")
    : [];
  const employmentType = searchParams.get("employmentType")
    ? searchParams.get("employmentType")!.split(",")
    : [];

  const buildUrl = (newPage: number, newSize?: number) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("page", String(newPage));

    if (newSize) {
      params.set("size", String(newSize));
    }

    return `?${params.toString()}`;
  };
  const filters = useMemo(() => {
    return {
      experienceLevel,
      employmentType,
    };
  }, [experienceLevel, employmentType]);

  const { jobs, totalPages, total, loading } = useJobs(page, pageSize, filters);
  return (
    <div className="container mx-auto px-4 py-10 max-w-[1278px]">
      <JobsHeadPage />
      <div className="py-10 grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Navbar */}
        <div className="md:col-span-3">
          <JobNavbar />
        </div>

        {/* Job Listings */}
        <div className="md:col-span-9">
          <JobList
            jobs={jobs}
            page={page}
            pageSize={pageSize}
            total={total}
            totalPages={totalPages}
            loading={loading}
          />

          {/* Pagination */}
          <div className="mt-5 flex justify-center items-center md:col-span-12">
            <Pagination>
              <PaginationContent>
                {/* Previous */}
                <PaginationItem>
                  <PaginationPrevious
                    href={buildUrl(page - 1)}
                    className={
                      page === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <PaginationItem key={p}>
                      <PaginationLink href={buildUrl(p)} isActive={p === page}>
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}

                {/* Next */}
                <PaginationItem>
                  <PaginationNext
                    href={buildUrl(page + 1)}
                    className={
                      page === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </div>
  );
}
