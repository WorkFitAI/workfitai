"use client";

import { useEffect, useState } from "react";
import FilterCheckboxGroup from "@/components/jobs/filters/filter-checkbox-group";
import { jobService } from "@/lib/job/job-service";
import { Skill } from "@/types/skill";

import { toast } from "sonner";

const LIMIT = 5;

const FilterSkills = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await jobService.getAllSkills();
      setSkills(res.data.result);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSkill = async () => {
    if (!search.trim()) return;

    try {
      setLoading(true);

      // API create skill
      const res = await jobService.createSkill({
        name: search.trim(),
      });

      const newSkill = res.data;

      setSkills((prev) => [...prev, newSkill]);
      setSearch("");

      toast.success("Skill added successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add skill.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = skills.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const visibleSkills = showAll ? filtered : filtered.slice(0, LIMIT);

  const items = visibleSkills.map((s) => ({
    label: s.name,
    count: 0,
  }));

  return (
    <div className="border-t pt-4 mt-4">
      <h4 className="font-medium mb-2">Skills</h4>

      <input
        type="text"
        placeholder="Search skill..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded px-2 py-1 text-sm mb-3"
      />

      {filtered.length > 0 && (
        <FilterCheckboxGroup
          title=""
          items={items}
          queryKey="skillNames"
        />
      )}

      {/* Không tìm thấy */}
      {search.trim() !== "" && filtered.length === 0 && (
        <div className="text-sm">
          <p className="text-gray-500 mb-2">
            No skill found.
          </p>

          <button
            onClick={handleAddSkill}
            disabled={loading}
            className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Adding..." : `+ Add "${search}"`}
          </button>
        </div>
      )}

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