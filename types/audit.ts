export interface AuditLog {
  eventId: string
  sourceService: string
  actorUsername: string
  actorRole: string
  companyId: string | null
  entityType: string
  entityId: string
  action: string
  before: Record<string, unknown> | null
  after: Record<string, unknown> | null
  occurredAt: string
  displayMessage: string
  success: boolean
  errorMessage: string | null
  actorIp: string
}

export interface AuditLogsPage {
  content: AuditLog[]
  totalPages: number
  totalElements: number
  /** 0-indexed page number from API */
  number: number
  size: number
}
