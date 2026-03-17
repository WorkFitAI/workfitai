import JobDetailThumb from "@/components/jobs/detail/job-detail-thumb";
import JobDetailHead from "@/components/jobs/detail/job-detail-head";
import JobDetailOverview from "@/components/jobs/detail/job-detail-overview";
import JobDetailContent from "@/components/jobs/detail/job-detail-content";
import CompanyCard from "@/components/jobs/detail/company-card";

import { getJobById } from "@/app/api/job-api";
import SimilarJobs from "@/components/jobs/detail/similar-jobs";
import FeaturedJobs from "@/components/jobs/featured-jobs";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function JobDetail({ params }: Props) {
  const { id } = await params;

  let job = null;

  try {
    const res = await getJobById(id);
    job = res.data;
  } catch (error) {
    console.error("Error fetching job details", error);
  }

  if (!job) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold">Job not found</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-[1320px] mx-auto px-4 pb-10">
        <JobDetailThumb bannerUrl={job.bannerUrl || null} />

        <JobDetailHead
          title={job.title}
          employmentType={job.employmentType}
          createdDate={job.createdDate}
        />

        <div className="grid grid-cols-12 gap-10 mt-10">
          {/* Content */}
          <div className="col-span-8">
            <JobDetailOverview
              employmentType={job.employmentType}
              experienceLevel={job.experienceLevel}
              salaryMin={job.salaryMin}
              salaryMax={job.salaryMax}
              currency={job.currency}
              location={job.location}
              requiredExperience={job.requiredExperience}
              educationLevel={job.educationLevel}
              expiresAt={job.expiresAt}
            />

            <JobDetailContent
              description={job.description}
              requirements={job.requirements}
              responsibilities={job.responsibilities}
              benefits={job.benefits}
              skillNames={job.skillNames}
            />
          </div>

          {/* Sidebar */}
          <div className="col-span-4">
            {job.company && (
              <CompanyCard
                company={job.company}
                quantity={job.quantity}
                totalApplications={job.totalApplications}
              />
            )}

            <SimilarJobs jobId={id} />
          </div>
        </div>
        <FeaturedJobs />
      </div>
    </div>
  );
}
