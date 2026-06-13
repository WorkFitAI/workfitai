// Base fetch wrapper with 401 refresh interceptor and concurrent refresh deduplication
import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from "@/lib/auth/token-store";
import { getDeviceId } from "@/lib/auth/device-fingerprint";
import { setSessionCookie } from "@/lib/auth/session-cookie";
import type { UserSession } from "@/types/auth";

// In dev with NEXT_PUBLIC_USE_API_PROXY=true, route browser fetch calls through the
// Next.js API proxy (/api/proxy/*) so the browser treats them as same-origin.
// This makes the HttpOnly refresh cookie work even when FE and BE are on different
// hosts/domains (e.g. localhost:3000 ↔ be.workfitai.uk in local dev).
// Server components skip the proxy and call the backend directly — Node.js fetch
// requires absolute URLs so a relative /api/proxy path would throw ERR_INVALID_URL.
const USE_PROXY = process.env.NEXT_PUBLIC_USE_API_PROXY === "true";
const RAW_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:9085";
const IS_SERVER = typeof window === "undefined";

function apiUrl(path: string): string {
  if (USE_PROXY && !IS_SERVER) {
    return `/api/proxy${path}`;
  }
  return `${RAW_API_BASE}${path}`;
}

/** Error for non-2xx API responses */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Error for 401s after a failed refresh attempt */
export class AuthError extends ApiError {
  constructor(message = "Session expired", status = 401) {
    super(message, status);
    this.name = "AuthError";
  }
}

// Deduplication lock: one refresh at a time
let refreshPromise: Promise<boolean> | null = null;

/** Attempts a silent token refresh; deduplicates concurrent calls */
async function attemptRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const deviceId = getDeviceId();
      const response = await fetch(apiUrl("/auth/refresh"), {
        method: "POST",
        credentials: "include",
        headers: { "X-Device-Id": deviceId },
      });
      if (!response.ok) {
        clearAccessToken();
        return false;
      }
      const json = await response.json();
      const { accessToken, expiryInMs, username, roles } = json.data;
      setAccessToken(accessToken, expiryInMs);
      // Keep auth_session cookie in sync so middleware reflects the refreshed session
      if (username && roles) {
        const normalizedRoles = (roles as string[]).map((r) =>
          r.startsWith("ROLE_") ? r : `ROLE_${r}`,
        ) as UserSession["roles"];
        const session: UserSession = {
          username,
          roles: normalizedRoles,
          expiresAt: Date.now() + expiryInMs,
        };
        setSessionCookie(session);
      }
      return true;
    } catch {
      clearAccessToken();
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/** Core fetch with auth headers, credentials, and 401 → refresh → retry */
async function fetchWithAuth<T>(
  path: string,
  options: RequestInit = {},
  _retried = false,
): Promise<T> {
  const token = getAccessToken();
  const deviceId = getDeviceId();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Device-Id": deviceId,
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(apiUrl(path), {
    ...options,
    headers,
    credentials: "include",
  });

  // Silent refresh on 401 — attempt even when localStorage token is absent
  // (covers the case where the refresh cookie is valid but the in-memory token was lost,
  // e.g. after a page reload or when Playwright restores only cookies + localStorage).
  // The _retried flag prevents infinite retry loops if the re-issued token is also rejected.
  if (response.status === 401 && !_retried) {
    const refreshed = await attemptRefresh();
    if (refreshed) {
      return fetchWithAuth<T>(path, options, true);
    }
    throw new AuthError();
  }

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Request failed" }));
    throw new ApiError(
      error.message || "Request failed",
      response.status,
      error,
    );
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  get<T>(path: string, options?: RequestInit): Promise<T> {
    return fetchWithAuth<T>(path, { ...options, method: "GET" });
  },
  post<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    return fetchWithAuth<T>(path, {
      ...options,
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },
  put<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    return fetchWithAuth<T>(path, {
      ...options,
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },
  patch<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    return fetchWithAuth<T>(path, {
      ...options,
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },
  delete<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    return fetchWithAuth<T>(path, {
      ...options,
      method: "DELETE",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },
  /**
   * Upload FormData (multipart/form-data) — intentionally omits Content-Type
   * so the browser can set it with the correct multipart boundary automatically.
   * Using apiClient.post() for FormData is incorrect: it sets Content-Type:
   * application/json which breaks multipart parsing on the backend.
   */
  upload<T>(path: string, formData: FormData): Promise<T> {
    const token = getAccessToken();
    const deviceId = getDeviceId();

    // Build headers WITHOUT Content-Type — browser fills in boundary
    const headers: Record<string, string> = { "X-Device-Id": deviceId };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    return fetch(apiUrl(path), {
      method: "POST",
      body: formData,
      headers,
      credentials: "include",
    }).then(async (response) => {
      if (response.status === 401 && token) {
        const refreshed = await attemptRefresh();
        if (refreshed) return apiClient.upload<T>(path, formData);
        throw new AuthError();
      }
      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: "Upload failed" }));
        throw new ApiError(error.message || "Upload failed", response.status, error);
      }
      return response.json() as Promise<T>;
    });
  },
};

