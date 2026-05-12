"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  Loader2,
  AlertCircle,
  ShieldOff,
  ShieldCheck,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { useAdminUsers } from "@/hooks/useAdminUsers"
import { adminUserService } from "@/lib/admin/admin-user-service"
import { UserStatusBadge } from "@/components/users/user-status-badge"
import { UserRoleBadge } from "@/components/users/user-role-badge"
import { ApprovalQueueButton } from "@/components/users/approval-queue"
import { useAuth } from "@/contexts/auth-context"
import type { AdminUserRole, AdminUserStatus, EsUserHit } from "@/types/admin-user"

/** Returns true for statuses that should show the Unblock action */
const isRestricted = (s: AdminUserStatus) => s === "BLOCKED" || s === "SUSPENDED"

// ─── Role filter tabs ───────────────────────────────────────────────────────

const ROLE_TABS: { label: string; value: AdminUserRole | "" }[] = [
  { label: "All", value: "" },
  { label: "Candidate", value: "CANDIDATE" },
  { label: "HR", value: "HR" },
  { label: "HR Manager", value: "HR_MANAGER" },
  { label: "Admin", value: "ADMIN" },
]

// ─── Sort ───────────────────────────────────────────────────────────────────

type SortKey = "fullName" | "role" | "status" | "createdAt"
type SortDir = "asc" | "desc" | "none"

function nextDir(current: SortDir): SortDir {
  if (current === "none") return "asc"
  if (current === "asc") return "desc"
  return "none"
}

function SortIcon({ dir }: { dir: SortDir }) {
  if (dir === "asc") return <ArrowUp className="h-3 w-3 ml-1 inline-block text-blue-600" />
  if (dir === "desc") return <ArrowDown className="h-3 w-3 ml-1 inline-block text-blue-600" />
  return <ArrowUpDown className="h-3 w-3 ml-1 inline-block text-gray-300 group-hover:text-gray-400" />
}

function SortTh({
  label,
  sortKey,
  currentKey,
  currentDir,
  onSort,
  className = "",
}: {
  label: string
  sortKey: SortKey
  currentKey: SortKey | null
  currentDir: SortDir
  onSort: (key: SortKey) => void
  className?: string
}) {
  const active = currentKey === sortKey
  const dir = active ? currentDir : "none"
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide ${className}`}
    >
      <button
        onClick={() => onSort(sortKey)}
        className="group flex items-center hover:text-gray-800 transition-colors"
      >
        {label}
        <SortIcon dir={dir} />
      </button>
    </th>
  )
}

// ─── Confirm dialog ─────────────────────────────────────────────────────────

type ConfirmType = "block" | "unblock" | "delete"

interface ConfirmState {
  user: EsUserHit
  type: ConfirmType
}

interface ConfirmDialogProps {
  state: ConfirmState
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}

const CONFIRM_CONFIG: Record<
  ConfirmType,
  {
    title: string
    body: string
    icon: React.ElementType
    iconBg: string
    iconColor: string
    btnColor: string
    btnLabel: string
  }
> = {
  block: {
    title: "Block user?",
    body: "The user will be immediately signed out and lose access.",
    icon: ShieldOff,
    iconBg: "bg-red-100",
    iconColor: "text-red-700",
    btnColor: "bg-red-600 hover:bg-red-700",
    btnLabel: "Block user",
  },
  unblock: {
    title: "Unblock user?",
    body: "The user will regain access to the platform.",
    icon: ShieldCheck,
    iconBg: "bg-green-100",
    iconColor: "text-green-700",
    btnColor: "bg-green-600 hover:bg-green-700",
    btnLabel: "Unblock user",
  },
  delete: {
    title: "Delete user?",
    body: "This action is permanent and cannot be undone. All user data will be removed.",
    icon: Trash2,
    iconBg: "bg-red-100",
    iconColor: "text-red-700",
    btnColor: "bg-red-600 hover:bg-red-700",
    btnLabel: "Delete permanently",
  },
}

function ConfirmDialog({ state, onConfirm, onCancel, loading }: ConfirmDialogProps) {
  const cfg = CONFIRM_CONFIG[state.type]
  const Icon = cfg.icon
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${cfg.iconBg}`}>
            <Icon className={`h-5 w-5 ${cfg.iconColor}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{cfg.title}</p>
            <p className="text-xs text-gray-500">
              {state.user.fullName} ({state.user.email})
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-5">{cfg.body}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${cfg.btnColor}`}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : cfg.btnLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Avatar initial ─────────────────────────────────────────────────────────

