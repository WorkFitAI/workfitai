"use client";

import { Funnel } from "lucide-react";
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
    <div className="flex items-center justify-between px-0 text-black">
      <div className="flex items-center gap-2">
        <Funnel className="w-5 h-5" />
        <h3 className="font-semibold">{title}</h3>
      </div>

      {action && (
        <button
          onClick={handleReset}
          className="text-sm text-blue-400 hover:text-blue-100"
        >
          {action}
        </button>
      )}
    </div>
  );
};

export default FilterHeader;
