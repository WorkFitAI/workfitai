import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // E2E — functional flows
    {
      name: 'e2e-chromium',
      testMatch: 'e2e/*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'e2e-firefox',
      testMatch: 'e2e/*.spec.ts',
      use: { ...devices['Desktop Firefox'] },
    },
    // Visual regression — screenshot diffs (chromium only for consistency)
    {
      name: 'visual',
      testMatch: 'e2e/visual/*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    // Accessibility — axe scans
    {
      name: 'a11y',
      testMatch: 'e2e/a11y/*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
