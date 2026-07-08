"use client";

import { useState } from "react";
import { Briefcase, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";
import { useRouter, useSearchParams } from "next/navigation";
import { useJobFilters } from "@/hooks/useJobFilters";
import { locations } from "@/lib/location";

export function HomeHeroSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { page } = useJobFilters();

  const urlKeyword = searchParams.get("title") || "";
  const urlLocation = searchParams.get("location") || "";

  const [keyword, setKeyword] = useState(urlKeyword);

  const debouncedKeyword = useDebounce(keyword, 500);

  // computed value
  const location = urlLocation;

  // update URL khi keyword đổi
  const handleUpdateUrl = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (debouncedKeyword) params.set("title", debouncedKeyword);
    else params.delete("title");

    router.push(`/jobs?${params.toString()}`);
  };
  

  return (
    <div className="flex items-center rounded-lg border bg-white shadow-md">
      <div className="flex flex-1 items-center gap-2 px-4 py-3">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <select
          aria-label="Filter by location"
          value={location}
          onChange={(e) => {
            const params = new URLSearchParams(searchParams.toString());
            if (e.target.value) params.set("location", e.target.value);
            else params.delete("location");

            router.replace(`?${params.toString()}`);
          }}
          className="w-full bg-transparent text-sm outline-none"
        >
          <option value="">Location</option>
          {locations.map((loc) => (
            <option key={loc.value} value={loc.value}>
              {loc.label}
            </option>
          ))}
        </select>
      </div>

      <div className="h-8 w-px bg-border" />

      {/* Keyword */}
      <div className="flex flex-1 items-center gap-2 px-4 py-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onBlur={handleUpdateUrl}
          placeholder="Keyword"
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      <Button
        onClick={handleUpdateUrl}
        className="m-1 px-5 text-white"
      >
        Search
      </Button>
    </div>
  );
}