import FilterHeader from "@/components/jobs/filters/filter-header";
import FilterCheckboxGroup from "@/components/jobs/filters/filter-checkbox-group";
import FilterSalaryRange from "@/components/jobs/filters/filter-salary-range";

const experienceLevel = [
  { label: "FRESHER", count: 9 },
  { label: "JUNIOR", count: 12 },
  { label: "MID", count: 23 },
  { label: "SENIOR", count: 43 },
  { label: "LEAD", count: 43 },
];

const employmentTypes = [
  { label: "FULL_TIME", count: 24 },
  { label: "PART_TIME", count: 45 },
  { label: "CONTRACT", count: 56 },
  { label: "INTERN", count: 45 },
  { label: "REMOTE", count: 26 },
];

const JobNavbar = () => {
  return (
    <div className="bg-white p-2">
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
    </div>
  );
};

export default JobNavbar;
