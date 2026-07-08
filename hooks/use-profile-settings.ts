"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { userService } from "@/lib/user/user-service";
import type { UserProfileSettings } from "@/types/user";

export function useProfileSettings() {
  const [settings, setSettings] = useState<UserProfileSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const res = await userService.getProfileSettings();
      setSettings(res.data ?? null);
    } catch {
      toast.error("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { settings, loading, refresh, setSettings };
}
