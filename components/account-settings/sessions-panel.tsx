"use client";

import { useState } from "react";
import {
  Monitor,
  Smartphone,
  Laptop,
  Globe,
  LogOut,
  Shield,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useSessions } from "@/hooks/use-sessions";
import { userService } from "@/lib/user/user-service";
import { UserSessionInfo } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function DeviceIcon({ name }: { name: string }) {
  const lower = name.toLowerCase();
  if (lower.includes("mobile") || lower.includes("android") || lower.includes("iphone")) {
    return <Smartphone className="h-5 w-5 text-muted-foreground" />;
  }
  if (lower.includes("mac") || lower.includes("windows") || lower.includes("linux")) {
    return <Laptop className="h-5 w-5 text-muted-foreground" />;
  }
  return <Monitor className="h-5 w-5 text-muted-foreground" />;
}

function SessionCard({
  session,
  onRevoke,
}: {
  session: UserSessionInfo;
  onRevoke: (id: string) => Promise<void>;
}) {
  const [revoking, setRevoking] = useState(false);

  const handleRevoke = async () => {
    try {
      setRevoking(true);
      await onRevoke(session.sessionId);
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-xl border p-4 transition-colors",
        session.current
          ? "border-primary/30 bg-primary/5"
          : "border-border bg-white hover:bg-muted/30",
      )}
    >
      {/* Device icon */}
      <div className="mt-0.5 shrink-0 rounded-lg bg-muted p-2">
        <DeviceIcon name={session.deviceName} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-foreground">
            {session.deviceName}
          </span>
          {session.current && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Current session
            </span>
          )}
        </div>

        <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <Globe className="h-3 w-3" />
            {[
              session.location?.city,
              session.location?.region,
              session.location?.country,
            ]
              .filter(Boolean)
              .join(", ") || session.ipAddress}
          </p>
          <p>IP: {session.ipAddress}</p>
          <p>Last active: {formatDate(session.lastActivityAt)}</p>
          <p>Expires: {formatDate(session.expiresAt)}</p>
        </div>
      </div>

      {/* Revoke */}
      {!session.current && (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleRevoke}
          disabled={revoking}
          className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-3.5 w-3.5 mr-1" />
          {revoking ? "Revoking…" : "Revoke"}
        </Button>
      )}
    </div>
  );
}

export default function SessionsPanel() {
  const { sessions, loading, error, refresh } = useSessions();
  const [revokingAll, setRevokingAll] = useState(false);

  const handleRevoke = async (sessionId: string) => {
    try {
      await userService.revokeSession(sessionId);
      toast.success("Session revoked.");
      refresh();
    } catch {
      toast.error("Failed to revoke session.");
    }
  };

  const handleRevokeAll = async () => {
    try {
      setRevokingAll(true);
      await userService.revokeAllOtherSessions();
      toast.success("All other sessions revoked.");
      refresh();
    } catch {
      toast.error("Failed to revoke sessions.");
    } finally {
      setRevokingAll(false);
    }
  };

  const otherSessions = sessions.filter((s) => !s.current);

  return (
    <div className="rounded-2xl border border-border bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border px-6 py-5">
        <div>
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Active Sessions
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage devices logged into your account.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => refresh()}
            className="gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
          {otherSessions.length > 1 && (
            <Button
              size="sm"
              variant="destructive"
              onClick={handleRevokeAll}
              disabled={revokingAll}
              className="gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              {revokingAll ? "Revoking…" : "Revoke all others"}
            </Button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 items-start p-4 border rounded-xl border-border">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-6">
            <p className="text-sm text-destructive">{error}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => refresh()}
              className="mt-3"
            >
              Try again
            </Button>
          </div>
        )}

        {!loading && !error && sessions.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-6">
            No active sessions found.
          </p>
        )}

        {!loading && !error && sessions.length > 0 && (
          <div className="space-y-3">
            {/* Current session first */}
            {sessions
              .slice()
              .sort((a, b) => (b.current ? 1 : 0) - (a.current ? 1 : 0))
              .map((session) => (
                <SessionCard
                  key={session.sessionId}
                  session={session}
                  onRevoke={handleRevoke}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
