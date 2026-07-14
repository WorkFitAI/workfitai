"use client";

import { cn } from "@/lib/utils";
import { PreferenceCurrency } from "@/types/job-preferences";

interface Props {
  salaryMin?: number;
  currency: PreferenceCurrency;
  onChange: (salaryMin: number | undefined, currency: PreferenceCurrency) => void;
  min?: number;
  max?: number;
  step?: number;
}

// Quick-pick presets per currency, normalized to the same units `onChange` expects.
const PRESETS: Record<PreferenceCurrency, number[]> = {
  USD: [500, 1000, 2000, 3000, 5000],
  VND: [5_000_000, 10_000_000, 20_000_000, 30_000_000, 50_000_000],
};

const formatPreset = (value: number, currency: PreferenceCurrency) =>
  currency === "VND" ? `${(value / 1_000_000).toFixed(0)}M+` : `$${value.toLocaleString()}+`;

export default function PreferenceSalaryField({
  salaryMin,
  currency,
  onChange,
  min = 100,
  max = 5000,
  step = 5,
}: Props) {
  // UI slider always works in USD-scale units; VND is normalized (uiValue * 10000) for storage.
  const uiValue =
    salaryMin === undefined ? min : currency === "VND" ? salaryMin / 10000 : salaryMin;

  const toNormalized = (value: number, cur: PreferenceCurrency) =>
    cur === "VND" ? value * 10000 : value;

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        {(["VND"] as const).map((cur) => (
          <button
            key={cur}
            type="button"
            onClick={() => onChange(toNormalized(uiValue, cur), cur)}
            className={cn(
              "px-4 py-1.5 rounded-full border text-sm font-medium transition-colors cursor-pointer",
              currency === cur
                ? "bg-blue-500 border-blue-500 text-white"
                : "border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600"
            )}
          >
            {cur}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
        <div className="text-center">
          <span className="text-3xl font-bold text-blue-600">
            {currency === "VND"
              ? `${(uiValue * 10000).toLocaleString()}₫`
              : `$${uiValue.toLocaleString()}`}
          </span>
          <span className="text-sm text-slate-400"> / month minimum</span>
        </div>

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={uiValue}
          onChange={(e) => onChange(toNormalized(Number(e.target.value), currency), currency)}
          className="w-full cursor-pointer accent-blue-600"
        />

        <div className="flex justify-between text-xs text-slate-400">
          <span>{currency === "VND" ? `${(min * 10000).toLocaleString()}₫` : `$${min}`}</span>
          <span>{currency === "VND" ? `${(max * 10000).toLocaleString()}₫` : `$${max}+`}</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-medium text-slate-400">Quick pick</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS[currency].map((preset) => {
            const isActive = salaryMin === preset;
            return (
              <button
                key={preset}
                type="button"
                onClick={() => onChange(preset, currency)}
                className={cn(
                  "px-3 py-1.5 rounded-full border text-sm transition-colors cursor-pointer",
                  isActive
                    ? "bg-blue-500 border-blue-500 text-white"
                    : "border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600"
                )}
              >
                {formatPreset(preset, currency)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
