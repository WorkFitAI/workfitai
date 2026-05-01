"use client";

import { useState } from "react";
import { User, Bell, Lock, ShieldAlert, Monitor, Linkedin, Github, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserProfile } from "@/hooks/use-user-profile";
import ProfileView from "./profile-view";
import NotificationsForm from "./notifications-form";
import PrivacyForm from "./privacy-form";
import ChangePasswordForm from "./change-password-form";
import TwoFactorForm from "./two-factor-form";
import DangerZone from "./danger-zone";
import SessionsPanel from "./sessions-panel";

type Tab = "profile" | "notifications" | "privacy" | "sessions" | "danger";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "My Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy & Security", icon: Lock },
  { id: "sessions", label: "Active Sessions", icon: Monitor },
  { id: "danger", label: "Account", icon: ShieldAlert },
];

export default function AccountSettingsPageClient() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const { profile, loading, refresh } = useUserProfile();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-6 md:flex-row md:gap-6">
          {/* ── Sidebar ── */}
          <aside className="shrink-0 md:w-60">
            {/* User card */}
            <div className="rounded-lg border border-border bg-white p-5 shadow-sm mb-4">
              <p className="text-xs text-muted-foreground font-medium mb-1">
                Welcome back
              </p>
              <p className="text-base font-semibold text-foreground truncate capitalize">
                {loading ? "Loading…" : (profile?.fullName ?? "—")}
              </p>

              {/* Social links */}
              {!loading && (profile?.linkedinUrl || profile?.githubUrl || profile?.portfolioLink) && (
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
                  {profile?.linkedinUrl && (
                    <a
                      href={profile.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="LinkedIn"
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-foreground hover:border-[#0077B5] hover:text-[#0077B5] transition-colors"
                    >
                      <Linkedin className="h-3.5 w-3.5 text-[#0077B5]" />
                      LinkedIn
                    </a>
                  )}
                  {profile?.githubUrl && (
                    <a
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="GitHub"
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-foreground hover:border-foreground hover:text-foreground transition-colors"
                    >
                      <Github className="h-3.5 w-3.5" />
                      GitHub
                    </a>
                  )}
                  {profile?.portfolioLink && (
                    <a
                      href={profile.portfolioLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Portfolio"
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-primary" />
                      Portfolio
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Nav */}
            <nav className="rounded-lg border border-border bg-white shadow-sm overflow-hidden">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium w-full text-left transition-colors border-b border-border last:border-b-0",
                    activeTab === id
                      ? "bg-primary/10 text-primary border-l-2 border-l-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    id === "danger" && activeTab !== "danger"
                      ? "hover:text-destructive"
                      : "",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      id === "danger" && "text-destructive",
                    )}
                  />
                  {label}
                </button>
              ))}
            </nav>
          </aside>

          {/* ── Content ── */}
          <main className="flex-1 min-w-0">
            {activeTab === "profile" && (
              <ProfileView
                profile={profile}
                loading={loading}
                onProfileUpdated={refresh}
              />
            )}
            {activeTab === "notifications" && (
              <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-1">
                  Notification preferences
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Choose what you want to be notified about.
                </p>
                <NotificationsForm />
              </div>
            )}
            {activeTab === "privacy" && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">Privacy & Security</h2>
                  <p className="text-sm text-muted-foreground">
                    Manage your password, two-factor authentication, and profile visibility.
                  </p>
                </div>
                <ChangePasswordForm />
                <TwoFactorForm />
                <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
                  <h3 className="text-sm font-semibold mb-4">Profile Visibility</h3>
                  <PrivacyForm />
                </div>
              </div>
            )}
            {activeTab === "sessions" && <SessionsPanel />}
            {activeTab === "danger" && (
              <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-1">
                  Account management
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Deactivate or permanently delete your account.
                </p>
                <DangerZone />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
