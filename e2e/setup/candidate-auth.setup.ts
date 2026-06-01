import { test as setup } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

export const CANDIDATE_AUTH_FILE = path.join(
  __dirname,
  "../.auth/candidate.json",
);

function readApiBase(): string {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) return process.env.NEXT_PUBLIC_API_BASE_URL;
  const envPath = path.join(__dirname, "../../.env.local");
  if (fs.existsSync(envPath)) {
    const match = fs.readFileSync(envPath, "utf8").match(/^NEXT_PUBLIC_API_BASE_URL=(.+)$/m);
    if (match) return match[1].trim();
  }
  return "http://localhost:9085";
}

setup("authenticate as candidate", async ({ page }) => {
  const email = process.env.TEST_CANDIDATE1_EMAIL!;
  const password = process.env.TEST_CANDIDATE1_PASSWORD!;
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

  await page.context().addCookies([
    {
      name: "auth_session",
      value: encodeURIComponent(JSON.stringify(session)),
      domain: "localhost",
      path: "/",
      expires: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
    },
  ]);

  await page.evaluate(
    ({ token, expiry, id }: { token: string; expiry: string; id: string }) => {
      localStorage.setItem("wfa_device_id", id);
      localStorage.setItem("wfa_access_token", token);
      localStorage.setItem("wfa_token_expiry", expiry);
    },
    { token: accessToken, expiry: String(expiresAt), id: deviceId },
  );

  await page.context().storageState({ path: CANDIDATE_AUTH_FILE });
});
