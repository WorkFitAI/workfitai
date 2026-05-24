import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["__tests__/setup.ts"],
    env: {
      NEXT_PUBLIC_API_BASE_URL: "https://api.workfitai.uk",
    },
    include: [
      // Unit tests — pure logic, no rendering
      "__tests__/unit/**/*.test.{ts,tsx}",
      // Integration tests — service layer (vi.mock'd api-client, no real fetch/render)
      "__tests__/integration/auth-service.test.ts",
      "__tests__/integration/cv-service.test.ts",
      "__tests__/integration/forgot-password.test.tsx",
      // Auth form integration tests (MSW + RTL)
      "__tests__/integration/login.test.tsx",
      "__tests__/integration/register-candidate.test.tsx",
      "__tests__/integration/register-hr.test.tsx",
      "__tests__/integration/register-hr-manager.test.tsx",
      "__tests__/integration/verify-otp.test.tsx",
      // Toast behavior tests — vi.mock sonner + auth-context, renders LoginForm
      "__tests__/integration/toast.test.tsx",
      // Application system integration tests (MSW + RTL)
      "__tests__/integration/applied-jobs-page.test.tsx",
      "__tests__/integration/application-detail.test.tsx",
      // HRM integration tests (MSW + RTL)
      "__tests__/integration/hr-management-page.test.tsx",
      "__tests__/integration/hrm-application-list.test.tsx",
      "__tests__/integration/hrm-notes-management.test.tsx",
      // Report workflow integration tests (vi.mock'd api-client)
      "__tests__/integration/report-workflow.test.ts",
      // Jobs, CV, and apply-now integration tests (MSW + RTL)
      "__tests__/integration/jobs-page.test.tsx",
      "__tests__/integration/cv-management.test.tsx",
      "__tests__/integration/apply-now-modal.test.tsx",
      // kafka-otp.test.ts intentionally excluded — requires live backend + Kafka infra
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      // Only measure coverage for files that have unit tests.
      // Network-dependent files (api-client, auth-service, auth-context)
      // are covered at the E2E/integration level instead.
      include: [
        "lib/auth/token-store.ts",
        "lib/auth/session-cookie.ts",
        "lib/schemas/auth-schemas.ts",
        "store/auth-slice.ts",
        "middleware.ts",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
    },
  },
});
