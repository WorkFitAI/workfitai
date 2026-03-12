"use client";

import { useJobs } from "@/hooks/useJobs";
import { useJobFilters } from "@/hooks/useJobFilters";

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

export default function JobsPageClient() {
  const { page, pageSize, filters, buildUrl } = useJobFilters();

  const { jobs, totalPages, total, loading } = useJobs(page, pageSize, filters);

  return (
    <div className="container mx-auto px-4 py-10 max-w-[1278px]">
      <JobsHeadPage />

      <div className="py-10 grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-3">
          <JobNavbar />
        </div>

        <div className="md:col-span-9">
          <JobList
            jobs={jobs}
            page={page}
            pageSize={pageSize}
            total={total}
            totalPages={totalPages}
            loading={loading}
          />

          <div className="mt-5 flex justify-center items-center md:col-span-12">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href={buildUrl(page - 1)}
                    className={
                      page === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <PaginationItem key={p}>
                      <PaginationLink href={buildUrl(p)} isActive={p === page}>
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}

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
