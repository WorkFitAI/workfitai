import { test as setup } from "@playwright/test";
import * as path from "path";
import { buildAuthSessionCookie, readApiBase } from "../helpers/e2e-target";

export const HR1_AUTH_FILE = path.join(__dirname, "../.auth/hr1.json");

setup("authenticate as hr1", async ({ page }) => {
  const email = process.env.TEST_HR1_EMAIL!;
  const password = process.env.TEST_HR1_PASSWORD!;
  const API_BASE = readApiBase();
  const deviceId = `playwright-e2e-${email.split("@")[0]}`;

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

  await page.evaluate(
    ({ token, expiry, id }: { token: string; expiry: string; id: string }) => {
      localStorage.setItem("wfa_device_id", id);
      localStorage.setItem("wfa_access_token", token);
      localStorage.setItem("wfa_token_expiry", expiry);
    },
    { token: accessToken, expiry: String(expiresAt), id: deviceId },
  );

  await page.context().storageState({ path: HR1_AUTH_FILE });
});
