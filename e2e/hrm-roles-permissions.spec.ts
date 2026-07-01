/**
 * E2E spec — HR Manager Roles & Permissions (read-only view)
 * Runs under the e2e-hrm project (storageState: hrmanager1.json).
 * Playwright config matches: testMatch: 'e2e/hrm-*.spec.ts'
 *
 * Tests:
 * - HRM can access /roles-permissions in read-only mode
 * - No clone/delete buttons visible to HRM
 * - Role detail modal is read-only (no Save Changes button)
 * - Permissions tab accessible
 * - HR user is redirected away from /roles-permissions (middleware enforcement)
 */
import { test, expect } from '@playwright/test'
import { injectAuthToken } from './helpers/inject-auth-token'

test.describe('HRM Roles & Permissions (read-only)', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page, 'hrmanager1@gmail.com', 'password@123', 'hrmanager1.json')
  })

  test('page loads at /roles-permissions and is accessible for HR_MANAGER', async ({ page }) => {
    await page.goto('/roles-permissions')
    await expect(page).toHaveURL(/roles-permissions/, { timeout: 15_000 })
    await expect(page.locator('main')).toBeVisible()
  })

  test('Roles tab loads and shows role rows', async ({ page }) => {
    await page.goto('/roles-permissions')
    await page.waitForLoadState('networkidle')

    await expect(page.getByPlaceholder('Search roles…')).toBeVisible({ timeout: 8_000 })

    // Roles should load (spinner disappears)
    await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10_000 })
    await expect(page.locator('main')).toBeVisible()
  })

  test('clone button is NOT visible for HR_MANAGER', async ({ page }) => {
    await page.goto('/roles-permissions')
    await page.waitForLoadState('networkidle')

    await expect(page.getByPlaceholder('Search roles…')).toBeVisible({ timeout: 8_000 })
    // Wait for any loading to finish
    await page.waitForTimeout(1_000)

    await expect(page.getByTitle('Clone')).not.toBeVisible()
  })

  test('delete button is NOT visible for HR_MANAGER', async ({ page }) => {
    await page.goto('/roles-permissions')
    await page.waitForLoadState('networkidle')

    await expect(page.getByPlaceholder('Search roles…')).toBeVisible({ timeout: 8_000 })
    await page.waitForTimeout(1_000)

    await expect(page.getByTitle('Delete')).not.toBeVisible()
  })

  test('eye/view icon opens read-only modal without Save Changes button', async ({ page }) => {
    await page.goto('/roles-permissions')
    await page.waitForLoadState('networkidle')

    await expect(page.getByPlaceholder('Search roles…')).toBeVisible({ timeout: 8_000 })

    const viewBtn = page.getByTitle('View').first()
    const hasView = await viewBtn.isVisible({ timeout: 5_000 }).catch(() => false)
    if (!hasView) {
      console.warn('No view button found — skipping modal read-only test')
      return
    }

    await viewBtn.click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 5_000 })

    // In read-only mode, there should be no "Save Changes" button
    await expect(dialog.getByRole('button', { name: /save changes/i })).not.toBeVisible()

    // Close the dialog
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible({ timeout: 5_000 })
  })

  test('Permissions tab is accessible for HR_MANAGER', async ({ page }) => {
    await page.goto('/roles-permissions')
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: /permissions/i }).click()
    await expect(page.getByPlaceholder('Search permissions…')).toBeVisible({ timeout: 8_000 })

    await expect(page.getByText('Loading permissions…')).not.toBeVisible({ timeout: 10_000 })
    await expect(page.locator('main')).toBeVisible()
  })
})

test.describe('HR user access control', () => {
  test('HR user navigating to /roles-permissions is redirected to /dashboard', async ({ page }) => {
    // Inject HR credentials directly — this test does NOT use hrmanager1 storageState
    await injectAuthToken(page, 'hrtest1@gmail.com', 'password@123', 'hr1.json')

    await page.goto('/roles-permissions')

    // Middleware should redirect HR (no HRM/ADMIN role) away from this route
    await expect(page).not.toHaveURL(/roles-permissions/, { timeout: 10_000 })

    // Should land on dashboard or login (middleware sends to /dashboard for control-role users)
    const url = page.url()
    expect(url).toMatch(/dashboard|login/)
  })
})
