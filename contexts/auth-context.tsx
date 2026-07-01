"use client";

// Auth context — provides user session state and auth actions to all components.
// Redux store is kept in sync at every setUser() call via dispatch.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth/auth-service";
import { getAccessToken, isTokenExpired } from "@/lib/auth/token-store";
import { getSessionCookie } from "@/lib/auth/session-cookie";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials, clearCredentials } from "@/store/auth-slice";
import type { LoginRequest, UserSession } from "@/types/auth";

const BROADCAST_CHANNEL = "wfa-auth-channel";
// Schedule next refresh 60s before token expiry
const REFRESH_BUFFER_MS = 60 * 1000;

// Roles that can access the control (HR/Admin) dashboard
const CONTROL_ROLES = ["ROLE_HR", "ROLE_HR_MANAGER", "ROLE_ADMIN"];

interface AuthContextValue {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  /** Apply an already-exchanged OAuth session without a full page reload */
  loginWithSession: (session: UserSession) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Cancellation flag: prevents refresh timer from setting state after logout
  const isLoggedOutRef = useRef(false);
  // Keep a stable ref to the router so timer callbacks don't stale-close over it
  const routerRef = useRef(router);
  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  /** Set user in React state AND sync to Redux store */
  const applyUser = useCallback(
    (session: UserSession | null) => {
      setUser(session);
      if (session) {
        dispatch(setCredentials(session));
      } else {
        dispatch(clearCredentials());
      }
    },
    [dispatch],
  );

  /** Schedule the next silent refresh 1 min before token expiry */
  const scheduleRefresh = useCallback(
    (expiresAt: number) => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);

      const delay = expiresAt - Date.now() - REFRESH_BUFFER_MS;
      if (delay <= 0) return;

      refreshTimerRef.current = setTimeout(async () => {
        // Abort if logout happened while timer was pending
        if (isLoggedOutRef.current) return;

        try {
          const response = await authService.refresh();
          if (isLoggedOutRef.current) return; // logout completed during async refresh

          if (response.data?.accessToken) {
            const { username, roles, expiryInMs } = response.data;
            const newExpiresAt = Date.now() + expiryInMs;
            const normalizedRoles = (roles as string[]).map((r) =>
              r.startsWith("ROLE_") ? r : `ROLE_${r}`,
            ) as UserSession["roles"];
            applyUser({
              username,
              email: `${username}@gmail.com`,
              roles: normalizedRoles,
              expiresAt: newExpiresAt,
            });
            scheduleRefresh(newExpiresAt);
          } else {
            applyUser(null);
            routerRef.current.push("/login");
          }
        } catch {
          if (!isLoggedOutRef.current) {
            applyUser(null);
            routerRef.current.push("/login");
          }
        }
      }, delay);
    },
    [applyUser],
  ); // stable — uses refs for mutable values

  /** Restore user state from a successful refresh response */
  const restoreFromRefresh = useCallback(async (): Promise<boolean> => {
    try {
      const response = await authService.refresh();
      if (response.data?.accessToken) {
        const { username, roles, expiryInMs } = response.data;
        const expiresAt = Date.now() + expiryInMs;
        const normalizedRoles = (roles as string[]).map((r) =>
          r.startsWith("ROLE_") ? r : `ROLE_${r}`,
        ) as UserSession["roles"];
        applyUser({ username, email: username, roles: normalizedRoles, expiresAt });
        scheduleRefresh(expiresAt);
        return true;
      }
    } catch {
      // Refresh failed — no valid session
    }
    return false;
  }, [applyUser, scheduleRefresh]);

  // On mount: restore session from token store, session cookie, or backend refresh token
  useEffect(() => {
    const restore = async () => {
      const token = getAccessToken();

      if (token && !isTokenExpired()) {
        // Fast path: valid token in localStorage — restore from cookie or refresh
        const session = getSessionCookie();
        if (session && session.expiresAt > Date.now()) {
          applyUser(session);
          scheduleRefresh(session.expiresAt);
        } else {
          await restoreFromRefresh();
        }
      } else {
        // No valid token — try backend HttpOnly refresh token cookie
        await restoreFromRefresh();
      }

      setIsLoading(false);
    };

    restore();
  }, [applyUser, scheduleRefresh, restoreFromRefresh]);

  // Cross-tab auth sync via BroadcastChannel:
  // logout → clear session and redirect; login → restore session so all open tabs
  // reflect the new auth state without requiring a page reload.
  useEffect(() => {
    if (typeof window === "undefined") return;

    let channel: BroadcastChannel;
    try {
      channel = new BroadcastChannel(BROADCAST_CHANNEL);
      channel.onmessage = (event) => {
        if (event.data?.type === "logout") {
          isLoggedOutRef.current = true;
          applyUser(null);
          routerRef.current.push("/login");
        } else if (event.data?.type === "login") {
          const session = event.data.session as UserSession;
          if (session && session.expiresAt > Date.now()) {
            isLoggedOutRef.current = false;
            applyUser(session);
            scheduleRefresh(session.expiresAt);
          }
        }
      };
    } catch {
      // BroadcastChannel not supported in this environment
    }

    return () => {
      channel?.close();
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [applyUser, scheduleRefresh]);

  const loginWithSession = useCallback(
    (session: UserSession) => {
      isLoggedOutRef.current = false;
      applyUser(session);
      scheduleRefresh(session.expiresAt);
    },
    [applyUser, scheduleRefresh],
  );

  const login = useCallback(
    async (data: LoginRequest) => {
      const response = await authService.login(data);

      // Guard: a 200-status error body (e.g. invalid credentials) has no accessToken.
      // Throw so callers can surface the server's error message to the user.
      if (!response.data?.accessToken) {
        const message =
          (response as { message?: string }).message ??
          "Login failed. Please check your credentials.";
        throw new Error(message);
      }

      isLoggedOutRef.current = false; // reset in case of re-login after logout
      const { username, roles, expiryInMs, companyId } = response.data;
      const expiresAt = Date.now() + expiryInMs;
      const normalizedRoles = (roles as string[]).map((r) =>
        r.startsWith("ROLE_") ? r : `ROLE_${r}`,
      ) as UserSession["roles"];
      const newSession: UserSession = {
        username,
        email: username,
        companyId: companyId ?? null,
        roles: normalizedRoles,
        expiresAt,
      };
      applyUser(newSession);
      scheduleRefresh(expiresAt);

      // Broadcast login so other open tabs restore auth state immediately
      try {
        const ch = new BroadcastChannel(BROADCAST_CHANNEL);
        ch.postMessage({ type: "login", session: newSession });
        ch.close();
      } catch {
        // BroadcastChannel not supported
      }

      // Role-based redirect: ADMIN / HR → /dashboard, candidates → /
      const isControlUser = normalizedRoles.some((r) =>
        CONTROL_ROLES.includes(r),
      );
      routerRef.current.push(isControlUser ? "/dashboard" : "/");
    },
    [applyUser, scheduleRefresh],
  );

  const logout = useCallback(async () => {
    isLoggedOutRef.current = true;
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    await authService.logout();
    applyUser(null);
    router.push("/login");
  }, [applyUser, router]);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, loginWithSession, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/** Hook to access auth context — must be used inside AuthProvider */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
