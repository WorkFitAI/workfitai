"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Check,
  Briefcase,
  Code2,
  Palette,
  TrendingUp,
  Megaphone,
  Database,
  ShieldCheck,
  Users,
  Wrench,
  LineChart,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { jobService } from "@/lib/job/job-service";
import { JobCategory } from "@/types/job";

interface Props {
  value?: string;
  onChange: (categoryName: string) => void;
}

// Deterministic icon + accent-color pair per category, cycled by name hash so
// the same category always renders the same visual across sessions/searches.
const VISUALS: { Icon: LucideIcon; classes: string }[] = [
  { Icon: Code2, classes: "bg-blue-50 text-blue-600" },
  { Icon: Palette, classes: "bg-purple-50 text-purple-600" },
  { Icon: TrendingUp, classes: "bg-emerald-50 text-emerald-600" },
  { Icon: Megaphone, classes: "bg-orange-50 text-orange-600" },
  { Icon: Database, classes: "bg-cyan-50 text-cyan-600" },
  { Icon: ShieldCheck, classes: "bg-rose-50 text-rose-600" },
  { Icon: Users, classes: "bg-indigo-50 text-indigo-600" },
  { Icon: Wrench, classes: "bg-amber-50 text-amber-600" },
  { Icon: LineChart, classes: "bg-teal-50 text-teal-600" },
  { Icon: Briefcase, classes: "bg-slate-100 text-slate-600" },
];

function getCategoryVisual(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return VISUALS[hash % VISUALS.length];
}

export default function PreferenceCategoryPicker({ value, onChange }: Props) {
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await jobService.getAllCategories();
        setCategories(res.data.result || []);
      } catch (error) {
        console.error("Fetch categories error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search a job category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[280px] overflow-y-auto pr-1">
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[76px] rounded-xl border border-slate-100 bg-slate-50 animate-pulse"
            />
          ))}

        {!loading &&
          filtered.map((category) => {
            const isActive = value === category.name;
            const { Icon, classes } = getCategoryVisual(category.name);

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onChange(isActive ? "" : category.name)}
                className={cn(
                  "relative flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all cursor-pointer",
                  isActive
                    ? "border-blue-500 bg-blue-50/60 ring-1 ring-blue-500"
                    : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/30"
                )}
              >
                {isActive && (
                  <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-white">
                    <Check className="h-2.5 w-2.5" />
                  </span>
                )}

                <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", classes)}>
                  <Icon className="h-4 w-4" />
                </span>

                <span className="text-sm font-medium text-slate-700 leading-tight line-clamp-2">
                  {category.name}
                </span>
              </button>
            );
          })}

        {!loading && filtered.length === 0 && (
          <div className="col-span-full py-8 text-center text-sm text-slate-400">
            {categories.length === 0
              ? "No categories available right now."
              : <>No category matches &ldquo;{search}&rdquo;.</>}
          </div>
        )}
      </div>
    </div>
  );
}
