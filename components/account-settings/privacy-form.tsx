"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { userService } from "@/lib/user/user-service";
import { useProfileSettings } from "@/hooks/use-profile-settings";
import type { UserPrivacySettings } from "@/types/user";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Eye, Mail, Phone, MapPin, MessageSquare, Activity, Radio, Search, Sparkles, Globe, Lock, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const VISIBILITY_OPTIONS: {
  value: UserPrivacySettings["profileVisibility"];
  label: string;
  description: string;
  icon: React.ElementType;
  badge: string;
  badgeVariant: "default" | "secondary" | "outline";
}[] = [
  {
    value: "PUBLIC",
    label: "Public",
    description: "Anyone on the internet can view your profile.",
    icon: Globe,
    badge: "Recommended for job seekers",
    badgeVariant: "default",
  },
  {
    value: "RECRUITERS_ONLY",
    label: "Recruiters only",
    description: "Only recruiters and HR users can see your profile.",
    icon: Users,
    badge: "Balanced",
    badgeVariant: "secondary",
  },
  {
    value: "PRIVATE",
    label: "Private",
    description: "Only you can view your profile.",
    icon: Lock,
    badge: "Most private",
    badgeVariant: "outline",
  },
];

interface ToggleSection {
  title: string;
  description: string;
  icon: React.ElementType;
  fields: {
    key: keyof Omit<UserPrivacySettings, "profileVisibility">;
    label: string;
    description: string;
  }[];
}

const TOGGLE_SECTIONS: ToggleSection[] = [
  {
    title: "Contact Information",
    description: "Control what contact details others can see on your profile.",
    icon: Mail,
    fields: [
      { key: "showEmail", label: "Show email address", description: "Display your email on your public profile." },
      { key: "showPhone", label: "Show phone number", description: "Display your phone number on your profile." },
      { key: "showLocation", label: "Show location", description: "Display your city or region on your profile." },
    ],
  },
  {
    title: "Activity & Status",
    description: "Manage what others see about your presence and activity.",
    icon: Activity,
    fields: [
      { key: "showActivityStatus", label: "Show activity status", description: "Let others see when you were last active." },
      { key: "showOnlineStatus", label: "Show online status", description: "Display a green dot when you're online." },
    ],
  },
  {
    title: "Discoverability",
    description: "Control how others can find and reach you.",
    icon: Search,
    fields: [
      { key: "allowMessaging", label: "Allow direct messages", description: "Let other users send you messages." },
      { key: "searchIndexing", label: "Search engine indexing", description: "Allow search engines to index your profile page." },
    ],
  },
  {
    title: "AI Features",
    description: "Manage AI-powered personalization settings.",
    icon: Sparkles,
    fields: [
      { key: "aiJobRecommendationEnabled", label: "AI job recommendations", description: "Receive AI-curated job matches based on your profile and behavior." },
    ],
  },
];

function PrivacyFormSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-28 w-full rounded-xl" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export default function PrivacyForm() {
  const { settings: profileSettings, loading } = useProfileSettings();
  const [privacy, setPrivacy] = useState<UserPrivacySettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profileSettings?.privacy) {
      setPrivacy(profileSettings.privacy);
    }
  }, [profileSettings?.privacy]);

  const handleToggle = useCallback(
    (key: keyof Omit<UserPrivacySettings, "profileVisibility">) => {
      setPrivacy((prev) => (prev ? { ...prev, [key]: !prev[key] } : prev));
    },
    [],
  );

  const handleVisibilityChange = useCallback(
    (value: UserPrivacySettings["profileVisibility"]) => {
      setPrivacy((prev) => (prev ? { ...prev, profileVisibility: value } : prev));
    },
    [],
  );

  const handleSave = async () => {
    if (!privacy) return;
    try {
      setSaving(true);
      await userService.updateProfileSettings({ privacy });
      toast.success("Privacy settings saved.");
    } catch {
      toast.error("Failed to save privacy settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PrivacyFormSkeleton />;
  if (!privacy) return null;

  const selectedVisibility = VISIBILITY_OPTIONS.find(
    (o) => o.value === privacy.profileVisibility,
  );

  return (
    <div className="space-y-8">
      {/* Profile Visibility */}
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
                onClick={() => handleVisibilityChange(opt.value)}
                className={cn(
                  "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all",
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border bg-white hover:border-primary/40 hover:bg-muted/30",
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      isSelected ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isSelected ? "text-primary" : "text-foreground",
                    )}
                  >
                    {opt.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {opt.description}
                </p>
                <Badge variant={isSelected ? "default" : opt.badgeVariant} className="text-[10px]">
                  {opt.badge}
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      {/* Toggle sections */}
      {TOGGLE_SECTIONS.map((section) => {
        const SectionIcon = section.icon;
        return (
          <div key={section.title} className="space-y-3">
            <div className="flex items-center gap-2">
              <SectionIcon className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold">{section.title}</h4>
            </div>
            <p className="text-xs text-muted-foreground">{section.description}</p>
            <div className="rounded-xl border border-border overflow-hidden divide-y divide-border">
              {section.fields.map(({ key, label, description }) => (
                <div
                  key={key}
                  className="flex items-center justify-between bg-white px-4 py-3.5"
                >
                  <div className="min-w-0 pr-4">
                    <Label
                      htmlFor={key}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {label}
                    </Label>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {description}
                    </p>
                  </div>
                  <Switch
                    id={key}
                    checked={!!privacy[key]}
                    onCheckedChange={() => handleToggle(key)}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Changes apply immediately after saving.
        </p>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
