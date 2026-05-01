"use client";

import { useEffect, useState, useCallback } from "react";
import { userService } from "@/lib/user/user-service";
import { CandidateProfile } from "@/types/user";

export function useUserProfile() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [profileRes, avatarRes] = await Promise.allSettled([
        userService.getMyProfile(),
        userService.getAvatar(),
      ]);

      if (profileRes.status === "fulfilled") {
        const profileData = profileRes.value.data ?? null;
        // Merge avatar URL if available
        const avatarUrl =
          avatarRes.status === "fulfilled"
            ? (avatarRes.value.data?.avatarUrl ?? null)
            : null;
        setProfile(profileData ? { ...profileData, avatarUrl } : null);
      } else {
        setError("Failed to load profile.");
      }
    } catch {
      setError("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, refresh: fetchProfile };
}
