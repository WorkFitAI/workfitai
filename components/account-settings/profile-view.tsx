"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Edit2,
  Info,
  Briefcase,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CandidateProfile } from "@/types/user";
import AvatarUpload from "./avatar-upload";
import ProfileEditModal from "./profile-edit-modal";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  profile: CandidateProfile | null;
  loading: boolean;
  onProfileUpdated: () => void;
}

function SectionCard({
  title,
  children,
  onEdit,
  emptyText,
}: {
  title: string;
  children?: React.ReactNode;
  onEdit?: () => void;
  emptyText?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-5 border-b border-border">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {onEdit && (
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            title={`Edit ${title}`}
          >
            <Edit2 className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="px-6 py-5">
        {children ?? (
          <p className="text-sm text-muted-foreground italic">
            {emptyText ?? "Not provided"}
          </p>
        )}
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2.5 text-sm text-foreground">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground sr-only">{label}:</span>
      <span>{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: CandidateProfile["userStatus"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        status === "ACTIVE" &&
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        status === "INACTIVE" && "bg-gray-100 text-gray-600",
        status === "BLOCKED" && "bg-red-100 text-red-700",
        status === "DEACTIVATED" && "bg-orange-100 text-orange-700",
      )}
    >
      {status}
    </span>
  );
}

export default function ProfileView({ profile, loading, onProfileUpdated }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Sync avatar URL from profile on first load
  const displayAvatar = avatarUrl ?? profile?.avatarUrl ?? null;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
          <div className="flex items-start gap-5">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-white p-6 shadow-sm space-y-3"
          >
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-lg border border-border bg-white p-8 shadow-sm text-center">
        <p className="text-muted-foreground">Failed to load profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Header card ─────────────────────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-white shadow-sm">
        {/* Edit button top-right */}
        <div className="flex justify-end px-6 pt-4">
          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="px-6 pb-6 pt-2">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* Avatar */}
            <AvatarUpload
              avatarUrl={displayAvatar}
              username={profile.username}
              onAvatarChange={(url) => setAvatarUrl(url)}
              compact
            />

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <h1 className="text-xl font-bold text-foreground">
                  {profile.fullName || "—"}
                </h1>
                <StatusBadge status={profile.userStatus} />
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                @{profile.username}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
                <InfoRow icon={Mail} label="Email" value={profile.email} />
                <InfoRow
                  icon={Phone}
                  label="Phone"
                  value={profile.phoneNumber ?? undefined}
                />
                <InfoRow
                  icon={MapPin}
                  label="Address"
                  value={profile.address ?? undefined}
                />
                <InfoRow
                  icon={Briefcase}
                  label="Current Position"
                  value={profile.expectedPosition ?? undefined}
                />
                {profile.totalExperience !== undefined && (
                  <InfoRow
                    icon={Clock}
                    label="Experience"
                    value={`${profile.totalExperience} yr${profile.totalExperience !== 1 ? "s" : ""} experience`}
                  />
                )}
              </div>

            </div>
          </div>

          {/* Email sync notice */}
          <div className="mt-5 flex items-start gap-3 rounded-xl bg-primary/5 border border-primary/20 px-4 py-3">
            <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-primary/90">
              Your email is synced with your account and cannot be changed here.
            </p>
          </div>
        </div>
      </div>

      {/* ── About Me ────────────────────────────────────────────────────── */}
      <SectionCard
        title="About Me"
        onEdit={() => setEditOpen(true)}
        emptyText="Add a summary to introduce yourself to employers."
      >
        {profile.summary && (
          <p className="text-sm text-foreground leading-relaxed">
            {profile.summary}
          </p>
        )}
      </SectionCard>

      {/* ── Career Objective ─────────────────────────────────────────────── */}
      <SectionCard
        title="Career Objective"
        onEdit={() => setEditOpen(true)}
        emptyText="Describe your career goals and aspirations."
      >
        {profile.careerObjective && (
          <p className="text-sm text-foreground leading-relaxed">
            {profile.careerObjective}
          </p>
        )}
      </SectionCard>

      {/* ── Skills ───────────────────────────────────────────────────────── */}
      <SectionCard
        title="Skills"
        onEdit={() => setEditOpen(true)}
        emptyText="Add your technical and professional skills."
      >
        {profile.skills && profile.skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-foreground"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : null}
      </SectionCard>

      {/* ── Certifications ───────────────────────────────────────────────── */}
      <SectionCard
        title="Certifications"
        onEdit={() => setEditOpen(true)}
        emptyText="Add your certifications and credentials."
      >
        {profile.certifications && (
          <p className="text-sm text-foreground leading-relaxed">
            {profile.certifications}
          </p>
        )}
      </SectionCard>

      {/* ── Account Info ─────────────────────────────────────────────────── */}
      <div className="rounded-lg border border-border bg-white shadow-sm px-6 py-5">
        <h2 className="text-base font-semibold mb-4">Account Information</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Role</p>
            <p className="font-medium">{profile.userRole}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Status</p>
            <StatusBadge status={profile.userStatus} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Member since</p>
            <p className="font-medium">
              {profile.createdDate
                ? new Date(profile.createdDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Edit modal ────────────────────────────────────────────────────── */}
      <ProfileEditModal
        open={editOpen}
        profile={profile}
        onClose={() => setEditOpen(false)}
        onSaved={() => {
          setEditOpen(false);
          onProfileUpdated();
        }}
      />
    </div>
  );
}
