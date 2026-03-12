"use client";

import JobListCard from "@/components/jobs/job-list-card";
import JobToolbar from "@/components/jobs/job-tool-bar";

import { Job } from "@/types/job";

type Props = {
  jobs: Job[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  loading: boolean;
};

const JobList = ({
  jobs,
  page,
  pageSize,
  total,
  totalPages,
  loading,
}: Props) => {
  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4">
      {/* Toolbar */}
      <JobToolbar
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        total={total}
      />

      <div className="border-t"></div>

      {/* Job Cards */}
      <div className="flex flex-col gap-4 mt-10">
        {jobs.map((job) => (
          <JobListCard key={job.postId} job={job} />
        ))}
      </div>
    </div>
  );
};

export default JobList;
