import JobManagement from "@/components/jobs/job-post-client";

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Job Management</h1>
      <JobManagement />
    </div>
  )
}
