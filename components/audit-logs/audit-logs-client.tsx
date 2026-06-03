"use client"

import { useState } from "react"
import { Loader2, ShieldAlert } from "lucide-react"
import { useAuditLogs } from "@/hooks/useAuditLogs"
import { AuditLogFilters, type AuditFilters } from "@/components/audit-logs/audit-log-filters"
import { AuditLogTable } from "@/components/audit-logs/audit-log-table"
import { Button } from "@/components/ui/button"

const PAGE_SIZE = 50
const EMPTY_FILTERS: AuditFilters = { action: "", companyId: "", from: "", to: "" }

function toIso(local: string) {
  return local ? new Date(local).toISOString() : undefined
}

export function AuditLogsClient() {
  const [page, setPage] = useState(1)
  const [pending, setPending] = useState<AuditFilters>(EMPTY_FILTERS)
  const [applied, setApplied] = useState<AuditFilters>(EMPTY_FILTERS)

  const { logs, totalPages, totalElements, loading, error } = useAuditLogs({
    page: page - 1,
    size: PAGE_SIZE,
    companyId: applied.companyId || undefined,
    action: applied.action || undefined,
    from: toIso(applied.from),
    to: toIso(applied.to),
  })

  function applyFilters() {
    setPage(1)
    setApplied(pending)
  }

  function resetFilters() {
    setPage(1)
    setPending(EMPTY_FILTERS)
    setApplied(EMPTY_FILTERS)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert size={20} className="text-muted-foreground" />
          <h2 className="text-lg font-semibold">Audit Logs</h2>
        </div>
        {totalElements > 0 && (
          <span className="text-sm text-muted-foreground">
            {totalElements.toLocaleString()} total events
          </span>
        )}
      </div>

      <AuditLogFilters
        pending={pending}
        onChange={(patch) => setPending((prev) => ({ ...prev, ...patch }))}
        onApply={applyFilters}
        onReset={resetFilters}
      />

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
          <Loader2 size={20} className="animate-spin" />
          <span>Loading audit logs…</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-destructive">
          <ShieldAlert size={32} />
          <p className="text-sm">{error}</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
          <ShieldAlert size={32} />
          <p className="text-sm">No audit events found for the selected filters.</p>
        </div>
      ) : (
        <AuditLogTable logs={logs} />
      )}

      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
