"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, CheckCircle, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { AuditLog } from "@/types/audit"

function actionBadgeClass(action: string): string {
  if (action.startsWith("AUTH_")) return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
  if (action.startsWith("APPLICATION_")) return "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
  if (action.startsWith("USER_")) return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800"
  if (action.startsWith("JOB_")) return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800"
  return "bg-muted text-muted-foreground border-border"
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit", month: "short",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  })
}

function shortService(service: string) {
  return service.replace(/-service$/, "")
}

function ExpandedDetail({ log }: { log: AuditLog }) {
  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-3 px-8 py-4 bg-muted/20 text-xs border-t border-border">
      <div className="flex flex-col gap-1">
        <span className="font-medium text-muted-foreground uppercase tracking-wide">Event ID</span>
        <span className="font-mono text-foreground break-all">{log.eventId}</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-medium text-muted-foreground uppercase tracking-wide">IP Address</span>
        <span className="font-mono text-foreground">{log.actorIp}</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-medium text-muted-foreground uppercase tracking-wide">Entity</span>
        <span className="font-mono text-foreground">{log.entityType} / {log.entityId}</span>
      </div>
      {log.errorMessage && (
        <div className="col-span-2 flex flex-col gap-1">
          <span className="font-medium text-destructive uppercase tracking-wide">Error</span>
          <span className="font-mono text-destructive">{log.errorMessage}</span>
        </div>
      )}
      {(log.before || log.after) && (
        <div className="col-span-2 flex gap-4">
          {log.before && (
            <div className="flex-1 flex flex-col gap-1">
              <span className="font-medium text-muted-foreground uppercase tracking-wide">Before</span>
              <pre className="bg-muted rounded p-2 overflow-auto text-xs max-h-40">
                {JSON.stringify(log.before, null, 2)}
              </pre>
            </div>
          )}
          {log.after && (
            <div className="flex-1 flex flex-col gap-1">
              <span className="font-medium text-muted-foreground uppercase tracking-wide">After</span>
              <pre className="bg-muted rounded p-2 overflow-auto text-xs max-h-40">
                {JSON.stringify(log.after, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function AuditLogTableRow({ log }: { log: AuditLog }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <TableRow
        className={cn("cursor-pointer select-none", expanded && "bg-muted/30 hover:bg-muted/30")}
        onClick={() => setExpanded((v) => !v)}
      >
        <TableCell className="w-6 pl-3 pr-0">
          {expanded
            ? <ChevronDown size={14} className="text-muted-foreground" />
            : <ChevronRight size={14} className="text-muted-foreground" />
          }
        </TableCell>
        <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
          {formatTime(log.occurredAt)}
        </TableCell>
        <TableCell>
          {log.success
            ? <CheckCircle size={15} className="text-green-500" />
            : <XCircle size={15} className="text-destructive" />
          }
        </TableCell>
        <TableCell>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium leading-tight">{log.actorUsername}</span>
            <span className="text-xs text-muted-foreground leading-tight">{log.actorRole}</span>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className={cn("text-xs font-mono whitespace-nowrap", actionBadgeClass(log.action))}>
            {log.action}
          </Badge>
        </TableCell>
        <TableCell className="max-w-xs">
          <span className="text-sm truncate block text-muted-foreground">{log.displayMessage}</span>
        </TableCell>
        <TableCell className="text-xs text-muted-foreground">
          {shortService(log.sourceService)}
        </TableCell>
        <TableCell className="text-xs font-mono text-muted-foreground">
          {log.companyId ?? "—"}
        </TableCell>
      </TableRow>
      {expanded && (
        <tr>
          <td colSpan={8} className="p-0">
            <ExpandedDetail log={log} />
          </td>
        </tr>
      )}
    </>
  )
}

export function AuditLogTable({ logs }: { logs: AuditLog[] }) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="w-6" />
            <TableHead>Time</TableHead>
            <TableHead className="w-14">Status</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Company</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <AuditLogTableRow key={log.eventId} log={log} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
