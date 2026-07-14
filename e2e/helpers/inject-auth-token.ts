/**
 * Utility for Playwright e2e tests — injects a fresh access token into localStorage
 * AND sets the auth_session cookie needed for Next.js SSR middleware.
 *
 * storageState persists cookies + localStorage (including wfa_access_token since the
 * switch from sessionStorage). However tokens expire, so we still fetch a fresh one
 * before each test to guarantee the token is valid for the test duration.
 *
 * Fix: before each test, call page.request.post to get a fresh access token, then:
 *   1. Add the auth_session cookie so the SSR middleware grants access on navigation
 *   2. Use page.addInitScript to inject wfa_access_token into localStorage so
 *      client-side API calls succeed immediately without a refresh round-trip.
 */
import type { Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { E2E_BASE_URL, buildAuthSessionCookie, readApiBase } from "./e2e-target";

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
        ?.find((o: { origin: string }) => o.origin === E2E_BASE_URL)
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
    const shouldDismissJobPreferences = normalizedRoles.includes("ROLE_CANDIDATE");
    const session = {
      username,
      roles: normalizedRoles,
      companyId: companyId ?? null,
      expiresAt: Date.now() + (expiryInMs ?? 900_000),
    };
    // Set auth_session so the Next.js SSR middleware grants access on navigation
    await page.context().addCookies([buildAuthSessionCookie(session)]);

    // Inject wfa_access_token so client-side API calls don't need a refresh round-trip
    const expiresAt = String(Date.now() + (expiryInMs ?? 900_000));
    await page.addInitScript(
      ({ token, expiry, dismissJobPreferences }: {
        token: string;
        expiry: string;
        dismissJobPreferences: boolean;
      }) => {
        localStorage.setItem("wfa_access_token", token);
        localStorage.setItem("wfa_token_expiry", expiry);
        if (
          dismissJobPreferences &&
          sessionStorage.getItem("wfa:e2e-onboarding-seeded") !== "true"
        ) {
          if (!localStorage.getItem("wfa:job-preferences")) {
            localStorage.setItem(
              "wfa:job-preferences",
              JSON.stringify({ status: "dismissed", prefs: null, declaredAt: Date.now() }),
            );
          }
          sessionStorage.setItem("wfa:e2e-onboarding-seeded", "true");
        }
      },
      { token: accessToken, expiry: expiresAt, dismissJobPreferences: shouldDismissJobPreferences },
    );
  } catch {
    // Login failed — fall back to cookie-based auth from storageState
  }
}
