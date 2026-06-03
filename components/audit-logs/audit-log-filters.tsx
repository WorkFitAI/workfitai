"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, RotateCcw } from "lucide-react"

export interface AuditFilters {
  action: string
  companyId: string
  from: string
  to: string
}

interface AuditLogFiltersProps {
  pending: AuditFilters
  onChange: (patch: Partial<AuditFilters>) => void
  onApply: () => void
  onReset: () => void
}

export function AuditLogFilters({ pending, onChange, onApply, onReset }: AuditLogFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3 p-4 bg-muted/30 border border-border rounded-lg">
      <div className="flex flex-col gap-1 min-w-[160px]">
        <label className="text-xs font-medium text-muted-foreground">Action</label>
        <Input
          placeholder="e.g. AUTH_LOGIN_SUCCESS"
          value={pending.action}
          onChange={(e) => onChange({ action: e.target.value })}
          className="h-8 text-sm font-mono"
        />
      </div>

      <div className="flex flex-col gap-1 min-w-[120px]">
        <label className="text-xs font-medium text-muted-foreground">Company ID</label>
        <Input
          placeholder="e.g. CP01"
          value={pending.companyId}
          onChange={(e) => onChange({ companyId: e.target.value })}
          className="h-8 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">From</label>
        <Input
          type="datetime-local"
          value={pending.from}
          onChange={(e) => onChange({ from: e.target.value })}
          className="h-8 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">To</label>
        <Input
          type="datetime-local"
          value={pending.to}
          onChange={(e) => onChange({ to: e.target.value })}
          className="h-8 text-sm"
        />
      </div>

      <div className="flex items-center gap-2 pb-0.5">
        <Button size="sm" onClick={onApply} className="h-8 gap-1.5">
          <Search size={14} />
          Apply
        </Button>
        <Button size="sm" variant="ghost" onClick={onReset} className="h-8 gap-1.5">
          <RotateCcw size={14} />
          Reset
        </Button>
      </div>
    </div>
  )
}
