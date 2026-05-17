/**
 * E2E spec — HRM Application Management
 * Runs under the e2e-hrm project (storageState: hrmanager1.json).
 * Playwright config matches: testMatch: 'e2e/hrm-*.spec.ts'
 */
import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import { injectAuthToken } from './helpers/inject-auth-token'

function getTestJob(): { jobId: string; jobTitle: string } | null {
  const jobFile = path.join(__dirname, '.data/test-job.json')
  try {
    return JSON.parse(fs.readFileSync(jobFile, 'utf-8'))
  } catch {
    return null
  }
}

test.describe('HRM Application Management', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page, 'hrmanager1@gmail.com', 'password@123', 'hrmanager1.json')
  })

  test('applications page loads and shows main content', async ({ page }) => {
    await page.goto('/applications')
    await expect(page).toHaveURL(/applications/, { timeout: 15_000 })
    // Heading should be visible
    await expect(
      page.getByRole('heading', { name: /applications/i })
    ).toBeVisible({ timeout: 10_000 })
  })

  test('applications table or empty state is visible after load', async ({ page }) => {
    await page.goto('/applications')
    await page.waitForLoadState('networkidle')

    // Either a table with rows or the "No applications found" empty state
    const hasTable = await page
      .locator('table')
      .first()
      .isVisible({ timeout: 8_000 })
      .catch(() => false)

    const hasEmptyState = await page
      .getByText(/no applications found/i)
      .first()
      .isVisible({ timeout: 3_000 })
      .catch(() => false)

    expect(hasTable || hasEmptyState).toBeTruthy()
  })

  test('search input is present and accepts text', async ({ page }) => {
    await page.goto('/applications')
    await page.waitForLoadState('networkidle')

    const searchInput = page.getByPlaceholder(/search candidate or job/i)
    await expect(searchInput).toBeVisible({ timeout: 8_000 })

    await searchInput.fill('test')
    // After typing, the input value should reflect what was typed
    await expect(searchInput).toHaveValue('test')
  })

  test('status filter dropdown is present and changes selection', async ({ page }) => {
    await page.goto('/applications')
    await page.waitForLoadState('networkidle')

    const statusSelect = page.locator('#hrm-status-filter')
    await expect(statusSelect).toBeVisible({ timeout: 8_000 })

    // Change to REVIEWING status filter
    await statusSelect.selectOption('REVIEWING')
    await expect(statusSelect).toHaveValue('REVIEWING')
  })

  test('View button opens the application detail panel', async ({ page }) => {
    await page.goto('/applications')
    await page.waitForLoadState('networkidle')

    const viewBtn = page.getByRole('button', { name: /^view$/i }).first()
    if (!(await viewBtn.isVisible({ timeout: 5_000 }).catch(() => false))) {
      test.skip(true, 'No applications available — skipping detail panel test')
      return
    }

    await viewBtn.click()

    // ApplicationDetailPanel is a slide-over div (not role="dialog") with a "Job Details" heading
    const panel = page.locator('.fixed.inset-0.z-40').or(
      page.getByRole('heading', { name: /job details/i })
    ).first()

    await expect(panel).toBeVisible({ timeout: 8_000 })
  })
})
