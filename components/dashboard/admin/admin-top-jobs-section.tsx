import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { SectionFallback } from "@/components/dashboard/shared/section-fallback"
import type { AdminApplicationStats } from "@/types/dashboard"

interface AdminTopJobsSectionProps {
  stats: AdminApplicationStats | null
}

export function AdminTopJobsSection({ stats }: AdminTopJobsSectionProps) {
  if (!stats) return <SectionFallback title="Top Jobs" />

  const jobs = stats.topJobs.slice(0, 5)

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Top jobs by applications</CardTitle>
          <Link href="/applications" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            View all →
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Title</TableHead>
              <TableHead>Company</TableHead>
              <TableHead className="text-right">Applications</TableHead>
              <TableHead className="text-right">Hires</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No data available.
                </TableCell>
              </TableRow>
            )}
            {jobs.map((job) => (
              <TableRow key={job.jobId}>
                <TableCell className="font-medium">{job.jobTitle}</TableCell>
                <TableCell className="text-muted-foreground">{job.companyName}</TableCell>
                <TableCell className="text-right">{job.applications.toLocaleString()}</TableCell>
                <TableCell className="text-right">{job.hires}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
