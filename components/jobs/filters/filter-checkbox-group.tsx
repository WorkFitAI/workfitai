"use client";

import { useRouter, useSearchParams } from "next/navigation";
import FilterCheckboxItem from "@/components/jobs/filters/filter-checkbox-item";

type Item = {
  label: string;
  count: number;
};

type Props = {
  title: string;
  items: Item[];
  queryKey: string; // vd: skill, location
};

const FilterCheckboxGroup = ({ title, items, queryKey }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (value: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());

    let values = params.get(queryKey)?.split(",") || [];

    if (checked) {
      values.push(value);
    } else {
      values = values.filter((v) => v !== value);
    }

    if (values.length > 0) {
      params.set(queryKey, values.join(","));
    } else {
      params.delete(queryKey);
    }

    router.push(`?${params.toString()}`);
  };

  const selected = searchParams.get(queryKey)?.split(",") || [];

  return (
    <div className="border-t pt-4 mt-4">
      <h4 className="font-medium mb-2">{title}</h4>

      {items.map((item, index) => (
        <FilterCheckboxItem
          key={index}
          label={item.label}
          count={item.count}
          value={item.label}
          checked={selected.includes(item.label)}
          onChange={handleChange}
        />
      ))}
    </div>
  );
};

export default FilterCheckboxGroup;
