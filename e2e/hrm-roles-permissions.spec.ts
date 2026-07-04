/**
 * E2E spec — HR Manager access to Roles & Permissions
 * Runs under the e2e-hrm project (storageState: hrmanager1.json).
 * Playwright config matches: testMatch: 'e2e/hrm-*.spec.ts'
 *
 * Roles & Permissions is now Admin-only — both HR Manager and HR
 * are redirected away (middleware enforcement).
 */
import { test, expect } from '@playwright/test'
import { injectAuthToken } from './helpers/inject-auth-token'

test.describe('HR Manager is blocked from Roles & Permissions', () => {
  test('HR Manager navigating to /roles-permissions is redirected to /dashboard', async ({ page }) => {
    await injectAuthToken(page, 'hrmanager1@gmail.com', 'password@123', 'hrmanager1.json')

    await page.goto('/roles-permissions')

    // Middleware should redirect HR_MANAGER (Admin-only route) away from this route
    await expect(page).not.toHaveURL(/roles-permissions/, { timeout: 15_000 })
    await expect(page).toHaveURL(/dashboard/, { timeout: 10_000 })
  })
})

test.describe('HR user access control', () => {
  test('HR user navigating to /roles-permissions is redirected to /applications/my', async ({ page }) => {
    // Inject HR credentials directly — this test does NOT use hrmanager1 storageState
    await injectAuthToken(page, 'hrtest1@gmail.com', 'password@123', 'hr1.json')

    await page.goto('/roles-permissions')

    // Middleware should redirect HR (no Admin role) away from this route
    await expect(page).not.toHaveURL(/roles-permissions/, { timeout: 10_000 })

    // HR has no dashboard access — middleware sends them to their own application queue
    const url = page.url()
    expect(url).toMatch(/applications\/my|login/)
  })
})
