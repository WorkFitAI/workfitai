"use client";

import { useState, useEffect, useRef } from "react";
import { Info } from "lucide-react";
import { applicationService } from "@/lib/application/application-service";
import { ApplicationDetailPanel } from "@/components/hrm/application-detail-panel";
import { AiCvRankingLoader } from "@/components/hrm/ai-cv-ranking-loader";
import { StatusBadge } from "@/components/hrm/application-table";
import { CvMatchAnalysis, FIT_LABEL_STYLE } from "@/components/hrm/cv-match-analysis";
import { useAuth } from "@/contexts/auth-context";
import type { HRJobItem, CvRankingData, CvRankedApplication } from "@/types/application";

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 30000;

const RANKING_STEPS = [
  "Extracting CV content…",
  "Analyzing candidate profiles…",
  "Computing similarity scores…",
  "Cross-referencing job requirements…",
  "Ranking candidates by fit…",
];

interface Props {
  jobs: HRJobItem[];
}

export function AiCvRankingTab({ jobs }: Props) {
  const { user } = useAuth();
  const [selectedJobId, setSelectedJobId] = useState("");
  const [loading, setLoading] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [result, setResult] = useState<CvRankingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<CvRankedApplication | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (loading) {
      setStepIdx(0);
      timerRef.current = setInterval(
        () => setStepIdx((i) => (i + 1) % RANKING_STEPS.length),
        2200,
      );
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading]);

  const handleRank = async () => {
    if (!selectedJobId) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await applicationService.getCVRanking(
        selectedJobId,
        MAX_RETRIES,
        RETRY_DELAY_MS,
        undefined,
        120000,
      );
      setResult(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ranking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Accuracy disclaimer */}
      <div className="flex items-start gap-2.5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800">
        <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
        <p>
          AI ranking quality depends on complete input: candidate CVs should follow the{" "}
          <strong>Harvard formal resume template</strong> with all sections filled in (education,
          experience, skills, etc.), and the job post should have <strong>every field on the job form
          completed</strong>. Missing sections on either side may leave a candidate unranked.
        </p>
      </div>

      {/* Job selector + trigger */}
      <div className="flex items-center gap-3">
        <select
          value={selectedJobId}
          onChange={(e) => {
            setSelectedJobId(e.target.value);
            setResult(null);
            setError(null);
          }}
          disabled={loading}
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
        >
          <option value="">Select a job to rank CVs…</option>
          {jobs.map((j) => (
            <option key={j.jobId} value={j.jobId}>
              {j.title} ({j.totalApplicants} applicant{j.totalApplicants !== 1 ? "s" : ""})
            </option>
          ))}
        </select>
        <button
          onClick={handleRank}
          disabled={!selectedJobId || loading}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 whitespace-nowrap transition-colors"
        >
          {loading ? (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )}
          {loading ? "Ranking…" : "Rank CVs"}
        </button>
      </div>

      {/* Loading animation */}
      {loading && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 flex flex-col items-center gap-2">
          <AiCvRankingLoader />
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-primary animate-pulse">{RANKING_STEPS[stepIdx]}</p>
            <p className="text-xs text-primary/70">AI is analyzing each CV against the job requirements</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total candidates", value: result.total_candidates },
              { label: "Ranked", value: result.ranked_count },
              { label: "Unranked", value: result.unranked_count },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg border border-gray-200 bg-white p-3 text-center">
                <p className="text-xl font-semibold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {result.job_overview && (
            <p className="text-xs text-gray-500 italic">{result.job_overview}</p>
          )}

          {/* Ranking table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 whitespace-nowrap">Rank</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 whitespace-nowrap">Candidate</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500 whitespace-nowrap">Fit</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Match Analysis</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {result.applications.map((item) => {
                  const isHired = item.application.status === "HIRED";
                  const isOffered = item.application.status === "OFFER";
                  const isPastRanking = isHired || isOffered;
                  return (
                  <tr
                    key={item.application.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      isHired
                        ? "bg-green-50/40"
                        : isOffered
                        ? "bg-emerald-50/40"
                        : !item.ranked
                        ? "bg-amber-50/30"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      {item.ranked ? (
                        <span
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                            item.rank === 1
                              ? "bg-amber-100 text-amber-700"
                              : item.rank === 2
                              ? "bg-gray-200 text-gray-600"
                              : item.rank === 3
                              ? "bg-orange-100 text-orange-600"
                              : "bg-gray-50 text-gray-500 border border-gray-200"
                          }`}
                        >
                          {item.rank}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-gray-900">{item.application.username}</div>
                        {isHired && <StatusBadge status="HIRED" />}
                        {isOffered && <StatusBadge status="OFFER" />}
                      </div>
                      <div className="text-xs text-gray-500">{item.application.email}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {isHired ? (
                        <span className="text-xs text-gray-400 italic">Already hired — no longer ranking</span>
                      ) : isOffered ? (
                        <span className="text-xs text-gray-400 italic">Offer extended — no longer ranking</span>
                      ) : item.label ? (
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            FIT_LABEL_STYLE[item.label] ?? "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {item.label}
                        </span>
                      ) : !item.ranked ? (
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
                          Unranked
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      {item.ranked && !isPastRanking ? (
                        <>
                          <CvMatchAnalysis
                            score={item.score}
                            label={item.label}
                            similarityScore={item.similarityScore}
                            crossScore={item.crossScore}
                            inputCoverage={item.inputCoverage}
                            matchPoints={item.matchPoints ?? []}
                            missPoints={item.missPoints ?? []}
                            variant="table"
                          />
                          {item.explanation && (
                            <p className="mt-1.5 text-[11px] text-gray-400 line-clamp-1">{item.explanation}</p>
                          )}
                        </>
                      ) : item.explanation ? (
                        <p
                          className={`text-xs line-clamp-2 ${
                            !item.ranked && !isPastRanking ? "text-amber-700" : "text-gray-600"
                          }`}
                        >
                          {item.explanation}
                        </p>
                      ) : !item.ranked && !isPastRanking ? (
                        <p className="text-xs text-amber-700 italic">
                          Could not rank — CV or job description may be missing required sections
                          (e.g. education, experience, skills). Confirm the CV follows the Harvard
                          formal template and all job fields are filled in.
                        </p>
                      ) : (
                        <p className="text-xs text-gray-300">—</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="rounded px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Empty state */}
      {!loading && !result && !error && (
        <div className="flex flex-col items-center justify-center py-14 text-gray-400 gap-2">
          <svg className="h-10 w-10 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p className="text-sm">Select a job above and click "Rank CVs" to start AI ranking.</p>
        </div>
      )}

      {selectedItem && (
        <ApplicationDetailPanel
          application={selectedItem.application}
          rankingInfo={selectedItem}
          currentUsername={user?.username ?? ""}
          onClose={() => setSelectedItem(null)}
          onRefresh={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
