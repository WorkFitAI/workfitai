"use client";

import { useEffect, useState } from "react";
import FilterCheckboxGroup from "@/components/jobs/filters/filter-checkbox-group";
import { getAllSkills } from "@/app/api/job-api";
import { Skill } from "@/types/skill";

const LIMIT = 5;

const FilterSkills = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await getAllSkills();
        setSkills(res.data.result);
      } catch (err) {
        throw new Error("Fetch skills error:" + err);
      }
    };

    fetchSkills();
  }, []);

  const filtered = skills.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  const visibleSkills = showAll ? filtered : filtered.slice(0, LIMIT);

  const items = visibleSkills.map((s) => ({
    label: s.name,
    count: 0,
  }));

  return (
    <div className="border-t pt-4 mt-4">
      <h4 className="font-medium mb-2">Skills</h4>

      {/* Search */}
      <input
        type="text"
        placeholder="Search skill..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded px-2 py-1 text-sm mb-3"
      />

      {/* Checkbox list */}
      <FilterCheckboxGroup title="" items={items} queryKey="skillNames" />

      {/* Show more */}
      {filtered.length > LIMIT && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-sm text-blue-500 mt-2 hover:underline"
        >
          {showAll ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
};

export default FilterSkills;
