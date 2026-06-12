"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  title: string;
  action?: string;
};

const FilterHeader = ({ title, action }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleReset = () => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("experienceLevel");
    params.delete("employmentType");
    params.delete("keyword");
    params.delete("salaryMin");
    params.delete("salaryMax");
    params.delete("skillNames");
    params.delete("location");
    params.delete("status");
    params.delete("sort");
    params.delete("hrName");
    params.delete("categoryName");

    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-semibold text-gray-800">{title}</h3>

      {action && (
        <button
          onClick={handleReset}
          className="text-sm text-blue-500 hover:text-gray-700 cursor-pointer"
        >
          {action}
        </button>
      )}
    </div>
  );
};

export default FilterHeader;
