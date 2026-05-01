"use client";

import { useEffect, useState, useCallback } from "react";
import { userService } from "@/lib/user/user-service";
import { UserSessionInfo } from "@/types/user";

export function useSessions() {
  const [sessions, setSessions] = useState<UserSessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await userService.getActiveSessions();
      setSessions(res.data ?? []);
    } catch {
      setError("Failed to load sessions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return { sessions, loading, error, refresh: fetchSessions };
}
