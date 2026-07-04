import { test as setup } from "@playwright/test";
import * as path from "path";
import { buildAuthSessionCookie, readApiBase } from "../helpers/e2e-target";

export const HRMANAGER1_AUTH_FILE = path.join(
  __dirname,
  "../.auth/hrmanager1.json",
);

setup("authenticate as hrmanager1", async ({ page }) => {
  const email = process.env.TEST_HRMANAGER1_EMAIL!;
  const password = process.env.TEST_HRMANAGER1_PASSWORD!;
  const API_BASE = readApiBase();
  const deviceId = `playwright-e2e-${email.split("@")[0]}`;

  // Login directly via backend API — more reliable than browser form submission
  const loginRes = await page.request.post(`${API_BASE}/auth/login`, {
    data: { usernameOrEmail: email, password },
    headers: { "Content-Type": "application/json", "X-Device-Id": deviceId },
  });
  if (!loginRes.ok()) throw new Error(`Login failed: ${loginRes.status()}`);

  const json = await loginRes.json();
  const { accessToken, expiryInMs, username, roles, companyId } = json?.data ?? {};
  if (!accessToken) throw new Error("No access token in login response");

  await page.goto("/");

  const normalizedRoles = ((roles as string[]) ?? []).map((r: string) =>
    r.startsWith("ROLE_") ? r : `ROLE_${r}`,
  );
  const expiresAt = Date.now() + (expiryInMs ?? 900_000);
  const session = {
    username,
    roles: normalizedRoles,
    companyId: companyId ?? null,
    expiresAt,
  };

  await page.context().addCookies([buildAuthSessionCookie(session)]);

  // Store token in localStorage — token-store.ts reads from localStorage, not sessionStorage
  await page.evaluate(
    ({ token, expiry, id }: { token: string; expiry: string; id: string }) => {
      localStorage.setItem("wfa_device_id", id);
      localStorage.setItem("wfa_access_token", token);
      localStorage.setItem("wfa_token_expiry", expiry);
    },
    { token: accessToken, expiry: String(expiresAt), id: deviceId },
  );

  await page.context().storageState({ path: HRMANAGER1_AUTH_FILE });
});
