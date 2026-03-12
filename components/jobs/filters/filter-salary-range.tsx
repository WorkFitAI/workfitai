"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type Props = {
  title: string;
  queryKey: string;
  min?: number;
  max?: number;
  step?: number;
};

const FilterSalaryRange = ({
  title,
  queryKey,
  min = 100,
  max = 5000,
  step = 5,
}: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initial = Number(searchParams.get(queryKey) ?? min);
  const [value, setValue] = useState(initial);

  const updateQuery = () => {
    const params = new URLSearchParams(searchParams.toString());

    params.set(queryKey, String(value));
    params.set("page", "1");

    router.push(`?${params.toString()}`);
  };

  return (
    <div className="border-t pt-4 mt-4">
      <h4 className="font-medium mb-2">{title}</h4>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        onMouseUp={updateQuery}
        onTouchEnd={updateQuery}
        className="w-full cursor-pointer"
      />

      <div className="flex justify-between text-sm font-semibold mt-2 text-gray-400">
        <span className="text-blue-600">${Math.max(min, value)}+</span>
        <span>${max}</span>
      </div>
    </div>
  );
};

export default FilterSalaryRange;
