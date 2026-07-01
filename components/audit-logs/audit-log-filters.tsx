"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, RotateCcw } from "lucide-react"

export interface AuditFilters {
  companyId: string
  from: string
  to: string
  actorUsername: string
  entityType: string
  actorRole: string
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
      <div className="flex flex-col gap-1 min-w-[130px]">
        <label className="text-xs font-medium text-muted-foreground">Actor Username</label>
        <Input
          placeholder="e.g. john.doe"
          value={pending.actorUsername}
          onChange={(e) => onChange({ actorUsername: e.target.value })}
          className="h-8 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1 min-w-[120px]">
        <label className="text-xs font-medium text-muted-foreground">Actor Role</label>
        <Input
          placeholder="e.g. ADMIN"
          value={pending.actorRole}
          onChange={(e) => onChange({ actorRole: e.target.value })}
          className="h-8 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1 min-w-[120px]">
        <label className="text-xs font-medium text-muted-foreground">Entity Type</label>
        <Input
          placeholder="e.g. USER"
          value={pending.entityType}
          onChange={(e) => onChange({ entityType: e.target.value })}
          className="h-8 text-sm"
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
