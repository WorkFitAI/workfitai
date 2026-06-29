"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { userService } from "@/lib/user/user-service";
import { useProfileSettings } from "@/hooks/use-profile-settings";
import type { UserEmailNotifications, UserPushNotifications, UserNotifications } from "@/types/user";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Bell } from "lucide-react";

const EMAIL_FIELDS: { key: keyof UserEmailNotifications; label: string; description: string }[] = [
  { key: "jobAlerts", label: "Job alerts", description: "New job postings matching your profile and preferences." },
  { key: "applicationUpdates", label: "Application updates", description: "Status changes to your submitted job applications." },
  { key: "messages", label: "Messages", description: "Notifications when you receive new messages." },
  { key: "newsletter", label: "Newsletter", description: "Platform news, tips, and feature highlights." },
  { key: "marketingEmails", label: "Marketing emails", description: "Promotions and special offers from WorkfitAI." },
  { key: "securityAlerts", label: "Security alerts", description: "Important alerts about account security and sign-ins." },
];

const PUSH_FIELDS: { key: keyof UserPushNotifications; label: string; description: string }[] = [
  { key: "jobAlerts", label: "Job alerts", description: "Push notifications for new matching jobs." },
  { key: "applicationUpdates", label: "Application updates", description: "Real-time updates on your application status." },
  { key: "messages", label: "Messages", description: "Instant notifications for new messages." },
  { key: "reminders", label: "Reminders", description: "Timely reminders for deadlines and follow-ups." },
];

function NotificationsSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 2 }).map((_, s) => (
        <div key={s} className="space-y-3">
          <Skeleton className="h-5 w-40" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ))}
    </div>
  );
}

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

export default function NotificationsForm() {
  const { settings: profileSettings, loading } = useProfileSettings();
  const [notifications, setNotifications] = useState<UserNotifications | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profileSettings?.notifications) {
      setNotifications(profileSettings.notifications);
    }
  }, [profileSettings?.notifications]);

  const handleEmailToggle = useCallback((key: keyof UserEmailNotifications) => {
    setNotifications((prev) =>
      prev ? { ...prev, email: { ...prev.email, [key]: !prev.email[key] } } : prev,
    );
  }, []);

  const handlePushToggle = useCallback((key: keyof UserPushNotifications) => {
    setNotifications((prev) =>
      prev ? { ...prev, push: { ...prev.push, [key]: !prev.push[key] } } : prev,
    );
  }, []);

  const handleSave = async () => {
    if (!notifications) return;
    try {
      setSaving(true);
      await userService.updateProfileSettings({ notifications });
      toast.success("Notification preferences saved.");
    } catch {
      toast.error("Failed to save notification preferences.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <NotificationsSkeleton />;
  if (!notifications) return null;

  return (
    <div className="space-y-8">
      {/* Email notifications */}
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
              onChange={() => handleEmailToggle(key)}
            />
          ))}
        </div>
      </div>

      {/* Push notifications */}
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
              onChange={() => handlePushToggle(key)}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t border-border">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save preferences"}
        </Button>
      </div>
    </div>
  );
}
