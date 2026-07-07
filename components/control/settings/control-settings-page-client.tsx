"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { userService } from "@/lib/user/user-service";
import { useProfileSettings } from "@/hooks/use-profile-settings";
import type {
  UserEmailNotifications,
  UserPushNotifications,
  UserNotifications,
  UserPrivacySettings,
  HrNotificationSettings,
  FeatureSetting,
} from "@/types/user";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Bell,
  Mail,
  Lock,
  Eye,
  Globe,
  Users,
  Activity,
  Search,
  Sparkles,
  Zap,
  ClipboardList,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────

type Tab = "notifications" | "privacy" | "hr-notifications" | "features";

// ─── Skeleton ───────────────────────────────────────────────────────────────

function SectionSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-xl" />
      ))}
    </div>
  );
}

// ─── Toggle Row ─────────────────────────────────────────────────────────────

function ToggleRow({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between bg-white px-4 py-3.5">
      <div className="min-w-0 pr-4">
        <Label htmlFor={id} className="text-sm font-medium cursor-pointer">
          {label}
        </Label>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

// ─── Notifications Panel ────────────────────────────────────────────────────

const EMAIL_FIELDS: { key: keyof UserEmailNotifications; label: string; description: string }[] = [
  { key: "jobAlerts", label: "Job alerts", description: "New job postings matching your preferences." },
  { key: "applicationUpdates", label: "Application updates", description: "Status changes on tracked applications." },
  { key: "messages", label: "Messages", description: "Notifications when you receive new messages." },
  { key: "newsletter", label: "Newsletter", description: "Platform news, tips, and feature highlights." },
  { key: "marketingEmails", label: "Marketing emails", description: "Promotions and offers from WorkfitAI." },
  { key: "securityAlerts", label: "Security alerts", description: "Important alerts about account security." },
];

const PUSH_FIELDS: { key: keyof UserPushNotifications; label: string; description: string }[] = [
  { key: "jobAlerts", label: "Job alerts", description: "Push notifications for new matching jobs." },
  { key: "applicationUpdates", label: "Application updates", description: "Real-time updates on application status." },
  { key: "messages", label: "Messages", description: "Instant notifications for new messages." },
  { key: "reminders", label: "Reminders", description: "Timely reminders for deadlines and follow-ups." },
];

function NotificationsPanel({
  notifications,
  onEmailToggle,
  onPushToggle,
  onSave,
  saving,
}: {
  notifications: UserNotifications;
  onEmailToggle: (key: keyof UserEmailNotifications) => void;
  onPushToggle: (key: keyof UserPushNotifications) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold">Email Notifications</h4>
        </div>
        <p className="text-xs text-muted-foreground">
          Choose which emails you want to receive in your inbox.
        </p>
        <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
          {EMAIL_FIELDS.map(({ key, label, description }) => (
            <ToggleRow
              key={key}
              id={`email-${key}`}
              label={label}
              description={description}
              checked={notifications.email[key]}
              onChange={() => onEmailToggle(key)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold">Push Notifications</h4>
        </div>
        <p className="text-xs text-muted-foreground">
          Manage real-time browser and device push alerts.
        </p>
        <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
          {PUSH_FIELDS.map(({ key, label, description }) => (
            <ToggleRow
              key={key}
              id={`push-${key}`}
              label={label}
              description={description}
              checked={notifications.push[key]}
              onChange={() => onPushToggle(key)}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t border-border">
        <Button onClick={onSave} disabled={saving}>
          {saving ? "Saving…" : "Save preferences"}
        </Button>
      </div>
    </div>
  );
}

// ─── Privacy Panel ──────────────────────────────────────────────────────────

const VISIBILITY_OPTIONS: {
  value: UserPrivacySettings["profileVisibility"];
  label: string;
  description: string;
  icon: React.ElementType;
  badge: string;
}[] = [
  { value: "PUBLIC", label: "Public", description: "Anyone can view your profile.", icon: Globe, badge: "Default" },
  { value: "RECRUITERS_ONLY", label: "Recruiters only", description: "Only recruiters and HR users can see your profile.", icon: Users, badge: "Balanced" },
  { value: "PRIVATE", label: "Private", description: "Only you can view your profile.", icon: Lock, badge: "Most private" },
];

const PRIVACY_SECTIONS = [
  {
    title: "Contact Information",
    fields: [
      { key: "showEmail" as const, label: "Show email address", description: "Display your email on your profile." },
      { key: "showPhone" as const, label: "Show phone number", description: "Display your phone number on your profile." },
      { key: "showLocation" as const, label: "Show location", description: "Display your city or region on your profile." },
    ],
  },
  {
    title: "Activity & Status",
    fields: [
      { key: "showActivityStatus" as const, label: "Show activity status", description: "Let others see when you were last active." },
      { key: "showOnlineStatus" as const, label: "Show online status", description: "Display a green dot when you're online." },
    ],
  },
  {
    title: "Discoverability",
    fields: [
      { key: "allowMessaging" as const, label: "Allow direct messages", description: "Let other users send you messages." },
      { key: "searchIndexing" as const, label: "Search engine indexing", description: "Allow search engines to index your profile." },
    ],
  },
];

function PrivacyPanel({
  privacy,
  onVisibilityChange,
  onToggle,
  onSave,
  saving,
}: {
  privacy: UserPrivacySettings;
  onVisibilityChange: (v: UserPrivacySettings["profileVisibility"]) => void;
  onToggle: (key: keyof Omit<UserPrivacySettings, "profileVisibility">) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-8">
      {/* Visibility picker */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold">Profile Visibility</h4>
        </div>
        <p className="text-xs text-muted-foreground">
          Choose who can discover and view your profile.
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          {VISIBILITY_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = privacy.profileVisibility === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onVisibilityChange(opt.value)}
                className={cn(
                  "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all",
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border bg-white hover:border-primary/40 hover:bg-muted/30",
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon className={cn("h-4 w-4", isSelected ? "text-primary" : "text-muted-foreground")} />
                  <span className={cn("text-sm font-medium", isSelected ? "text-primary" : "text-foreground")}>
                    {opt.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{opt.description}</p>
                <Badge variant={isSelected ? "default" : "outline"} className="text-[10px]">
                  {opt.badge}
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      {/* Toggle sections */}
      {PRIVACY_SECTIONS.map((section) => (
        <div key={section.title} className="space-y-3">
          <h4 className="text-sm font-semibold">{section.title}</h4>
          <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
            {section.fields.map(({ key, label, description }) => (
              <ToggleRow
                key={key}
                id={`privacy-${key}`}
                label={label}
                description={description}
                checked={privacy[key]}
                onChange={() => onToggle(key)}
              />
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground">Changes apply immediately after saving.</p>
        <Button onClick={onSave} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}

// ─── HR Notifications Panel ──────────────────────────────────────────────────

function HrNotificationsPanel({
  hrNotifications,
  onToggle,
  onSave,
  saving,
}: {
  hrNotifications: HrNotificationSettings;
  onToggle: (key: keyof HrNotificationSettings) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold">Recruitment Notifications</h4>
        </div>
        <p className="text-xs text-muted-foreground">
          Configure alerts for recruitment activity in your company.
        </p>
        <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
          <ToggleRow
            id="hr-notifyOnNewApplication"
            label="New applications"
            description="Get notified when a candidate applies to one of your job posts."
            checked={hrNotifications.notifyOnNewApplication}
            onChange={() => onToggle("notifyOnNewApplication")}
          />
          <ToggleRow
            id="hr-notifyOnJobExpiry"
            label="Job post expiry"
            description="Receive a reminder when a job post is about to expire."
            checked={hrNotifications.notifyOnJobExpiry}
            onChange={() => onToggle("notifyOnJobExpiry")}
          />
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t border-border">
        <Button onClick={onSave} disabled={saving}>
          {saving ? "Saving…" : "Save preferences"}
        </Button>
      </div>
    </div>
  );
}

// ─── Features Panel (ADMIN only) ─────────────────────────────────────────────

const FEATURE_META: Record<string, { label: string; description: string }> = {
  "job-recommendation": {
    label: "AI Job Recommendations",
    description: "Enable AI-powered job matching and recommendation engine for candidates.",
  },
  "cv-referral": {
    label: "CV Referral",
    description: "Allow HRs to refer candidate CVs across the platform.",
  },
};

function FeaturesPanel({
  features,
  onToggle,
  saving,
  savingKey,
}: {
  features: FeatureSetting[];
  onToggle: (featureKey: string, enabled: boolean) => void;
  saving: boolean;
  savingKey: string | null;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold">Platform Features</h4>
        </div>
        <p className="text-xs text-muted-foreground">
          Enable or disable platform-wide features. Changes take effect immediately.
        </p>
        <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
          {features.map((feature) => {
            const meta = FEATURE_META[feature.featureKey];
            const isSaving = saving && savingKey === feature.featureKey;
            return (
              <div
                key={feature.featureKey}
                className="flex items-start justify-between bg-white px-4 py-3.5 gap-4"
              >
                <div className="min-w-0 flex-1">
                  <Label
                    htmlFor={`feature-${feature.featureKey}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {meta?.label ?? feature.featureKey}
                  </Label>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {meta?.description ?? ""}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground/70">
                    Last updated {new Date(feature.updatedAt).toLocaleDateString()} by {feature.updatedBy}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 pt-0.5">
                  {isSaving && (
                    <span className="text-xs text-muted-foreground animate-pulse">Saving…</span>
                  )}
                  <Switch
                    id={`feature-${feature.featureKey}`}
                    checked={feature.enabled}
                    disabled={isSaving}
                    onCheckedChange={(checked) => onToggle(feature.featureKey, checked)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function ControlSettingsPageClient() {
  const { settings, loading, setSettings } = useProfileSettings();

  const [activeTab, setActiveTab] = useState<Tab>("notifications");
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [savingFeatureKey, setSavingFeatureKey] = useState<string | null>(null);

  // ── Notifications handlers ────────────────────────────────────────────────
  const handleEmailToggle = useCallback((key: keyof UserEmailNotifications) => {
    setSettings((prev) =>
      prev
        ? { ...prev, notifications: { ...prev.notifications, email: { ...prev.notifications.email, [key]: !prev.notifications.email[key] } } }
        : prev,
    );
  }, [setSettings]);

  const handlePushToggle = useCallback((key: keyof UserPushNotifications) => {
    setSettings((prev) =>
      prev
        ? { ...prev, notifications: { ...prev.notifications, push: { ...prev.notifications.push, [key]: !prev.notifications.push[key] } } }
        : prev,
    );
  }, [setSettings]);

  const handleSaveNotifications = async () => {
    if (!settings) return;
    try {
      setSavingSection("notifications");
      await userService.updateProfileSettings({ notifications: settings.notifications });
      toast.success("Notification preferences saved.");
    } catch {
      toast.error("Failed to save notification preferences.");
    } finally {
      setSavingSection(null);
    }
  };

  // ── Privacy handlers ──────────────────────────────────────────────────────
  const handlePrivacyToggle = useCallback(
    (key: keyof Omit<UserPrivacySettings, "profileVisibility">) => {
      setSettings((prev) =>
        prev ? { ...prev, privacy: { ...prev.privacy, [key]: !prev.privacy[key] } } : prev,
      );
    },
    [setSettings],
  );

  const handleVisibilityChange = useCallback(
    (value: UserPrivacySettings["profileVisibility"]) => {
      setSettings((prev) =>
        prev ? { ...prev, privacy: { ...prev.privacy, profileVisibility: value } } : prev,
      );
    },
    [setSettings],
  );

  const handleSavePrivacy = async () => {
    if (!settings) return;
    try {
      setSavingSection("privacy");
      await userService.updateProfileSettings({ privacy: settings.privacy });
      toast.success("Privacy settings saved.");
    } catch {
      toast.error("Failed to save privacy settings.");
    } finally {
      setSavingSection(null);
    }
  };

  // ── HR notifications handlers ──────────────────────────────────────────────
  const handleHrToggle = useCallback(
    (key: keyof HrNotificationSettings) => {
      setSettings((prev) =>
        prev?.hrNotifications
          ? { ...prev, hrNotifications: { ...prev.hrNotifications, [key]: !prev.hrNotifications[key] } }
          : prev,
      );
    },
    [setSettings],
  );

  const handleSaveHrNotifications = async () => {
    if (!settings?.hrNotifications) return;
    try {
      setSavingSection("hr-notifications");
      await userService.updateProfileSettings({ hrNotifications: settings.hrNotifications });
      toast.success("HR notification preferences saved.");
    } catch {
      toast.error("Failed to save HR notification preferences.");
    } finally {
      setSavingSection(null);
    }
  };

  // ── Features handlers ─────────────────────────────────────────────────────
  const handleFeatureToggle = async (featureKey: string, enabled: boolean) => {
    setSettings((prev) =>
      prev?.features
        ? { ...prev, features: prev.features.map((f) => f.featureKey === featureKey ? { ...f, enabled } : f) }
        : prev,
    );
    try {
      setSavingFeatureKey(featureKey);
      await userService.updateProfileSettings({ features: [{ featureKey, enabled }] });
      toast.success(`Feature "${featureKey}" ${enabled ? "enabled" : "disabled"}.`);
    } catch {
      // Revert on error
      setSettings((prev) =>
        prev?.features
          ? { ...prev, features: prev.features.map((f) => f.featureKey === featureKey ? { ...f, enabled: !enabled } : f) }
          : prev,
      );
      toast.error("Failed to update feature.");
    } finally {
      setSavingFeatureKey(null);
    }
  };

  // ── Tab config ────────────────────────────────────────────────────────────
  const isHrm = settings?.role === "HR_MANAGER";
  const isAdmin = settings?.role === "ADMIN";

  const TABS: { id: Tab; label: string; icon: React.ElementType; hidden?: boolean }[] = [
    { id: "notifications", label: "Notifications", icon: Bell, hidden: isAdmin },
    { id: "privacy", label: "Privacy", icon: Lock, hidden: isAdmin },
    { id: "hr-notifications", label: "HR Notifications", icon: ClipboardList, hidden: !isHrm },
    { id: "features", label: "Features", icon: Sparkles, hidden: !isAdmin },
  ];

  // Admin has no "notifications"/"privacy" tabs — land on the first tab it can actually see.
  useEffect(() => {
    if (isAdmin && (activeTab === "notifications" || activeTab === "privacy")) {
      setActiveTab("features");
    }
  }, [isAdmin, activeTab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your notifications, privacy, and platform preferences.
        </p>
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        {/* Sidebar tabs */}
        <aside className="shrink-0 md:w-52">
          <nav className="rounded-lg border border-border bg-white shadow-sm overflow-hidden">
            {TABS.filter((t) => !t.hidden).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium w-full text-left transition-colors border-b border-border last:border-b-0",
                  activeTab === id
                    ? "bg-primary/10 text-primary border-l-2 border-l-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
            {loading && <SectionSkeleton />}

            {!loading && settings && activeTab === "notifications" && (
              <NotificationsPanel
                notifications={settings.notifications}
                onEmailToggle={handleEmailToggle}
                onPushToggle={handlePushToggle}
                onSave={handleSaveNotifications}
                saving={savingSection === "notifications"}
              />
            )}

            {/* {!loading && settings && activeTab === "privacy" && (
              <PrivacyPanel
                privacy={settings.privacy}
                onVisibilityChange={handleVisibilityChange}
                onToggle={handlePrivacyToggle}
                onSave={handleSavePrivacy}
                saving={savingSection === "privacy"}
              />
            )} */}

            {!loading && settings?.hrNotifications && activeTab === "hr-notifications" && (
              <HrNotificationsPanel
                hrNotifications={settings.hrNotifications}
                onToggle={handleHrToggle}
                onSave={handleSaveHrNotifications}
                saving={savingSection === "hr-notifications"}
              />
            )}

            {!loading && settings?.features && activeTab === "features" && (
              <FeaturesPanel
                features={settings.features}
                onToggle={handleFeatureToggle}
                saving={savingFeatureKey !== null}
                savingKey={savingFeatureKey}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
