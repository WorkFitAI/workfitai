type Props = {
  label: string;
  value: string;
  checked: boolean;
  onChange: (value: string, checked: boolean) => void;
};

const FilterCheckboxItem = ({
  label,
  value,
  checked,
  onChange,
}: Props) => {
  return (
    <label className="flex items-center justify-between py-2 cursor-pointer">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          className="w-4 h-4 cursor-pointer"
          checked={checked}
          onChange={(e) => onChange(value, e.target.checked)}
        />

        <span className="text-sm text-gray-600">{label}</span>
      </div>
    </label>
  );
};

export default FilterCheckboxItem;
