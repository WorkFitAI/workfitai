import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { AuditLogsClient } from "@/components/audit-logs/audit-logs-client"

export const metadata = {
  title: "Audit Logs — WorkfitAI Admin",
  description: "System-wide event audit trail",
}

export default function AuditLogsPage() {
  return (
    <div className="p-6">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
            <Loader2 size={20} className="animate-spin" />
            <span>Loading…</span>
          </div>
        }
      >
        <AuditLogsClient />
      </Suspense>
    </div>
  )
}
