"use client";

import { useEffect, useState } from "react";
import { Search, X, Check, Loader2 } from "lucide-react";

import { jobService } from "@/lib/job/job-service";
import { useDebounce } from "@/hooks/useDebounce";
import { Skill } from "@/types/skill";
import { cn } from "@/lib/utils";

interface Props {
  selected: string[];
  onToggle: (skillName: string) => void;
}

const VISIBLE_LIMIT = 12;

export default function PreferenceSkillPicker({ selected, onToggle }: Props) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const debouncedSearch = useDebounce(search.trim(), 300);

  // Server-side search: every keystroke (debounced) re-queries
  // `GET /job/public/skills?filter=name~~'<keyword>'` instead of filtering a
  // client-cached list, so results stay accurate as the skills catalog grows.
  useEffect(() => {
    let cancelled = false;

    const fetchSkills = async () => {
      setLoading(true);
      try {
        const res = await jobService.getAllSkills(0, 50, debouncedSearch || undefined);
        if (cancelled) return;
        setSkills(res.data.result || []);
        setShowAll(false);
      } catch (error) {
        console.error("Fetch skills error:", error);
        if (!cancelled) setSkills([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSkills();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch]);

  const visible = showAll ? skills : skills.slice(0, VISIBLE_LIMIT);
  const hiddenCount = skills.length - visible.length;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search skills (React, SQL, Figma...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-9 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 animate-spin" />
        )}
      </div>

      {selected.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-slate-400">
            {selected.length} skill{selected.length > 1 ? "s" : ""} selected
          </p>
          <div className="flex flex-wrap gap-2">
            {selected.map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500 text-white text-xs font-medium"
              >
                {name}
                <button
                  type="button"
                  onClick={() => onToggle(name)}
                  className="cursor-pointer hover:opacity-80"
                  aria-label={`Remove ${name}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {loading && skills.length === 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-9 rounded-full bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {visible.map((skill) => {
              const isActive = selected.includes(skill.name);

              return (
                <button
                  key={skill.skillId}
                  type="button"
                  onClick={() => onToggle(skill.name)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-all cursor-pointer truncate",
                    isActive
                      ? "bg-blue-50 border-blue-400 text-blue-700"
                      : "border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600"
                  )}
                >
                  {isActive && <Check className="w-3.5 h-3.5 shrink-0" />}
                  <span className="truncate">{skill.name}</span>
                </button>
              );
            })}

            {!loading && skills.length === 0 && (
              <p className="col-span-full text-sm text-slate-400 py-2">
                {debouncedSearch
                  ? <>No skill matches &ldquo;{debouncedSearch}&rdquo;.</>
                  : "No skills available right now."}
              </p>
            )}
          </div>

          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="text-sm text-blue-500 hover:underline cursor-pointer"
            >
              Show {hiddenCount} more
            </button>
          )}
        </>
      )}
    </div>
  );
}
