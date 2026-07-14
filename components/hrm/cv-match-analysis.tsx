"use client";

export const FIT_LABEL_STYLE: Record<string, string> = {
  "Strong Fit": "bg-green-100 text-green-800",
  "Good Fit": "bg-teal-100 text-teal-800",
  "Potential Fit": "bg-amber-100 text-amber-800",
  "No Fit": "bg-gray-100 text-gray-600",
};

interface CvMatchAnalysisProps {
  score: number | null;
  label: string | null;
  similarityScore: number | null;
  crossScore: number | null;
  inputCoverage: number | null;
  matchPoints: string[];
  missPoints: string[];
  /** "table" = compact capped summary for the ranking row; "panel" = full uncapped detail. */
  variant: "table" | "panel";
}

function capList(items: string[], limit?: number) {
  if (!limit || items.length <= limit) return { shown: items, extra: 0 };
  return { shown: items.slice(0, limit), extra: items.length - limit };
}

function ScoreBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="h-1.5 w-14 shrink-0 rounded-full bg-gray-100 overflow-hidden">
      <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
    </div>
  );
}

function ChipGroup({
  title,
  items,
  tone,
  limit,
}: {
  title: string;
  items: string[];
  tone: "match" | "miss";
  limit?: number;
}) {
  if (items.length === 0) return null;
  const { shown, extra } = capList(items, limit);
  const chipClass =
    tone === "match"
      ? "bg-green-100 text-green-800"
      : "bg-rose-100 text-rose-700";
  return (
    <div>
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{title}</p>
      <div className="flex flex-wrap gap-1">
        {shown.map((item) => (
          <span
            key={item}
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${chipClass}`}
          >
            {item}
          </span>
        ))}
        {extra > 0 && <span className="text-[11px] text-gray-400 self-center">+{extra} more</span>}
      </div>
    </div>
  );
}

export function CvMatchAnalysis({
  score,
  label,
  similarityScore,
  crossScore,
  inputCoverage,
  matchPoints,
  missPoints,
  variant,
}: CvMatchAnalysisProps) {
  const isPanel = variant === "panel";
  const chipLimit = isPanel ? undefined : 3;
  const coveragePct = inputCoverage == null ? null : Math.round(inputCoverage * 100);
  const matchCap = capList(matchPoints, chipLimit);
  const missCap = capList(missPoints, chipLimit);

  return (
    <div className={isPanel ? "space-y-3" : "space-y-1.5 min-w-[240px]"}>
      {/* Score + label — prominent */}
      <div className="flex items-center gap-2">
        <span className={isPanel ? "text-xl font-semibold text-gray-900" : "text-sm font-semibold text-gray-900"}>
          {score == null ? "—" : score}
        </span>
        {score != null && <ScoreBar value={score} />}
        {label && (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
              FIT_LABEL_STYLE[label] ?? "bg-gray-100 text-gray-600"
            }`}
          >
            {label}
          </span>
        )}
      </div>

      {/* Match / miss */}
      {isPanel ? (
        <div className="space-y-2">
          <ChipGroup title="Matched" items={matchPoints} tone="match" />
          <ChipGroup title="Missing" items={missPoints} tone="miss" />
          {matchPoints.length === 0 && missPoints.length === 0 && (
            <p className="text-xs text-gray-400 italic">No match details available.</p>
          )}
        </div>
      ) : (
        <>
          {(matchPoints.length > 0 || missPoints.length > 0) ? (
            <div className="flex flex-wrap gap-1">
              {matchCap.shown.map((item) => (
                <span
                  key={`m-${item}`}
                  className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-800"
                >
                  {item}
                </span>
              ))}
              {matchCap.extra > 0 && (
                <span className="text-[11px] text-gray-400 self-center">+{matchCap.extra} more</span>
              )}
              {missCap.shown.map((item) => (
                <span
                  key={`x-${item}`}
                  className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-700"
                >
                  {item}
                </span>
              ))}
              {missCap.extra > 0 && (
                <span className="text-[11px] text-gray-400 self-center">+{missCap.extra} more</span>
              )}
            </div>
          ) : (
            <p className="text-[11px] text-gray-400 italic">No match details available.</p>
          )}
        </>
      )}

      {/* Similarity / cross / coverage — tucked away, avoid alarming raw AI-internal numbers */}
      <details className="text-[11px] text-gray-500">
        <summary className="cursor-pointer select-none text-gray-400 hover:text-gray-600">Details</summary>
        <dl className="mt-1.5 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <dt>Similarity</dt>
            <dd className="font-medium text-gray-700">{similarityScore == null ? "—" : similarityScore}</dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt>Cross score</dt>
            <dd className="font-medium text-gray-700">{crossScore == null ? "—" : crossScore}</dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt>Input coverage</dt>
            <dd className="font-medium text-gray-700">{coveragePct == null ? "—" : `${coveragePct}%`}</dd>
          </div>
        </dl>
      </details>
    </div>
  );
}
