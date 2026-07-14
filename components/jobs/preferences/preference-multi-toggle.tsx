"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

interface Props {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  formatLabel?: (value: string) => string;
}

const defaultFormatLabel = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export default function PreferenceMultiToggle({
  options,
  selected,
  onToggle,
  formatLabel = defaultFormatLabel,
}: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = selected.includes(option);

        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-sm font-medium transition-all cursor-pointer",
              isActive
                ? "bg-blue-500 border-blue-500 text-white shadow-sm"
                : "border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600"
            )}
          >
            {isActive && <Check className="h-3.5 w-3.5" />}
            {formatLabel(option)}
          </button>
        );
      })}
    </div>
  );
}
