import JobListCard from "@/components/jobs/job-list-card";
import JobToolbar from "@/components/jobs/job-tool-bar";

const JobListPage = () => {
  return (
    <div className="container mx-auto px-4">
      {/* Sort */}
      <JobToolbar />
      <div className="border-t"></div>
      {/* Job Cards */}
      <div className="flex flex-col gap-4 mt-10">
        <JobListCard />
        <JobListCard />
        <JobListCard />
        <JobListCard />
        <JobListCard />
        <JobListCard />
        <JobListCard />
        <JobListCard />
        <JobListCard />
        <JobListCard />
      </div>
    </div>
  );
};

export default JobListPage;
