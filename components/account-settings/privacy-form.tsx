"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { userService } from "@/lib/user/user-service";
import { PrivacySettings } from "@/types/user";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const VISIBILITY_OPTIONS: { value: PrivacySettings["profileVisibility"]; label: string }[] = [
  { value: "PUBLIC", label: "Public — anyone can view your profile" },
  { value: "PRIVATE", label: "Private — only you can view your profile" },
  { value: "FRIENDS_ONLY", label: "Connections only — visible to your network" },
];

const TOGGLE_FIELDS: {
  key: keyof Omit<PrivacySettings, "profileVisibility" | "updatedAt">;
  label: string;
  description: string;
}[] = [
  { key: "showEmail", label: "Show email address", description: "Allow others to see your email on your profile." },
  { key: "showPhoneNumber", label: "Show phone number", description: "Display your phone number on your public profile." },
  { key: "searchEngineIndexed", label: "Search engine indexing", description: "Allow search engines to index your profile page." },
  { key: "allowMessages", label: "Allow messages", description: "Let other users send you direct messages." },
];

export default function PrivacyForm() {
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await userService.getPrivacySettings();
      setSettings(res.data ?? null);
    } catch {
      toast.error("Failed to load privacy settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleToggle = (key: keyof Omit<PrivacySettings, "profileVisibility" | "updatedAt">) => {
    if (!settings) return;
    setSettings((prev) => prev ? { ...prev, [key]: !prev[key] } : prev);
  };

  const handleVisibilityChange = (value: PrivacySettings["profileVisibility"]) => {
    if (!settings) return;
    setSettings((prev) => prev ? { ...prev, profileVisibility: value } : prev);
  };

  const handleSave = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      const { profileVisibility, showEmail, showPhoneNumber, searchEngineIndexed, allowMessages } = settings;
      await userService.updatePrivacySettings({ profileVisibility, showEmail, showPhoneNumber, searchEngineIndexed, allowMessages });
      toast.success("Privacy settings saved.");
    } catch {
      toast.error("Failed to save privacy settings.");
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
      {/* Profile visibility */}
      <div className="rounded-xl border border-border bg-white p-4">
        <Label className="text-sm font-medium">Profile visibility</Label>
        <p className="mt-0.5 mb-3 text-xs text-muted-foreground">
          Control who can discover and view your profile.
        </p>
        <Select value={settings.profileVisibility} onValueChange={handleVisibilityChange}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {VISIBILITY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Toggle fields */}
      <div className="space-y-3">
        {TOGGLE_FIELDS.map(({ key, label, description }) => (
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
          {saving ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </div>
  );
}
