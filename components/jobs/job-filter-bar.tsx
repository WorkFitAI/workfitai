"use client";

import { RotateCcw, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";

const JobFilterBar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("title") || "");

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (debouncedSearch) {
      params.set("title", debouncedSearch);
    } else {
      params.delete("title");
    }

    params.set("page", "1");
    params.set("size", "12");

    router.replace(`?${params.toString()}`);
  }, [debouncedSearch]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    params.set("page", "1");
    params.set("size", "12");

    router.replace(`?${params.toString()}`);
  };

  const handleReset = () => {
    setSearch("");
    router.replace("?");
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">

        {/* SEARCH */}
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search jobs..."
            className="w-full pl-9 pr-3 py-2.5 rounded-md border border-slate-200 focus:ring-2 focus:ring-blue-500 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap gap-3">

          {/* STATUS */}
          <select
            value={searchParams.get("status") || ""}
            onChange={(e) => updateParam("status", e.target.value)}
            className="px-3 py-2.5 rounded-md border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="PUBLISHED">Published</option>
            <option value="CLOSED">Closed</option>
            <option value="DRAFT">Draft</option>
          </select>

          {/* JOB TYPE */}
          <select
            value={searchParams.get("employmentType") || ""}
            onChange={(e) =>
              updateParam("employmentType", e.target.value)
            }
            className="px-3 py-2.5 rounded-md border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="FULL_TIME">Full-time</option>
            <option value="PART_TIME">Part-time</option>
            <option value="INTERNSHIP">Internship</option>
          </select>

          {/* SORT */}
          <select
            value={searchParams.get("sort") || "desc"}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="px-3 py-2.5 rounded-md border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="desc">Newest</option>
            <option value="asc">Oldest</option>
          </select>

          {/* RESET */}
          <button
            onClick={handleReset}
            className="px-4 py-2.5 text-sm text-slate-600 cursor-pointer"
          >
            <RotateCcw size={20} className="inline-block mr-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobFilterBar;