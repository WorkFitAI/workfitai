import JobsHeadPage from "@/components/jobs/head-page";
import JobListPage from "@/components/jobs/job-list-page";
import JobNavbar from "@/components/jobs/job-navbar";

export default function JobsPage() {
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
          <JobListPage />
        </div>
      </div>
    </div>
  );
}
