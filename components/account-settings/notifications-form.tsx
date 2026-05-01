"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { userService } from "@/lib/user/user-service";
import { NotificationSettings } from "@/types/user";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const NOTIFICATION_FIELDS: {
  key: keyof Omit<NotificationSettings, "updatedAt">;
  label: string;
  description: string;
}[] = [
  {
    key: "emailNotifications",
    label: "Email notifications",
    description: "Receive updates and alerts via email.",
  },
  {
    key: "applicationUpdates",
    label: "Application updates",
    description: "Get notified when your application status changes.",
  },
  {
    key: "jobRecommendations",
    label: "Job recommendations",
    description: "Receive personalized job suggestions based on your profile.",
  },
  {
    key: "weeklyDigest",
    label: "Weekly digest",
    description: "A weekly summary of new jobs and activity.",
  },
  {
    key: "marketingEmails",
    label: "Marketing emails",
    description: "Promotions, tips, and platform updates from WorkfitAI.",
  },
];

export default function NotificationsForm() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await userService.getNotificationSettings();
      setSettings(res.data ?? null);
    } catch {
      toast.error("Failed to load notification settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleToggle = (key: keyof Omit<NotificationSettings, "updatedAt">) => {
    if (!settings) return;
    setSettings((prev) => prev ? { ...prev, [key]: !prev[key] } : prev);
  };

  const handleSave = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      const { emailNotifications, applicationUpdates, jobRecommendations, marketingEmails, weeklyDigest } = settings;
      await userService.updateNotificationSettings({ emailNotifications, applicationUpdates, jobRecommendations, marketingEmails, weeklyDigest });
      toast.success("Notification settings saved.");
    } catch {
      toast.error("Failed to save notification settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {NOTIFICATION_FIELDS.map(({ key, label, description }) => (
          <div
            key={key}
            className="flex items-center justify-between rounded-xl border border-border bg-white p-4"
          >
            <div className="min-w-0 pr-4">
              <Label htmlFor={key} className="text-sm font-medium cursor-pointer">
                {label}
              </Label>
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            </div>
            <Switch
              id={key}
              checked={!!settings[key]}
              onCheckedChange={() => handleToggle(key)}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save preferences"}
        </Button>
      </div>
    </div>
  );
}
