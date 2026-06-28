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
import { getPagination } from "@/lib/utils";
import { SearchX } from "lucide-react";

export default function JobsPageClient() {
  const { page, pageSize, filters, buildUrl } = useJobFilters();

  const { jobs, totalPages, total, loading } = useJobs(page, pageSize, filters);

  return (
    <div className="container mx-auto max-w-[1278px] px-4 py-10">
      <JobsHeadPage />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-10">
        {/* Sidebar */}
        <aside className="md:col-span-3 self-start sticky top-24">
          <div className="max-h-[calc(100vh-96px)] overflow-y-auto pr-2">
            <JobNavbar />
          </div>
        </aside>

        {/* Job List */}
        <main className="md:col-span-9">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-500">
            Loading jobs...
          </div>
        ) : total === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-xl bg-white">
             <div className="p-4 rounded-full bg-gray-100 mb-4">
              <SearchX className="w-10 h-10 text-gray-500" />
            </div>

            <h2 className="text-lg font-semibold text-gray-700">
              No jobs found
            </h2>

            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              We couldn’t find any job matching your current filters. Try adjusting your search or filters.
            </p>

            <button
              onClick={() => window.location.href = "/jobs"}
              className="mt-5 px-4 py-2 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <>
            <JobList
              jobs={jobs}
              page={page}
              pageSize={pageSize}
              total={total}
              totalPages={totalPages}
              loading={loading}
            />

            <div className="mt-8 flex justify-center">
              <Pagination>
                <PaginationContent className="gap-1">
                  <PaginationItem>
                    <PaginationPrevious
                      href={buildUrl(page - 1)}
                      className={
                        page === 1 ? "pointer-events-none opacity-50" : ""
                      }
                    />
                  </PaginationItem>

                  {getPagination(page, totalPages).map((p, index) => (
                    <PaginationItem key={index}>
                      {p === "..." ? (
                        <span className="px-2 text-gray-400">…</span>
                      ) : (
                        <PaginationLink
                          href={buildUrl(p as number)}
                          isActive={p === page}
                        >
                          {p}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

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
          </>
        )}
      </main>
      </div>
    </div>
  );
}