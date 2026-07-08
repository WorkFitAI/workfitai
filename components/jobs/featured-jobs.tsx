"use client";

import { useEffect, useState } from "react";
import FeaturedJobCard from "@/components/jobs/featured/featured-job-card";
import { jobService } from "@/lib/job/job-service";
import { Job } from "@/types/job";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatSalary } from "@/lib/utils";

export default function FeaturedJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const size = 4;

  useEffect(() => {
    const load = async () => {
      const { data } = await jobService.getFeaturedJobs(page, size);

      setJobs(data.result);
      setTotalPages(data.meta.pages);
    };

    load();
  }, [page]);

  return (
    <section className="max-w-7xl mx-auto py-20">
      {/* header */}
      <div className="mb-5">
        <h2 className="text-2xl font-bold">Featured Jobs</h2>
        <p className="text-sm text-gray-500">
          Get the latest news, updates and tips
        </p>
      </div>

      {/* pagination */}
      <div className="flex justify-end gap-2 mb-5">
        <button
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
          className="px-2 py-2 border rounded-md disabled:opacity-50"
        >
          <ChevronLeft />
        </button>

        <button
          disabled={page === totalPages - 1}
          onClick={() => setPage(page + 1)}
          className="px-2 py-2 border rounded-md disabled:opacity-50"
        >
          <ChevronRight />
        </button>
      </div>

      {/* job list */}
      <div className="grid grid-cols-4 gap-6">
        {jobs.map((job) => {
        const symbol = job.currency === "USD" ? "$" : "đ";

        return (
            <FeaturedJobCard
              key={job.postId}
              postId={job.postId}
              logo={job.company.logoUrl}
              company={job.company.name}
              title={job.title}
              location={job.company.address}
              salary={`${symbol}${formatSalary(job.salaryMin)} - ${symbol}${formatSalary(job.salaryMax)}`}
              description={job.shortDescription}
              skills={job.skillNames}
            />
          );
        })}
      </div>
    </section>
  );
}