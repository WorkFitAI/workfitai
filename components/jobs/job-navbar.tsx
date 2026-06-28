import FilterHeader from "@/components/jobs/filters/filter-header";
import FilterCheckboxGroup from "@/components/jobs/filters/filter-checkbox-group";
import FilterSalaryRange from "@/components/jobs/filters/filter-salary-range";
import FilterSkills from "@/components/jobs/filters/filter-skills";
import FilterJobCategory from "@/components/jobs/filters/filter-job-category";

const experienceLevel = [
  { label: "FRESHER"},
  { label: "JUNIOR"},
  { label: "MID" },
  { label: "SENIOR" },
  { label: "LEAD" },
];

const employmentTypes = [
  { label: "FULL_TIME" },
  { label: "PART_TIME" },
  { label: "CONTRACT"  },
  { label: "INTERN"  },
  { label: "REMOTE" },
];

const JobNavbar = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <FilterHeader title="Advance Filter" action="Reset" />

      {/* Industry filter */}
      <FilterCheckboxGroup
        title="Experience Level"
        items={experienceLevel}
        queryKey="experienceLevel"
      />

      {/* Salary filter */}
      <FilterSalaryRange title="Salary Range" queryKey="salaryMin" />

      {/* Employment type filter */}
      <FilterCheckboxGroup
        title="Employment Type"
        items={employmentTypes}
        queryKey="employmentType"
      />

      <FilterSkills />

      <FilterJobCategory/>
    </div>
  );
};

export default JobNavbar;
