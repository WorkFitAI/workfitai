/**
 * Resolves which frontend/backend the e2e suite targets.
 *
 * Defaults to the local dev stack. Set E2E_BASE_URL (e.g. https://workfitai.uk)
 * to point the whole suite — baseURL, webServer skip, and auth cookie domain/secure
 * flags — at a deployed environment instead.
 */
import * as fs from "fs";
import * as path from "path";

export const E2E_BASE_URL = process.env.E2E_BASE_URL || "http://localhost:3000";

const { hostname: E2E_COOKIE_DOMAIN, protocol: E2E_PROTOCOL } = new URL(E2E_BASE_URL);

/** Cookie domain matching the target frontend host ("localhost" or e.g. "workfitai.uk"). */
export { E2E_COOKIE_DOMAIN };

/** Browsers drop Secure cookies set over plain HTTP, so this must track the target's protocol. */
export const E2E_COOKIE_SECURE = E2E_PROTOCOL === "https:";

export function readApiBase(): string {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) return process.env.NEXT_PUBLIC_API_BASE_URL;
  const envPath = path.join(__dirname, "../../.env.local");
  if (fs.existsSync(envPath)) {
    const match = fs.readFileSync(envPath, "utf8").match(/^NEXT_PUBLIC_API_BASE_URL=(.+)$/m);
    if (match) return match[1].trim();
  }
  return "http://localhost:9085";
}

/** Builds the auth_session cookie consumed by middleware.ts, scoped to the current E2E target. */
export function buildAuthSessionCookie(session: Record<string, unknown>) {
  return {
    name: "auth_session",
    value: encodeURIComponent(JSON.stringify(session)),
    domain: E2E_COOKIE_DOMAIN,
    path: "/",
    expires: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    httpOnly: false,
    secure: E2E_COOKIE_SECURE,
    sameSite: "Lax" as const,
  };
}
