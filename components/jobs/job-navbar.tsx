import FilterHeader from "@/components/jobs/filters/filter-header";
import FilterCheckboxGroup from "@/components/jobs/filters/filter-checkbox-group";
import FilterSalaryRange from "@/components/jobs/filters/filter-salary-range";

const industries = [
  { label: "All", count: 9 },
  { label: "Software", count: 12 },
  { label: "Finance", count: 23 },
  { label: "Recruiting", count: 43 },
];

const keywords = [
  { label: "Software", count: 24 },
  { label: "Developer", count: 45 },
  { label: "Web", count: 56 },
];

const JobNavbar = () => {
  return (
    <div className="bg-white p-2">
      <FilterHeader title="Advance Filter" action="Reset" />

      <FilterCheckboxGroup title="Industry" items={industries} />

      <FilterSalaryRange />

      <FilterCheckboxGroup title="Popular Keyword" items={keywords} />
    </div>
  );
};

export default JobNavbar;
