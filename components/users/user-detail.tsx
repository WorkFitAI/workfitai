"use client"

import { useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  User,
  ShieldOff,
  ShieldCheck,
  Loader2,
  AlertCircle,
  ExternalLink,
  Github,
  Linkedin,
  Briefcase,
  GraduationCap,
  Award,
  ChevronRight,
} from "lucide-react"
import { useAdminUser } from "@/hooks/useAdminUsers"
import { useAuth } from "@/contexts/auth-context"
import { UserStatusBadge } from "@/components/users/user-status-badge"
import { UserRoleBadge } from "@/components/users/user-role-badge"
import { UserRolesPanel } from "@/components/roles/user-roles-panel"
import { LottieLoader } from "@/components/ui/lottie-loader"
import type { AdminUserStatus } from "@/types/admin-user"

/** Returns true for statuses that should show the Unblock action */
const isRestricted = (s: AdminUserStatus) => s === "BLOCKED" || s === "SUSPENDED"

// ─── Info row ───────────────────────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: React.ReactNode
}) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <Icon className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900 wrap-break-word">{value}</p>
      </div>
    </div>
  )
}

// ─── Section card ────────────────────────────────────────────────────────────

function Card({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 px-5 py-3.5">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="px-5 py-1">{children}</div>
    </div>
  )
}

// ─── Avatar ─────────────────────────────────────────────────────────────────

