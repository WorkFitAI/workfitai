"use client"

import { useCallback, useEffect, useState } from "react"
import { useDebounce } from "@/hooks/useDebounce"
import { toast } from "sonner"
import { adminUserService } from "@/lib/admin/admin-user-service"
import type {
  AdminUserFullProfile,
  AdminUserRole,
  AdminUserStatus,
  AdminUserSummary,
  EsSearchResult,
  EsUserHit,
} from "@/types/admin-user"

/** Returns true for statuses that should show the Unblock action */
const isRestricted = (s: AdminUserStatus) => s === "BLOCKED" || s === "SUSPENDED"

// ─── List hook (ES-backed) ─────────────────────────────────────────────────

interface UseAdminUsersParams {
  keyword: string
  /** 1-indexed UI page */
  page: number
  pageSize?: number
  role?: AdminUserRole | ""
  status?: AdminUserStatus | ""
}

export function useAdminUsers({
  keyword,
  page,
  pageSize = 10,
  role = "",
  status = "",
}: UseAdminUsersParams) {
  const debouncedKeyword = useDebounce(keyword, 400)

  const [data, setData] = useState<EsSearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await adminUserService.searchUsers({
        query: debouncedKeyword,
        from: (page - 1) * pageSize, // ES uses offset, not page number
        size: pageSize,
        ...(role ? { role } : {}),
        ...(status ? { status } : {}),
        blocked: "false",
        includeDeleted: "false",
        sortField: "createdAt",
        sortOrder: "desc",
        includeAggregations: true,
      })
      setData(res.data ?? null)
    } catch {
      setError("Failed to load users. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [debouncedKeyword, page, pageSize, role, status])

  useEffect(() => {
    fetch()
  }, [fetch])

  return {
    users: data?.hits ?? [],
    totalHits: data?.totalHits ?? 0,
    roleAggregations: data?.roleAggregations ?? {},
    statusAggregations: data?.statusAggregations ?? {},
    /** Total pages calculated from ES totalHits */
    totalPages: data ? Math.ceil(data.totalHits / pageSize) : 1,
    loading,
    error,
    refresh: fetch,
  }
}

// ─── Approval queue hook ───────────────────────────────────────────────────

interface UseApprovalQueueParams {
  role?: "HR_MANAGER" | "HR"
  page?: number
  pageSize?: number
}

export function useApprovalQueue({
  role,
  page = 1,
  pageSize = 20,
}: UseApprovalQueueParams = {}) {
  const [data, setData] = useState<EsSearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)

  const fetchQueue = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await adminUserService.searchUsers({
        query: "",
        status: "WAIT_APPROVED",
        ...(role ? { role } : {}),
        blocked: "false",
        includeDeleted: "false",
        from: (page - 1) * pageSize,
        size: pageSize,
        sortField: "createdAt",
        sortOrder: "asc", // oldest first — fairness
        includeAggregations: true,
      })
      setData(res.data ?? null)
    } catch {
      setError("Failed to load approval queue.")
    } finally {
      setLoading(false)
    }
  }, [role, page, pageSize])

  useEffect(() => {
    fetchQueue()
  }, [fetchQueue])

  const approve = useCallback(
    async (user: EsUserHit) => {
      try {
        setApprovingId(user.userId)
        if (user.role === "HR_MANAGER") {
          await adminUserService.approveManager(user.username)
        } else {
          await adminUserService.approveHR(user.username)
        }
        toast.success(`${user.fullName} approved successfully`)
        await fetchQueue()
      } catch {
        toast.error(`Failed to approve ${user.fullName}`)
        setError(`Failed to approve ${user.fullName}.`)
      } finally {
        setApprovingId(null)
      }
    },
    [fetchQueue],
  )

  const reject = useCallback(
    async (user: EsUserHit) => {
      try {
        setRejectingId(user.userId)
        if (user.role === "HR_MANAGER") {
          await adminUserService.rejectManager(user.username)
        } else {
          await adminUserService.rejectHR(user.username)
        }
        toast.success(`${user.fullName} has been rejected`)
        await fetchQueue()
      } catch {
        toast.error(`Failed to reject ${user.fullName}`)
        setError(`Failed to reject ${user.fullName}.`)
      } finally {
        setRejectingId(null)
      }
    },
    [fetchQueue],
  )

  return {
    queue: data?.hits ?? [],
    totalHits: data?.totalHits ?? 0,
    roleAggregations: data?.roleAggregations ?? {},
    loading,
    error,
    approvingId,
    rejectingId,
    approve,
    reject,
    refresh: fetchQueue,
  }
}

// ─── Single user + block action hook ───────────────────────────────────────

export function useAdminUser(userId: string) {
  const [user, setUser] = useState<AdminUserSummary | null>(null)
  const [fullProfile, setFullProfile] = useState<AdminUserFullProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [fullProfileLoading, setFullProfileLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [blocking, setBlocking] = useState(false)

  const fetchUser = useCallback(async () => {
    if (!userId) return
    try {
      setLoading(true)
      setError(null)
      const res = await adminUserService.getUser(userId)
      setUser(res.data ?? null)
    } catch {
      setError("Failed to load user.")
    } finally {
      setLoading(false)
    }
  }, [userId])

  const fetchFullProfile = useCallback(async () => {
    if (!userId) return
    try {
      setFullProfileLoading(true)
      const res = await adminUserService.getUserFullProfile(userId)
      setFullProfile(res.data ?? null)
    } catch {
      // Full profile not critical — swallow error
    } finally {
      setFullProfileLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const toggleBlock = useCallback(async () => {
    if (!user) return
    const shouldBlock = !isRestricted(user.userStatus)
    try {
      setBlocking(true)
      await adminUserService.setUserBlocked(userId, shouldBlock)
      await fetchUser()
    } catch {
      setError(`Failed to ${shouldBlock ? "block" : "unblock"} user.`)
    } finally {
      setBlocking(false)
    }
  }, [user, userId, fetchUser])

  return {
    user,
    fullProfile,
    loading,
    fullProfileLoading,
    error,
    blocking,
    fetchFullProfile,
    toggleBlock,
    refresh: fetchUser,
  }
}
