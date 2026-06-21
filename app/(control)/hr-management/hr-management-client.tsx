"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Loader2,
  Users,
  CheckCircle2,
  XCircle,
  Briefcase,
  Mail,
  Phone,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useCompanyHRManagement, useApproveHR, useRejectHR } from "@/hooks/useHrManagement";
import { LottieLoader } from "@/components/ui/lottie-loader";
import type { HRUser } from "@/types/application";

// ─── Role badge ───────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: HRUser["userRole"] }) {
  const cfg =
    role === "HR_MANAGER"
      ? { label: "HR Manager", cls: "bg-orange-100 text-orange-700 ring-orange-200" }
      : { label: "HR", cls: "bg-green-100 text-green-700 ring-green-200" };
  return (
    <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; cls: string }> = {
    ACTIVE: { label: "Active", cls: "bg-green-100 text-green-700 ring-green-200" },
    INACTIVE: { label: "Inactive", cls: "bg-gray-100 text-gray-600 ring-gray-200" },
    BLOCKED: { label: "Blocked", cls: "bg-red-100 text-red-700 ring-red-200" },
    SUSPENDED: { label: "Suspended", cls: "bg-orange-100 text-orange-700 ring-orange-200" },
    DEACTIVATED: { label: "Deactivated", cls: "bg-yellow-100 text-yellow-700 ring-yellow-200" },
    WAIT_APPROVED: { label: "Waiting", cls: "bg-amber-100 text-amber-700 ring-amber-200" },
  };
  const c = cfg[status] ?? { label: status, cls: "bg-gray-100 text-gray-600 ring-gray-200" };
  return (
    <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${c.cls}`}>
      {c.label}
    </span>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name, role }: { name: string; role: HRUser["userRole"] }) {
  const bg = role === "HR_MANAGER" ? "bg-orange-500" : "bg-green-600";
  return (
    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white text-sm font-bold ${bg}`}>
      {name?.charAt(0)?.toUpperCase() ?? "?"}
    </div>
  );
}

// ─── Role filter tabs ─────────────────────────────────────────────────────────

const ROLE_TABS: { label: string; value: "" | "HR" | "HR_MANAGER" }[] = [
  { label: "All", value: "" },
  { label: "HR", value: "HR" },
  { label: "HR Manager", value: "HR_MANAGER" },
];

// ─── Main component ───────────────────────────────────────────────────────────

export default function HrManagementClient() {
  const { user: authUser } = useAuth();
  const companyNo = authUser?.companyId ?? "";
  const isHrManager = authUser?.roles?.includes("ROLE_HR_MANAGER") ?? false;

  const [roleFilter, setRoleFilter] = useState<"" | "HR" | "HR_MANAGER">("");
  const [search, setSearch] = useState("");

  const { hrUsers, loading, error, refresh } = useCompanyHRManagement(companyNo);
  const { approve, approvingId, approveError } = useApproveHR(refresh);
  const { reject, rejectingId, rejectError } = useRejectHR(refresh);

  const filtered = useMemo(() => {
    let list = roleFilter ? hrUsers.filter((u) => u.userRole === roleFilter) : hrUsers;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.department?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [hrUsers, roleFilter, search]);

  if (!companyNo) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
        No company associated with your account.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">HR Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{hrUsers.length} HR members in your company</p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
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
                onClick={() => setRoleFilter(tab.value)}
                className={`rounded-lg px-3 py-1.5 mx-1 text-xs font-medium transition-colors ${
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
              id="hr-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email…"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-3 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Errors */}
        {(error || approveError || rejectError) && (
          <div className="flex items-center gap-2 px-4 py-3 text-sm text-red-700 bg-red-50 border-b border-red-100">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {approveError ?? rejectError ?? error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Department</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Joined</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <LottieLoader size={80} className="mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Loading HR members…</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-500">No HR members found</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting the search or role filter</p>
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.userId} className="hover:bg-gray-50 transition-colors">
                    {/* User cell */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.fullName} role={u.userRole} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{u.fullName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Mail className="h-3 w-3" />
                              {u.email}
                            </span>
                            {u.phoneNumber && (
                              <span className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
                                <Phone className="h-3 w-3" />
                                {u.phoneNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      <RoleBadge role={u.userRole} />
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge status={u.userStatus} />
                    </td>

                    {/* Department */}
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {u.department ? (
                        <span className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Briefcase className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          {u.department}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>

                    {/* Joined */}
                    <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">
                      {u.createdDate
                        ? new Date(u.createdDate).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {/* Approve + Reject — HR_MANAGER acting on WAIT_APPROVED HR users */}
                        {isHrManager &&
                          u.userStatus === "WAIT_APPROVED" &&
                          u.userRole === "HR" && (
                            <>
                              <button
                                title="Approve HR"
                                onClick={() => approve(u)}
                                disabled={approvingId === u.userId || rejectingId === u.userId}
                                className="flex items-center text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors disabled:opacity-50"
                              >
                                {approvingId === u.userId ? (
                                  <Loader2 className="h-7 w-7 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-7 w-7" />
                                )}
                              </button>
                              <button
                                title="Reject HR"
                                onClick={() => reject(u)}
                                disabled={rejectingId === u.userId || approvingId === u.userId}
                                className="flex items-center text-red-600 hover:text-red-800 text-xs font-medium transition-colors disabled:opacity-50"
                              >
                                {rejectingId === u.userId ? (
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                  <XCircle className="h-7 w-7" />
                                )}
                              </button>
                            </>
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
