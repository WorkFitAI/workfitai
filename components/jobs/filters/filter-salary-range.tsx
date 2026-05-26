"use client";

import { useRouter, useSearchParams } from "next/navigation";

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

  const currency = searchParams.get("currency") ?? "USD";

  const rawValue = Number(searchParams.get(queryKey) ?? min);

  // convert URL -> UI
  const value =
    currency === "VND" ? rawValue / 10000 : rawValue;

  const displayValue =
    currency === "VND" ? value * 10000 : value;

  const updateQuery = (newValue: number, newCurrency?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    const cur = newCurrency ?? currency;

    const normalizedValue =
      cur === "VND" ? newValue * 10000 : newValue;

    params.set(queryKey, String(normalizedValue));
    params.set("currency", cur);
    params.set("page", "1");

    router.push(`?${params.toString()}`);
  };

  return (
    <div className="border-t pt-4 mt-4">
      <h4 className="font-medium mb-2">{title}</h4>

      {/* currency */}
      <div className="flex gap-4 mb-3 text-sm">
        <label>
          <input
            type="radio"
            checked={currency === "USD"}
            onChange={() => updateQuery(value, "USD")}
          />
          {' '}USD
        </label>

        <label>
          <input
            type="radio"
            checked={currency === "VND"}
            onChange={() => updateQuery(value, "VND")}
          />
          {' '}VND
        </label>
      </div>

      {/* slider */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => updateQuery(Number(e.target.value))}
        className="w-full cursor-pointer"
      />

      {/* display */}
      <div className="flex justify-between text-sm mt-2 text-gray-400">
        <span className="text-blue-600">
          {currency === "VND"
            ? `${displayValue.toLocaleString()} VND+`
            : `$${value}+`}
        </span>

        <span>
          {currency === "VND"
            ? `${(max * 10000).toLocaleString()} VND`
            : `$${max}`}
        </span>
      </div>
    </div>
  );
};

export default FilterSalaryRange;