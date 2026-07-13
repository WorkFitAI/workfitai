"use client";

import { useEffect, useState } from "react";
import FilterCheckboxGroup from "@/components/jobs/filters/filter-checkbox-group";
import { jobService } from "@/lib/job/job-service";
import { Skill } from "@/types/skill";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";



const LIMIT = 10;

const FilterSkills = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  const debouncedSearch = useDebounce(search, 500);


  useEffect(() => {
    fetchSkills(0, "", false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSkills(0, debouncedSearch, false);
    }, 300);

    return () => clearTimeout(timer);
  }, [debouncedSearch]);

  const fetchSkills = async (
    pageNumber: number,
    keyword: string,
    append: boolean
  ) => {
    try {
      setLoading(true);

      const res = await jobService.getAllSkills(
        pageNumber,
        LIMIT,
        keyword.trim() || undefined
      );

      const { meta, result } = res.data;

      setSkills((prev) => (append ? [...prev, ...result] : result));

      setPage(pageNumber);
      setHasMore(meta.page < meta.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async () => {
    if (!search.trim()) return;

    try {
      setAdding(true);

      const res = await jobService.createSkill({
        name: search.trim(),
      });

      // Nếu createSkill trả về skill mới
      setSkills((prev) => [res.data?? res.data, ...prev]);

      setSearch("");

      toast.success("Skill added successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add skill.");
    } finally {
      setAdding(false);
    }
  };

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

      {skills.length > 0 && (
        <FilterCheckboxGroup
          title=""
          queryKey="skillNames"
          items={skills.map((skill) => ({
            label: skill.name,
            count: 0,
          }))}
        />
      )}

      {!loading && skills.length === 0 && search.trim() !== "" && (
        <div className="text-sm">
          <p className="text-gray-500 mb-2">
            No skill found.
          </p>

          <button
            onClick={handleAddSkill}
            disabled={adding}
            className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {adding ? "Adding..." : `+ Add "${search}"`}
          </button>
        </div>
      )}

      {hasMore && (
        <button
          onClick={() => fetchSkills(page + 1, search, true)}
          disabled={loading}
          className="text-sm text-blue-500 mt-2 hover:underline"
        >
          {loading ? "Loading..." : "Show more"}
        </button>
      )}
    </div>
  );
};

export default FilterSkills;