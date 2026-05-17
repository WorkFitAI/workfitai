"use client"

import { useState, useCallback, useEffect } from "react"
import {
  UserCheck,
  X,
  Loader2,
  AlertCircle,
  Building2,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  User,
  MapPin,
  Hash,
  CalendarDays,
  Briefcase,
} from "lucide-react"
import { useApprovalQueue } from "@/hooks/useAdminUsers"
import { adminUserService } from "@/lib/admin/admin-user-service"
import type { AdminUserSummary, EsUserHit } from "@/types/admin-user"

// ─── Role badge inside modal ─────────────────────────────────────────────────

function RoleChip({ role }: { role: EsUserHit["role"] }) {
  const cfg =
    role === "HR_MANAGER"
      ? { label: "HR Manager", classes: "bg-orange-100 text-orange-700 ring-orange-200" }
      : { label: "HR", classes: "bg-green-100 text-green-700 ring-green-200" }
  return (
    <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${cfg.classes}`}>
      {cfg.label}
    </span>
  )
}

// ─── Avatar initial ──────────────────────────────────────────────────────────

function Avatar({ name, role, size = "md" }: { name: string; role: EsUserHit["role"]; size?: "sm" | "md" | "lg" }) {
  const initial = name?.charAt(0)?.toUpperCase() ?? "?"
  const bg = role === "HR_MANAGER" ? "bg-orange-500" : "bg-green-600"
  const sz = size === "lg" ? "h-14 w-14 text-lg" : size === "sm" ? "h-7 w-7 text-xs" : "h-9 w-9 text-sm"
  return (
    <div className={`flex shrink-0 items-center justify-center rounded-lg text-white font-bold ${bg} ${sz}`}>
      {initial}
    </div>
  )
}

// ─── Profile detail field ────────────────────────────────────────────────────

function ProfileField({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string | null | undefined
}) {
  if (!value) return null
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-xs text-gray-700 font-medium wrap-break-word">{value}</p>
      </div>
    </div>
  )
}

// ─── Expanded profile panel (lazy-loaded) ────────────────────────────────────

function UserProfilePanel({
  esUser,
  onApprove,
  approvingId,
  onReject,
  rejectingId,
}: {
  esUser: EsUserHit
  onApprove: (user: EsUserHit) => void
  approvingId: string | null
  onReject: (user: EsUserHit) => void
  rejectingId: string | null
}) {
  const [detail, setDetail] = useState<AdminUserSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetched, setFetched] = useState(false)

  // Lazy-fetch once when panel mounts
  const fetchDetail = useCallback(async () => {
    if (fetched) return
    try {
      setLoading(true)
      const res = await adminUserService.getUser(esUser.userId)
      setDetail(res.data ?? null)
    } catch {
      // Swallow — we still show ES data as fallback
    } finally {
      setLoading(false)
      setFetched(true)
    }
  }, [esUser.userId, fetched])

  // Trigger fetch on mount
  useEffect(() => { fetchDetail() }, [fetchDetail])

  const isApproving = approvingId === esUser.userId
  const d = detail // enriched data (may be null while loading)

  return (
    <div className="border-t border-gray-100 bg-gray-50 px-4 py-4">
      {/* Profile header */}
      <div className="flex items-start gap-3 mb-4">
        <Avatar name={esUser.fullName} role={esUser.role} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-900">{esUser.fullName}</p>
            <RoleChip role={esUser.role} />
          </div>
          <p className="text-xs text-gray-500 mt-0.5">@{esUser.username}</p>
          {loading && (
            <div className="flex items-center gap-1 mt-1">
              <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
              <span className="text-[10px] text-gray-400">Loading details…</span>
            </div>
          )}
        </div>
        {/* Approve / Reject buttons in header */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onApprove(esUser)}
            disabled={isApproving || rejectingId === esUser.userId}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
          >
            {isApproving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
            Approve
          </button>
          <button
            onClick={() => onReject(esUser)}
            disabled={rejectingId === esUser.userId || isApproving}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
          >
            {rejectingId === esUser.userId ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <XCircle className="h-3.5 w-3.5" />
            )}
            Reject
          </button>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <ProfileField icon={Mail} label="Email" value={esUser.email} />
        <ProfileField icon={Phone} label="Phone" value={esUser.phoneNumber} />
        <ProfileField icon={Building2} label="Company" value={esUser.companyName ?? d?.companyName} />
        <ProfileField icon={Hash} label="Company No." value={esUser.companyNo ?? d?.companyNo} />
        <ProfileField icon={Briefcase} label="Department" value={d?.department} />
        <ProfileField icon={MapPin} label="Address" value={d?.address} />
        <ProfileField icon={User} label="Username" value={esUser.username} />
        <ProfileField
          icon={CalendarDays}
          label="Registered"
          value={new Date(esUser.createdAt).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        />
        {d?.createdBy && (
          <ProfileField icon={User} label="Created by" value={d.createdBy} />
        )}
      </div>
    </div>
  )
}

// ─── Single queue row (expandable) ───────────────────────────────────────────

interface QueueRowProps {
  user: EsUserHit
  approvingId: string | null
  onApprove: (user: EsUserHit) => void
  rejectingId: string | null
  onReject: (user: EsUserHit) => void
}

function QueueRow({ user, approvingId, onApprove, rejectingId, onReject }: QueueRowProps) {
  const [expanded, setExpanded] = useState(false)
  const isApproving = approvingId === user.userId
  const isRejecting = rejectingId === user.userId

  return (
    <div className="border-b border-gray-100 last:border-0">
      {/* Summary row */}
      <div
        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <Avatar name={user.fullName} role={user.role} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-gray-900 truncate">{user.fullName}</p>
            <RoleChip role={user.role} />
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-gray-500 truncate">
              <Mail className="h-3 w-3 shrink-0" />
              {user.email}
            </span>
            {user.companyName && (
              <span className="flex items-center gap-1 text-xs text-gray-500 truncate">
                <Building2 className="h-3 w-3 shrink-0" />
                {user.companyName}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            <Clock className="h-3 w-3 inline mr-1" />
            Registered {new Date(user.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
          </p>
        </div>

        {/* Right side: approve + reject (stop propagation) + chevron */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onApprove(user)
            }}
            disabled={isApproving || isRejecting}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
          >
            {isApproving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
            Approve
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onReject(user)
            }}
            disabled={isRejecting || isApproving}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
          >
            {isRejecting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <XCircle className="h-3.5 w-3.5" />
            )}
            Reject
          </button>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </div>

      {/* Expanded profile panel */}
      {expanded && (
        <UserProfilePanel
          esUser={user}
          onApprove={onApprove}
          approvingId={approvingId}
          onReject={onReject}
          rejectingId={rejectingId}
        />
      )}
    </div>
  )
}

// ─── Role filter tabs inside modal ───────────────────────────────────────────

const ROLE_FILTER_TABS = [
  { label: "All", value: undefined as "HR_MANAGER" | "HR" | undefined },
  { label: "HR Manager", value: "HR_MANAGER" as const },
  { label: "HR", value: "HR" as const },
]

// ─── Modal ───────────────────────────────────────────────────────────────────

interface ApprovalQueueModalProps {
  onClose: () => void
}

function ApprovalQueueModal({ onClose }: ApprovalQueueModalProps) {
  const [roleFilter, setRoleFilter] = useState<"HR_MANAGER" | "HR" | undefined>(undefined)

  const { queue, totalHits, roleAggregations, loading, error, approvingId, rejectingId, approve, reject, refresh } =
    useApprovalQueue({ role: roleFilter })

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
              <UserCheck className="h-4 w-4 text-blue-700" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Pending Approvals</p>
              <p className="text-xs text-gray-500">{totalHits} waiting for review</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              disabled={loading}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors disabled:opacity-40"
              title="Refresh"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Role filter tabs */}
        <div className="flex gap-1 px-4 pt-3 pb-2 border-b border-gray-100">
          {ROLE_FILTER_TABS.map((tab) => {
            const count = tab.value
              ? (roleAggregations[tab.value] ?? 0)
              : totalHits
            return (
              <button
                key={tab.label}
                onClick={() => setRoleFilter(tab.value)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  roleFilter === tab.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0 text-[10px] font-bold ${
                      roleFilter === tab.value
                        ? "bg-white/30 text-white"
                        : "bg-gray-300 text-gray-700"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Hint */}
        {!loading && queue.length > 0 && (
          <p className="px-4 py-2 text-[10px] text-gray-400 border-b border-gray-50">
            Click a row to view full profile
          </p>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-red-700 bg-red-50 border-b border-red-100">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <p className="text-sm text-gray-500">Loading queue…</p>
            </div>
          ) : queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <CheckCircle2 className="h-8 w-8 text-green-400" />
              <p className="text-sm font-medium text-gray-700">All caught up!</p>
              <p className="text-xs text-gray-400">No pending approvals right now.</p>
            </div>
          ) : (
            queue.map((u) => (
              <QueueRow
                key={u.userId}
                user={u}
                approvingId={approvingId}
                onApprove={approve}
                rejectingId={rejectingId}
                onReject={reject}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Inner button (always mounted when user has role) ────────────────────────

function ApprovalButtonInner() {
  const [open, setOpen] = useState(false)
  const { totalHits } = useApprovalQueue()

  return (
    <>
      {/* Floating action button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 shadow-lg transition-colors"
      >
        <UserCheck className="h-4.5 w-4.5" />
        <span className="text-sm font-medium">Approvals</span>
        {totalHits > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
            {totalHits > 99 ? "99+" : totalHits}
          </span>
        )}
      </button>

      {/* Modal */}
      {open && <ApprovalQueueModal onClose={() => setOpen(false)} />}
    </>
  )
}

// ─── Public guard component ───────────────────────────────────────────────────

/**
 * Reusable floating approval button. Renders only for ADMIN and HR_MANAGER roles.
 * Pass `userRoles` from useAuth() to control visibility.
 */
export function ApprovalQueueButton({ userRoles }: { userRoles?: string[] }) {
  const canApprove = userRoles?.some(
    (r) => r === "ROLE_ADMIN" || r === "ROLE_HR_MANAGER",
  )
  if (!canApprove) return null
  return <ApprovalButtonInner />
}
