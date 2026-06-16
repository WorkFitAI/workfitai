export interface Notification {
  id: string
  userId: string
  userEmail: string
  type: string
  title: string
  message: string
  actionUrl: string | null
  data: Record<string, string> | null
  sourceService: string
  referenceId: string | null
  referenceType: string | null
  read: boolean
  readAt: string | null
  createdAt: string
  updatedAt: string | null
}

export interface NotificationPage {
  content: Notification[]
  totalPages: number
  totalElements: number
  last: boolean
  first: boolean
  size: number
  number: number
  numberOfElements: number
  empty: boolean
}

export interface UnreadCountData {
  count: number
}
