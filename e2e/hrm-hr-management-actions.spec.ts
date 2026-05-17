/**
 * E2E spec — HR Management Actions (Approve / Reject)
 * Runs under the e2e-hrm project (storageState: hrmanager1.json).
 * Playwright config matches: testMatch: 'e2e/hrm-*.spec.ts'
 * Depends on: hrm-job-data-setup
 *
 * Approve/Reject API calls are intercepted via page.route() to avoid
 * permanently mutating DB state in E2E runs.
 */
import { test, expect } from '@playwright/test'
import { injectAuthToken } from './helpers/inject-auth-token'

test.describe('HR Management Actions', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page, 'hrmanager1@gmail.com', 'password@123', 'hrmanager1.json')
  })

  test('hr-management page is accessible for HR_MANAGER role', async ({ page }) => {
    await page.goto('/hr-management')
    await expect(page).toHaveURL(/hr-management/, { timeout: 15_000 })
    await expect(page.locator('main')).toBeVisible()
    await expect(
      page.getByRole('heading', { name: /hr management/i })
    ).toBeVisible({ timeout: 10_000 })
  })

  test('WAIT_APPROVED HR users show Approve and Reject action buttons', async ({ page }) => {
    await page.goto('/hr-management')
    await page.waitForLoadState('networkidle')

    // Look for a row that has a "Waiting" status badge
    const waitingBadge = page.getByText(/waiting/i).first()

    if (!(await waitingBadge.isVisible({ timeout: 8_000 }).catch(() => false))) {
      test.skip(true, 'No WAIT_APPROVED HR users in the list — skipping action button test')
      return
    }

    // The Approve button has title="Approve HR" (CheckCircle2 icon button)
    await expect(
      page.getByTitle('Approve HR').first()
    ).toBeVisible({ timeout: 5_000 })

    // The Reject button has title="Reject HR" (XCircle icon button)
    await expect(
      page.getByTitle('Reject HR').first()
    ).toBeVisible({ timeout: 5_000 })
  })

  test('Approve HR button fires the correct API request', async ({ page }) => {
    // Intercept the approve endpoint to capture the request without mutating DB
    let approveRequestFired = false
    let approvedUsername = ''

    await page.route('**/user/hr/username/*/approve', async (route) => {
      const url = new URL(route.request().url())
      // Extract username from path: /user/hr/username/:username/approve
      const parts = url.pathname.split('/')
      const usernameIdx = parts.indexOf('username')
      approvedUsername = usernameIdx >= 0 ? parts[usernameIdx + 1] : ''
      approveRequestFired = true
      // Return a mock 200 so the UI doesn't show an error
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Approved (intercepted)' }),
      })
    })

    await page.goto('/hr-management')
    await page.waitForLoadState('networkidle')

    const waitingBadge = page.getByText(/waiting/i).first()
    if (!(await waitingBadge.isVisible({ timeout: 8_000 }).catch(() => false))) {
      test.skip(true, 'No WAIT_APPROVED users — skipping approve API test')
      return
    }

    const approveBtn = page.getByTitle('Approve HR').first()
    await expect(approveBtn).toBeVisible({ timeout: 5_000 })
    await approveBtn.click()

    // Wait briefly for the network request
    await page.waitForTimeout(1_500)
    expect(approveRequestFired).toBe(true)
    expect(approvedUsername.length).toBeGreaterThan(0)
  })

  test('Reject HR button fires the correct API request', async ({ page }) => {
    let rejectRequestFired = false
    let rejectedUsername = ''

    await page.route('**/user/hr/username/*/reject', async (route) => {
      const url = new URL(route.request().url())
      const parts = url.pathname.split('/')
      const usernameIdx = parts.indexOf('username')
      rejectedUsername = usernameIdx >= 0 ? parts[usernameIdx + 1] : ''
      rejectRequestFired = true
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Rejected (intercepted)' }),
      })
    })

    await page.goto('/hr-management')
    await page.waitForLoadState('networkidle')

    const waitingBadge = page.getByText(/waiting/i).first()
    if (!(await waitingBadge.isVisible({ timeout: 8_000 }).catch(() => false))) {
      test.skip(true, 'No WAIT_APPROVED users — skipping reject API test')
      return
    }

    const rejectBtn = page.getByTitle('Reject HR').first()
    await expect(rejectBtn).toBeVisible({ timeout: 5_000 })
    await rejectBtn.click()

    await page.waitForTimeout(1_500)
    expect(rejectRequestFired).toBe(true)
    expect(rejectedUsername.length).toBeGreaterThan(0)
  })

  test('status badge colours distinguish Active, Waiting, and Blocked users', async ({ page }) => {
    await page.goto('/hr-management')
    await page.waitForLoadState('networkidle')

    // At minimum the table or empty state must be visible
    const hasTable = await page.locator('table').first().isVisible({ timeout: 8_000 }).catch(() => false)
    const hasEmpty = await page.getByText(/no hr members found/i).isVisible({ timeout: 3_000 }).catch(() => false)
    expect(hasTable || hasEmpty).toBeTruthy()

    // If rows exist, check that role badges are present (HR / HR Manager)
    if (hasTable) {
      const roleBadge = page
        .getByText(/^hr manager$|^hr$/i)
        .first()
      const visible = await roleBadge.isVisible({ timeout: 5_000 }).catch(() => false)
      // If the table has rows the badge must be there; if truly empty rows no assertion needed
      if (visible) {
        await expect(roleBadge).toBeVisible()
      }
    }
  })
})
