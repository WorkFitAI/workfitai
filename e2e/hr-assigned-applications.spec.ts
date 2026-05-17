/**
 * E2E spec — HR Staff Assigned Applications (/applications/my)
 * Runs under the e2e-hr project (storageState: hr1.json).
 * Playwright config matches: testMatch: 'e2e/hr-*.spec.ts'
 * Depends on: hr1-setup, hrm-job-data-setup
 */
import { test, expect } from '@playwright/test'
import { injectAuthToken } from './helpers/inject-auth-token'

test.describe('HR Assigned Applications (/applications/my)', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page, 'hrtest1@gmail.com', 'password@123', 'hr1.json')
  })

  test('page loads and shows a relevant heading', async ({ page }) => {
    await page.goto('/applications/my')
    await expect(page).toHaveURL(/applications\/my/, { timeout: 15_000 })
    await expect(page.locator('main')).toBeVisible()

    // Heading should reference applications or assigned work
    const heading = page
      .getByRole('heading', { name: /applications?|assigned|my applications/i })
      .first()
    await expect(heading).toBeVisible({ timeout: 10_000 })
  })

  test('status filter and search inputs are rendered', async ({ page }) => {
    await page.goto('/applications/my')
    await page.waitForLoadState('networkidle')

    // Search input — HR my-applications page uses similar search pattern
    const searchInput = page
      .getByPlaceholder(/search/i)
      .or(page.getByRole('searchbox'))
      .first()

    const hasSearch = await searchInput.isVisible({ timeout: 8_000 }).catch(() => false)

    // Status filter — select or button tabs
    const hasStatusFilter = await page
      .locator('select')
      .or(page.getByRole('button', { name: /all|applied|reviewing/i }).first())
      .first()
      .isVisible({ timeout: 5_000 })
      .catch(() => false)

    // At least one of search or status filter must exist
    expect(hasSearch || hasStatusFilter).toBeTruthy()
  })

  test('application table or empty state is visible after load', async ({ page }) => {
    await page.goto('/applications/my')
    await page.waitForLoadState('networkidle')

    const hasTable = await page
      .locator('table')
      .first()
      .isVisible({ timeout: 8_000 })
      .catch(() => false)

    const hasEmptyState = await page
      .getByText(/no applications found|no assigned/i)
      .first()
      .isVisible({ timeout: 3_000 })
      .catch(() => false)

    expect(hasTable || hasEmptyState).toBeTruthy()
  })

  test('search input accepts text', async ({ page }) => {
    await page.goto('/applications/my')
    await page.waitForLoadState('networkidle')

    const searchInput = page
      .getByPlaceholder(/search/i)
      .or(page.getByRole('searchbox'))
      .first()

    if (!(await searchInput.isVisible({ timeout: 8_000 }).catch(() => false))) {
      test.skip(true, 'No search input found')
      return
    }

    await searchInput.fill('nonexistent-xyz')
    await expect(searchInput).toHaveValue('nonexistent-xyz')
  })

  test('View button opens the application detail panel when applications exist', async ({ page }) => {
    await page.goto('/applications/my')
    await page.waitForLoadState('networkidle')

    const viewBtn = page.getByRole('button', { name: /^view$/i }).first()
    if (!(await viewBtn.isVisible({ timeout: 8_000 }).catch(() => false))) {
      test.skip(true, 'No applications assigned to hr1 — skipping detail panel test')
      return
    }

    await viewBtn.click()

    // Detail panel slide-over appears
    const panel = page.locator('div.fixed.inset-0').last()
    await expect(panel).toBeVisible({ timeout: 8_000 })

    // Notes section should be visible (HR staff can add notes)
    await expect(
      panel.getByText(/hr notes/i)
    ).toBeVisible({ timeout: 8_000 })

    // Close the panel
    const closeBtn = page.getByRole('button', { name: /^close$/i }).first()
    if (await closeBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await closeBtn.click()
    }
  })
})
