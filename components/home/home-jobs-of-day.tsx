"use client"

import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"
import { LottieLoader } from "@/components/ui/lottie-loader"
import FeaturedJobCard from "@/components/jobs/featured/featured-job-card"
import { useAuth } from "@/contexts/auth-context"
import { jobService } from "@/lib/job/job-service"
import { cn } from "@/lib/utils"
import { Company } from "@/types/company"

/** Fields shared by `Job` (public job list) and the recommendation endpoint's job shape. */
interface DisplayJob {
  postId: string
  title: string
  shortDescription: string
  salaryMin: number
  salaryMax: number
  skillNames: string[]
  company: Company
  /** 0-100 — only set when sourced from the AI recommendation endpoint. */
  matchScore?: number
}

// Always exactly 10 jobs — 2 full rows of 5 — regardless of source (AI recommendations or latest jobs).
const MAX_JOBS = 10

/** Jobs of the Day — AI-personalized recommendations for candidates, latest public jobs for everyone else */
export function HomeJobsOfDay() {
  const { isAuthenticated, user, isLoading: authLoading } = useAuth()
  const [jobs, setJobs] = useState<DisplayJob[]>([])
  const [loading, setLoading] = useState(true)
  const [usingAi, setUsingAi] = useState(false)

  useEffect(() => {
    if (authLoading) return

    let cancelled = false
    const isCandidate = isAuthenticated && !!user?.roles.includes("ROLE_CANDIDATE")

    const loadLatestJobs = async () => {
      const { data } = await jobService.getJobs({
        page: 1,
        pageSize: MAX_JOBS,
        sort: "desc",
      })
      if (!cancelled) {
        setUsingAi(false)
        setJobs(data.result.slice(0, MAX_JOBS))
      }
    }

    const load = async () => {
      setLoading(true)
      try {
        if (isCandidate) {
          try {
            const { data } = await jobService.getRecommendedJobs(MAX_JOBS)
            if (data.recommendations.length > 0) {
              if (!cancelled) {
                setUsingAi(true)
                setJobs(
                  data.recommendations.slice(0, MAX_JOBS).map((r) => ({
                    ...r.job,
                    matchScore: Math.round(r.score * 100),
                  })),
                )
              }
              return
            }
          } catch {
            // Recommendations unavailable (e.g. no CV on file yet) — fall back below.
          }
        }
        await loadLatestJobs()
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [authLoading, isAuthenticated, user])

  return (
    <section className="relative overflow-hidden py-16 md:py-20">
      {usingAi && (
        <>
          <div className="pointer-events-none absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-violet-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        </>
      )}

      <div className="container relative mx-auto px-4">
        <div className="mb-8 text-center">
          {usingAi && (
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-violet-200">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Picks For You
            </span>
          )}
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">Jobs of the Day</h2>
          <p className="mt-2 text-muted-foreground">
            {usingAi
              ? "Matched by AI from your CV — ranked best-fit first"
              : "Find your perfect match from today's top listings"}
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <LottieLoader size={160} />
            Loading jobs…
          </div>
        ) : jobs.length === 0 ? (
          <p className="text-center text-muted-foreground">No jobs available right now.</p>
        ) : (
          <div
            className={cn(
              "grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5",
              usingAi && "rounded-3xl bg-gradient-to-br from-violet-50/60 via-white to-blue-50/60 p-6 ring-1 ring-violet-100",
            )}
          >
            {jobs.map((job) => (
              <div key={job.postId} className="relative">
                {job.matchScore !== undefined && (
                  <span className="absolute -top-2 -right-2 z-10 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                    <Sparkles className="h-2.5 w-2.5" />
                    {job.matchScore}% Match
                  </span>
                )}
                <FeaturedJobCard
                  postId={job.postId}
                  logo={job.company.logoUrl}
                  company={job.company.name}
                  title={job.title}
                  location={job.company.address}
                  salary={`$${job.salaryMin.toLocaleString()} – $${job.salaryMax.toLocaleString()}`}
                  description={job.shortDescription}
                  skills={job.skillNames}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
