import FilterCheckboxItem from "@/components/jobs/filters/filter-checkbox-item";

type Item = {
  label: string;
  count: number;
};

type Props = {
  title: string;
  items: Item[];
};

const FilterCheckboxGroup = ({ title, items }: Props) => {
  return (
    <div className="border-t pt-4 mt-4">
      <h4 className="font-medium mb-2">{title}</h4>

      {items.map((item, index) => (
        <FilterCheckboxItem key={index} label={item.label} count={item.count} />
      ))}
    </div>
  );
};

export default FilterCheckboxGroup;