function DetailAvatar({
  name,
  username,
}: {
  name: string
  username: string
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white text-xl font-bold">
        {name?.charAt(0)?.toUpperCase() ?? "?"}
      </div>
      <div>
        <p className="text-lg font-semibold text-gray-900">{name}</p>
        <p className="text-sm text-gray-500">@{username}</p>
      </div>
    </div>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────

interface UserDetailProps {
  userId: string
}

export function UserDetail({ userId }: UserDetailProps) {
  const { user: currentUser } = useAuth()
  const isAdmin = currentUser?.roles?.includes("ROLE_ADMIN") ?? false
  const isHrManager = currentUser?.roles?.includes("ROLE_HR_MANAGER") ?? false

  const {
    user,
    fullProfile,
    loading,
    fullProfileLoading,
    error,
    blocking,
    fetchFullProfile,
    toggleBlock,
  } = useAdminUser(userId)

  // Auto-load full profile for candidates
  useEffect(() => {
    if (user?.userRole === "CANDIDATE") {
      fetchFullProfile()
    }
  }, [user?.userRole, fetchFullProfile])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <LottieLoader size={90} />
        <p className="text-sm text-gray-500">Loading user…</p>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <AlertCircle className="h-7 w-7 text-red-500" />
        <p className="text-sm text-gray-700 font-medium">
          {error ?? "User not found"}
        </p>
        <Link
          href="/users"
          className="text-sm text-blue-600 hover:underline"
        >
          Back to Users
        </Link>
      </div>
    )
  }

  const isBlocked = isRestricted(user.userStatus)

  return (
    <div className="space-y-5">
      {/* Breadcrumb-style back link */}
      <div className="flex items-center gap-1 text-sm text-gray-500">
        <Link href="/users" className="flex items-center gap-1 hover:text-gray-800 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Users
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
        <span className="text-gray-900 font-medium">{user.fullName}</span>
      </div>

      {/* Top bar: avatar + badges + block button */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <DetailAvatar name={user.fullName} username={user.username} />
        <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
          <UserRoleBadge role={user.userRole} />
          <UserStatusBadge status={user.userStatus} />
          <button
            onClick={toggleBlock}
            disabled={blocking}
            className={`ml-2 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
              isBlocked
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            {blocking ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : isBlocked ? (
              <ShieldCheck className="h-3.5 w-3.5" />
            ) : (
              <ShieldOff className="h-3.5 w-3.5" />
            )}
            {isBlocked ? "Unblock" : "Block"}
          </button>
        </div>
      </div>

      {/* Roles management panel */}
      {(isAdmin || isHrManager) && (
        <UserRolesPanel
          username={user.username}
          isAdmin={isAdmin}
          isHrManager={isHrManager}
          targetUserRole={user.userRole}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left — Basic info */}
        <Card title="Basic Information">
          <InfoRow icon={Mail} label="Email" value={user.email} />
          <InfoRow icon={Phone} label="Phone" value={user.phoneNumber} />
          <InfoRow icon={MapPin} label="Address" value={user.address} />
          <InfoRow icon={Building2} label="Company" value={user.companyName} />
          <InfoRow icon={Building2} label="Department" value={user.department} />
          <InfoRow
            icon={Calendar}
            label="Joined"
            value={
              user.createdDate
                ? new Date(user.createdDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : null
            }
          />
          <InfoRow
            icon={Calendar}
            label="Last updated"
            value={
              user.lastModifiedDate
                ? new Date(user.lastModifiedDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : null
            }
          />
          <InfoRow icon={User} label="Created by" value={user.createdBy} />
        </Card>

        {/* Right — Candidate full profile */}
        {user.userRole === "CANDIDATE" && (
          <div className="space-y-5">
            {fullProfileLoading ? (
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm flex flex-col items-center justify-center py-12 gap-2">
                <LottieLoader size={80} />
                <span className="text-sm text-gray-500">Loading profile…</span>
              </div>
            ) : fullProfile ? (
              <>
                <Card title="Career Profile">
                  {fullProfile.expectedPosition && (
                    <div className="py-2.5 border-b border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Expected Position</p>
                      <p className="text-sm font-semibold text-blue-700">
                        {fullProfile.expectedPosition}
                      </p>
                    </div>
                  )}
                  {fullProfile.careerObjective && (
                    <div className="py-2.5 border-b border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Career Objective</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                        {fullProfile.careerObjective}
                      </p>
                    </div>
                  )}
                  {fullProfile.summary && (
                    <div className="py-2.5 border-b border-gray-100 last:border-0">
                      <p className="text-xs text-gray-500 mb-1">Summary</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                        {fullProfile.summary}
                      </p>
                    </div>
                  )}
                  {typeof fullProfile.totalExperience === "number" && (
                    <div className="flex items-center gap-3 py-2.5 last:border-0">
                      <Briefcase className="h-4 w-4 text-gray-400 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Experience</p>
                        <p className="text-sm font-medium text-gray-900">
                          {fullProfile.totalExperience} year
                          {fullProfile.totalExperience !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  )}
                </Card>

                <Card title="Education & Skills">
                  {fullProfile.education && (
                    <div className="flex items-start gap-3 py-2.5 border-b border-gray-100">
                      <GraduationCap className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Education</p>
                        <p className="text-sm font-medium text-gray-900">
                          {fullProfile.education}
                        </p>
                      </div>
                    </div>
                  )}
                  {fullProfile.certifications && (
                    <div className="flex items-start gap-3 py-2.5 border-b border-gray-100">
                      <Award className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Certifications</p>
                        <p className="text-sm font-medium text-gray-900">
                          {fullProfile.certifications}
                        </p>
                      </div>
                    </div>
                  )}
                  {fullProfile.skills && fullProfile.skills.length > 0 && (
                    <div className="py-2.5">
                      <p className="text-xs text-gray-500 mb-2">Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {fullProfile.skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>

                {(fullProfile.linkedinUrl || fullProfile.githubUrl || fullProfile.portfolioLink) && (
                  <Card title="Links">
                    {fullProfile.linkedinUrl && (
                      <div className="flex items-center gap-3 py-2.5 border-b border-gray-100">
                        <Linkedin className="h-4 w-4 text-gray-400 shrink-0" />
                        <a
                          href={fullProfile.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1 truncate"
                        >
                          LinkedIn
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      </div>
                    )}
                    {fullProfile.githubUrl && (
                      <div className="flex items-center gap-3 py-2.5 border-b border-gray-100">
                        <Github className="h-4 w-4 text-gray-400 shrink-0" />
                        <a
                          href={fullProfile.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1 truncate"
                        >
                          GitHub
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      </div>
                    )}
                    {fullProfile.portfolioLink && (
                      <div className="flex items-center gap-3 py-2.5">
                        <ExternalLink className="h-4 w-4 text-gray-400 shrink-0" />
                        <a
                          href={fullProfile.portfolioLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline flex items-center gap-1 truncate"
                        >
                          Portfolio
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      </div>
                    )}
                  </Card>
                )}
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
