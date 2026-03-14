"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import JobDetailThumb from "@/components/jobs/detail/job-detail-thumb";
import JobDetailHead from "@/components/jobs/detail/job-detail-head";
import JobDetailOverview from "@/components/jobs/detail/job-detail-overview";
import JobDetailContent from "@/components/jobs/detail/job-detail-content";
import SimilarJobsCard from "@/components/jobs/detail/similar-jobs-card";
import JobLocationMap from "@/components/jobs/detail/job-location-map";
import CompanyCard from "@/components/jobs/detail/company-card";
import { JobDetail } from "@/types/job";

import { getJobById } from "@/app/api/job-api";

import { CheckCircle } from "lucide-react";

const JobDetailPageClient = () => {
  const { id } = useParams();

  const [job, setJob] = useState<JobDetail | null>(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!id || typeof id !== "string") return;

      try {
        const res = await getJobById(id);
        setJob(res.data);
      } catch (error) {
        console.error("Error fetching job details", error);
      }
    };

    fetchJobDetails();
  }, [id]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-[1320px] mx-auto px-4 pb-10">
        <JobDetailThumb bannerUrl={job?.bannerUrl || null} />
        <JobDetailHead
          title={job?.title || ""}
          employmentType={job?.employmentType || ""}
          createdDate={job?.createdDate || ""}
        />
        <div className="grid grid-cols-12 gap-10 mt-10">
          {/* Content */}
          <div className="col-span-8">
            <JobDetailOverview
              employmentType={job?.employmentType || ""}
              experienceLevel={job?.experienceLevel || ""}
              salaryMin={job?.salaryMin || 0}
              salaryMax={job?.salaryMax || 0}
              currency={job?.currency || "USD"}
              location={job?.location || ""}
              requiredExperience={job?.requiredExperience || ""}
              educationLevel={job?.educationLevel || ""}
              expiresAt={job?.expiresAt || ""}
            />
            <JobDetailContent
              description={job?.description || ""}
              requirements={job?.requirements || ""}
              responsibilities={job?.responsibilities || ""}
              benefits={job?.benefits || ""}
              skillNames={job?.skillNames || []}
            />
          </div>

          {/* Sidebar */}
          <div className="col-span-4">
            {job?.company && (
              <CompanyCard
                company={job.company}
                quantity={job.quantity}
                totalApplications={job.totalApplications}
              />
            )}
            <JobLocationMap />
            <SimilarJobsCard />
          </div>
        </div>
        <div className="flex justify-start mt-10 mx-auto gap-2">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition">
            <CheckCircle className="w-4 h-4 inline-block mr-2" />
            Apply Now
          </button>
          <button className=" text-gray-500 px-6 py-3 border border-gray-500 rounded-md hover:bg-gray-100 font-medium transition">
            Save Job
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPageClient;
