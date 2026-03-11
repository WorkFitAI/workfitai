"use client";

import { useSearchParams } from "next/navigation";
import JobListCard from "@/components/jobs/job-list-card";
import JobToolbar from "@/components/jobs/job-tool-bar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { useJobs } from "@/hooks/useJobs";

const JobListPage = () => {
  const searchParams = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;

  const { jobs, totalPages, pageSize } = useJobs(page);

  return (
    <div className="container mx-auto px-4">
      {/* Sort */}
      <JobToolbar page={page} totalPages={totalPages} pageSize={pageSize} />
      <div className="border-t"></div>
      {/* Job Cards */}
      <div className="flex flex-col gap-4 mt-10">
        {jobs.map((job) => (
          <JobListCard key={job.postId} job={job} />
        ))}
      </div>
      <div className="mt-5 flex justify-center">
        <Pagination>
          <PaginationContent>
            {/* Previous */}
            <PaginationItem>
              <PaginationPrevious
                href={`?page=${page - 1}`}
                className={page === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <PaginationItem key={p}>
                <PaginationLink href={`?page=${p}`} isActive={p === page}>
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}

            {/* Next */}
            <PaginationItem>
              <PaginationNext
                href={`?page=${page + 1}`}
                className={
                  page === totalPages ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default JobListPage;
