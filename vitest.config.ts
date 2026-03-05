import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["__tests__/setup.ts"],
    include: [
      // Unit tests — pure logic, no rendering
      "__tests__/unit/**/*.test.{ts,tsx}",
      // Integration tests — service layer (vi.mock'd api-client, no real fetch/render)
      "__tests__/integration/auth-service.test.ts",
      "__tests__/integration/forgot-password.test.tsx",
      // Toast behavior tests — vi.mock sonner + auth-context, renders LoginForm
      "__tests__/integration/toast.test.tsx",
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
