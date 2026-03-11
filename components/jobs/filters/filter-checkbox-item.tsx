type Props = {
  label: string;
  count: number;
};

const FilterCheckboxItem = ({ label, count }: Props) => {
  return (
    <label className="flex items-center justify-between py-2 cursor-pointer">
      <div className="flex items-center gap-2">
        <input type="checkbox" className="w-4 h-4" />
        <span className="text-sm text-gray-600">{label}</span>
      </div>

      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
        {count}
      </span>
    </label>
  );
};

export default FilterCheckboxItem;
