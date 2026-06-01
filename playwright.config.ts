import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(__dirname, '.env.local') })

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  timeout: 60_000,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    channel: 'chrome',
  },
  projects: [
    // ── Auth setups ─────────────────────────────────────────────────────────
    {
      name: 'candidate-setup',
      testMatch: 'e2e/setup/candidate-auth.setup.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'admin-setup',
      testMatch: 'e2e/setup/admin-auth.setup.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'hrmanager1-setup',
      testMatch: 'e2e/setup/hrmanager1-auth.setup.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'hr1-setup',
      testMatch: 'e2e/setup/hr1-auth.setup.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'candidate1-setup',
      testMatch: 'e2e/setup/candidate1-auth.setup.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    // ── Data setup (depends on HRM auth) ────────────────────────────────────
    {
      name: 'hrm-job-data-setup',
      testMatch: 'e2e/setup/hrm-job-data.setup.ts',
      dependencies: ['hrmanager1-setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/hrmanager1.json',
      },
    },
    {
      name: 'candidate1-apply-data-setup',
      testMatch: 'e2e/setup/candidate1-apply-data.setup.ts',
      dependencies: ['candidate1-setup', 'hrm-job-data-setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/candidate1.json',
      },
    },
    // ── Functional E2E projects (role-based) ─────────────────────────────────
    {
      name: 'e2e-candidate',
      testMatch: 'e2e/candidate-*.spec.ts',
      dependencies: ['candidate1-setup', 'hrm-job-data-setup', 'candidate1-apply-data-setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/candidate1.json',
      },
    },
    {
      name: 'e2e-hrm',
      testMatch: 'e2e/hrm-*.spec.ts',
      dependencies: ['hrm-job-data-setup', 'candidate1-apply-data-setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/hrmanager1.json',
      },
    },
    {
      name: 'e2e-hr',
      testMatch: 'e2e/hr-*.spec.ts',
      dependencies: ['hr1-setup', 'hrm-job-data-setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/hr1.json',
      },
    },
    {
      name: 'e2e-admin',
      testMatch: 'e2e/admin-*.spec.ts',
      dependencies: ['admin-setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
    },
    // ── Legacy chromium (pre-role-split spec files only) ────────────────────
    // Deliberately excludes candidate-*, hrm-*, hr-*, admin-*.spec.ts because
    // those are run under their own role-based projects above with the correct
    // storage state. Running them here with candidate.json would cause auth
    // redirects and false failures.
    {
      name: 'e2e-chromium',
      testMatch: [
        'e2e/application-flow.spec.ts',
        'e2e/auth.spec.ts',
        'e2e/homepage.spec.ts',
        'e2e/route-protection.spec.ts',
      ],
      dependencies: ['candidate-setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/candidate.json',
      },
    },
    {
      name: 'e2e-firefox',
      testMatch: [
        'e2e/application-flow.spec.ts',
        'e2e/auth.spec.ts',
        'e2e/homepage.spec.ts',
        'e2e/route-protection.spec.ts',
      ],
      use: { ...devices['Desktop Firefox'] },
    },
    // ── Visual regression ───────────────────────────────────────────────────
    {
      name: 'visual',
      testMatch: 'e2e/visual/*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    // ── Accessibility ───────────────────────────────────────────────────────
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
    timeout: 180_000,
    env: {
      NODE_OPTIONS: '--max-old-space-size=4096',
    },
  },
})
