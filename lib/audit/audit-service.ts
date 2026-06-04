import { apiClient } from "@/lib/api-client"
import type { ApiResponse } from "@/types/response"
import type { AuditLogsPage } from "@/types/audit"

export interface AuditLogsParams {
  page: number
  size: number
  companyId?: string
  action?: string
  from?: string
  to?: string
  actorUsername?: string
  entityType?: string
  actorRole?: string
}

function buildQuery(params: AuditLogsParams): string {
  const sp = new URLSearchParams()
  sp.set("page", String(params.page))
  sp.set("size", String(params.size))
  if (params.companyId) sp.set("companyId", params.companyId)
  if (params.action) sp.set("action", params.action)
  if (params.from) sp.set("from", params.from)
  if (params.to) sp.set("to", params.to)
  if (params.actorUsername) sp.set("actorUsername", params.actorUsername)
  if (params.entityType) sp.set("entityType", params.entityType)
  if (params.actorRole) sp.set("actorRole", params.actorRole)
  return sp.toString()
}

export const auditService = {
  list(params: AuditLogsParams): Promise<ApiResponse<AuditLogsPage>> {
    return apiClient.get<ApiResponse<AuditLogsPage>>(
      `/monitoring/admin/audit?${buildQuery(params)}`
    )
  },
}
