"use client";

import { useEffect, useState } from "react";
import SimilarJobCard from "@/components/jobs/detail/similar-jobs-card";
import { getSimilarJobs } from "@/app/api/job-api";
import { Job } from "@/types/job";
type Props = {
  jobId: string;
};

export default function SimilarJobs({ jobId }: Props) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSimilarJobs = async () => {
      try {
        const res = await getSimilarJobs(jobId);
        console.log("Similar jobs response:", res);
        setJobs(res?.data);
      } catch (error) {
        console.error("Failed to fetch similar jobs", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarJobs();
  }, [jobId]);

  if (loading) {
    return <div className="p-5 border rounded-xl">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-xl border p-5">
      <h3 className="font-semibold text-gray-800 mb-4">Similar jobs</h3>

      {jobs.map((job) => (
        <SimilarJobCard
          key={job?.postId}
          id={job?.postId}
          title={job.title}
          company={job.company.name}
          location={job.company.address}
          salary={`${job.salaryMin} - ${job.salaryMax}`}
          type={job.employmentType}
          logo={job.company.logoUrl}
        />
      ))}
    </div>
  );
}
