import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { SectionFallback } from "@/components/dashboard/shared/section-fallback"
import type { HrmApplicationStats } from "@/types/dashboard"

interface JobWarnings {
  expiringInWeek: number
  pendingReports: number
}

interface HrmTopJobsSectionProps {
  stats: HrmApplicationStats | null
  jobWarnings: JobWarnings | null
}

export function HrmTopJobsSection({ stats, jobWarnings }: HrmTopJobsSectionProps) {
  if (!stats) return <SectionFallback title="Top Jobs" />

  const jobs = stats.topJobs.slice(0, 8)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Top jobs by applicants</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Title</TableHead>
              <TableHead className="text-right">Applicants</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground">
                  No jobs yet.
                </TableCell>
              </TableRow>
            )}
            {jobs.map((job) => (
              <TableRow key={job.jobId}>
                <TableCell className="font-medium">{job.jobTitle}</TableCell>
                <TableCell className="text-right">{job.applicantCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Warnings footer */}
        {jobWarnings && (jobWarnings.expiringInWeek > 0 || jobWarnings.pendingReports > 0) && (
          <div className="flex gap-2 flex-wrap border-t pt-2">
            {jobWarnings.expiringInWeek > 0 && (
              <span className="text-xs font-medium text-amber-600 bg-amber-50 rounded px-1.5 py-0.5">
                {jobWarnings.expiringInWeek} expiring in 7d
              </span>
            )}
            {/* {jobWarnings.pendingReports > 0 && (
              <span className="text-xs font-medium text-red-600 bg-red-50 rounded px-1.5 py-0.5">
                {jobWarnings.pendingReports} pending report{jobWarnings.pendingReports !== 1 ? "s" : ""}
              </span>
            )} */}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
