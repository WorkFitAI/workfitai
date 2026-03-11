const FilterSalaryRange = () => {
  return (
    <div className="border-t pt-4 mt-4">
      <h4 className="font-medium mb-2">Salary Range</h4>

      <input type="range" min="0" max="500" className="w-full" />

      <div className="flex justify-between text-sm mt-2">
        <span>$0</span>
        <span>$500</span>
      </div>
    </div>
  );
};

export default FilterSalaryRange;
