/**
 * Utility for Playwright e2e tests — injects a fresh access token into sessionStorage
 * AND sets the auth_session cookie needed for Next.js SSR middleware.
 *
 * Problem: storageState persists cookies + localStorage but NOT sessionStorage.
 * The wfa_access_token lives in sessionStorage, so spec tests start without it.
 * Without it the first API call gets 401, the refresh fails (no refreshToken cookie
 * in the storageState from the backend domain api.workfitai.uk), and the page
 * redirects to /login.
 *
 * Fix: before each test, call page.request.post to get a fresh access token, then:
 *   1. Add the auth_session cookie so the SSR middleware grants access on navigation
 *   2. Use page.addInitScript to inject wfa_access_token into sessionStorage so
 *      client-side API calls succeed immediately without a refresh round-trip.
 */
import type { Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

function readApiBase(): string {
  if (process.env.NEXT_PUBLIC_API_BASE_URL)
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  const envPath = path.join(__dirname, "../../.env.local");
  if (fs.existsSync(envPath)) {
    const match = fs
      .readFileSync(envPath, "utf-8")
      .match(/^NEXT_PUBLIC_API_BASE_URL=(.+)$/m);
    if (match) return match[1].trim();
  }
  return "http://localhost:9085";
}

export async function injectAuthToken(
  page: Page,
  usernameOrEmail: string,
  password: string,
  authFilename: string,
): Promise<void> {
  const API_BASE = readApiBase();
  const authFilePath = path.join(__dirname, "../.auth", authFilename);

  let deviceId = `playwright-e2e-${usernameOrEmail.split("@")[0]}`;
  if (fs.existsSync(authFilePath)) {
    try {
      const storageState = JSON.parse(fs.readFileSync(authFilePath, "utf-8"));
      const found = storageState.origins
        ?.find((o: { origin: string }) => o.origin === "http://localhost:3000")
        ?.localStorage?.find(
          (item: { name: string }) => item.name === "wfa_device_id",
        )?.value;
      if (found) deviceId = found;
    } catch {
      // use default device ID
    }
  }

  try {
    const loginRes = await page.request.post(`${API_BASE}/auth/login`, {
      data: { usernameOrEmail, password },
      headers: { "Content-Type": "application/json", "X-Device-Id": deviceId },
    });

    if (!loginRes.ok()) return;

    const json = await loginRes.json();
    const { accessToken, expiryInMs, username, roles, companyId } =
      json?.data ?? {};
    if (!accessToken) return;

    // Build the auth_session cookie payload (matches setSessionCookie in lib/auth/session-cookie.ts)
    const normalizedRoles = ((roles as string[]) ?? []).map((r: string) =>
      r.startsWith("ROLE_") ? r : `ROLE_${r}`,
    );
    const session = {
      username,
      roles: normalizedRoles,
      companyId: companyId ?? null,
      expiresAt: Date.now() + (expiryInMs ?? 900_000),
    };
    const sessionValue = encodeURIComponent(JSON.stringify(session));

    // Set auth_session so the Next.js SSR middleware grants access on navigation
    await page.context().addCookies([
      {
        name: "auth_session",
        value: sessionValue,
        domain: "localhost",
        path: "/",
        expires: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
        httpOnly: false,
        secure: false,
        sameSite: "Lax",
      },
    ]);

    // Inject wfa_access_token so client-side API calls don't need a refresh round-trip
    const expiresAt = String(Date.now() + (expiryInMs ?? 900_000));
    await page.addInitScript(
      ({ token, expiry }: { token: string; expiry: string }) => {
        sessionStorage.setItem("wfa_access_token", token);
        sessionStorage.setItem("wfa_token_expiry", expiry);
      },
      { token: accessToken, expiry: expiresAt },
    );
  } catch {
    // Login failed — fall back to cookie-based auth from storageState
  }
}