function UserAvatar({ name, role }: { name: string; role: AdminUserRole }) {
  const initial = name?.charAt(0)?.toUpperCase() ?? "?"
  const colorMap: Record<AdminUserRole, string> = {
    CANDIDATE: "bg-blue-600",
    HR: "bg-green-600",
    HR_MANAGER: "bg-orange-500",
    ADMIN: "bg-red-600",
  }
  return (
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white text-sm font-bold ${colorMap[role]}`}
    >
      {initial}
    </div>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────

export function UsersList() {
  const router = useRouter()
  const { user: authUser } = useAuth()
  const [keyword, setKeyword] = useState("")
  const [page, setPage] = useState(1)
  const [roleFilter, setRoleFilter] = useState<AdminUserRole | "">("")
  const [confirm, setConfirm] = useState<ConfirmState | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)
  const [approveId, setApproveId] = useState<string | null>(null)
  const [rejectId, setRejectId] = useState<string | null>(null)

  // Sort state
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>("none")

  const { users, totalPages, totalHits, loading, error, refresh } =
    useAdminUsers({ keyword, page, pageSize: 10, role: roleFilter })

  // Client-side sort on current page
  const sortedUsers = useMemo(() => {
    if (!sortKey || sortDir === "none") return users
    return [...users].sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[sortKey] ?? ""
      const bv = (b as unknown as Record<string, unknown>)[sortKey] ?? ""
      const cmp = String(av).localeCompare(String(bv))
      return sortDir === "asc" ? cmp : -cmp
    })
  }, [users, sortKey, sortDir])

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      const next = nextDir(sortDir)
      setSortDir(next)
      if (next === "none") setSortKey(null)
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  function handleRoleTab(value: AdminUserRole | "") {
    setRoleFilter(value)
    setPage(1)
  }

  function handleKeyword(e: React.ChangeEvent<HTMLInputElement>) {
    setKeyword(e.target.value)
    setPage(1)
  }

  async function handleConfirm() {
    if (!confirm) return
    try {
      setActionId(confirm.user.userId)
      if (confirm.type === "block") {
        await adminUserService.setUserBlocked(confirm.user.userId, true)
      } else if (confirm.type === "unblock") {
        await adminUserService.setUserBlocked(confirm.user.userId, false)
      } else if (confirm.type === "delete") {
        await adminUserService.deleteUser(confirm.user.userId)
      }
      setConfirm(null)
      refresh()
    } catch {
      // error shown via refresh
    } finally {
      setActionId(null)
    }
  }

  async function handleApprove(user: EsUserHit) {
    try {
      setApproveId(user.userId)
      await adminUserService.approveManager(user.username)
      refresh()
    } catch {
      // error visible via list refresh
    } finally {
      setApproveId(null)
    }
  }

  async function handleReject(user: EsUserHit) {
    try {
      setRejectId(user.userId)
      await adminUserService.rejectManager(user.username)
      refresh()
    } catch {
      // error visible via list refresh
    } finally {
      setRejectId(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">{totalHits} total users</p>
        </div>
      </div>

      {/* Card */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-gray-200">
          {/* Role tabs */}
          <div className="flex gap-1 flex-wrap">
            {ROLE_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleRoleTab(tab.value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  roleFilter === tab.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative sm:ml-auto sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="search"
              value={keyword}
              onChange={handleKeyword}
              placeholder="Search by name, email..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 text-sm text-red-700 bg-red-50 border-b border-red-100">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <SortTh
                  label="User"
                  sortKey="fullName"
                  currentKey={sortKey}
                  currentDir={sortDir}
                  onSort={handleSort}
                />
                <SortTh
                  label="Role"
                  sortKey="role"
                  currentKey={sortKey}
                  currentDir={sortDir}
                  onSort={handleSort}
                />
                <SortTh
                  label="Status"
                  sortKey="status"
                  currentKey={sortKey}
                  currentDir={sortDir}
                  onSort={handleSort}
                />
                <SortTh
                  label="Joined"
                  sortKey="createdAt"
                  currentKey={sortKey}
                  currentDir={sortDir}
                  onSort={handleSort}
                  className="hidden lg:table-cell"
                />
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide w-20">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Loading users…</p>
                  </td>
                </tr>
              ) : sortedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-500">No users found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Try adjusting the search or role filter
                    </p>
                  </td>
                </tr>
              ) : (
                sortedUsers.map((u) => (
                  <tr
                    key={u.userId}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/users/${u.userId}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={u.fullName} role={u.role} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {u.fullName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <UserRoleBadge role={u.role} />
                    </td>
                    <td className="px-4 py-3">
                      <UserStatusBadge status={u.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    {/* Actions — icon-only buttons */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {/* Block / Unblock */}
                        <button
                          title={isRestricted(u.status) ? "Unblock user" : "Block user"}
                          onClick={(e) => {
                            e.stopPropagation()
                            setConfirm({
                              user: u,
                              type: isRestricted(u.status) ? "unblock" : "block",
                            })
                          }}
                          disabled={actionId === u.userId}
                          className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors disabled:opacity-40 ${
                            isRestricted(u.status)
                              ? "text-green-600 hover:bg-green-50"
                              : "text-red-500 hover:bg-red-50"
                          }`}
                        >
                          {isRestricted(u.status) ? (
                            <ShieldCheck className="h-4 w-4" />
                          ) : (
                            <ShieldOff className="h-4 w-4" />
                          )}
                        </button>

                        {/* Approve — only for WAIT_APPROVED HR Managers, and only visible to HR Manager viewers */}
                        {u.status === "WAIT_APPROVED" &&
                          u.role === "HR_MANAGER" &&
                          authUser?.roles?.includes("ROLE_HR_MANAGER") && (
                          <button
                            title="Approve HR Manager"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleApprove(u)
                            }}
                            disabled={approveId === u.userId}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-40"
                          >
                            {approveId === u.userId ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4" />
                            )}
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          title="Delete user"
                          onClick={(e) => {
                            e.stopPropagation()
                            setConfirm({ user: u, type: "delete" })
                          }}
                          disabled={actionId === u.userId}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm dialog */}
      {confirm && (
        <ConfirmDialog
          state={confirm}
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(null)}
          loading={actionId === confirm.user.userId}
        />
      )}

      {/* Approval queue FAB — only for ADMIN / HRM */}
      <ApprovalQueueButton userRoles={authUser?.roles} />
    </div>
  )
}
