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
}

function buildQuery(params: AuditLogsParams): string {
  const sp = new URLSearchParams()
  sp.set("page", String(params.page))
  sp.set("size", String(params.size))
  if (params.companyId) sp.set("companyId", params.companyId)
  if (params.action) sp.set("action", params.action)
  if (params.from) sp.set("from", params.from)
  if (params.to) sp.set("to", params.to)
  return sp.toString()
}

export const auditService = {
  list(params: AuditLogsParams): Promise<ApiResponse<AuditLogsPage>> {
    return apiClient.get<ApiResponse<AuditLogsPage>>(
      `/monitoring/admin/audit?${buildQuery(params)}`
    )
  },
}
