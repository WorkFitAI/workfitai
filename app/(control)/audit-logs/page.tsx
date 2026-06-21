import { Suspense } from "react"
import { AuditLogsClient } from "@/components/audit-logs/audit-logs-client"
import { LottieLoader } from "@/components/ui/lottie-loader"

export const metadata = {
  title: "Audit Logs — WorkfitAI Admin",
  description: "System-wide event audit trail",
}

export default function AuditLogsPage() {
  return (
    <div className="p-6">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
            <LottieLoader size={90} />
            <span>Loading…</span>
          </div>
        }
      >
        <AuditLogsClient />
      </Suspense>
    </div>
  )
}
