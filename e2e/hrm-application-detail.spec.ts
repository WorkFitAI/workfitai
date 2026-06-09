/**
 * E2E spec — HRM Application Detail Panel
 * Runs under the e2e-hrm project (storageState: hrmanager1.json).
 * Playwright config matches: testMatch: 'e2e/hrm-*.spec.ts'
 * Depends on: hrm-job-data-setup, candidate1-apply-data-setup, multi-candidate-apply-data-setup
 */
import { test, expect } from '@playwright/test'
import { injectAuthToken } from './helpers/inject-auth-token'

/** Opens /applications, waits for a View button, clicks it, and returns the open dialog.
 *  Returns null if no applications exist (caller should skip). */
async function openFirstDetailPanel(page: import('@playwright/test').Page) {
  await page.goto('/applications')
  await page.waitForLoadState('load')

  const viewBtn = page.getByRole('button', { name: /^view$/i }).first()
  if (!(await viewBtn.isVisible({ timeout: 8_000 }).catch(() => false))) {
    return null
  }

  await viewBtn.click()

  // The detail panel is a fixed slide-over (not a dialog role), look for the close/Update Status button
  const panel = page.locator('div.fixed.inset-0').last()
  await expect(panel).toBeVisible({ timeout: 8_000 })
  return panel
}

test.describe('HRM Application Detail Panel', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page, 'hrmanager1@gmail.com', 'password@123', 'hrmanager1.json')
  })

  test('View button opens detail panel with candidate info', async ({ page }) => {
    const panel = await openFirstDetailPanel(page)
    if (!panel) {
      test.skip(true, 'No applications available — skipping detail panel test')
      return
    }

    // Header shows username + email of the candidate
    await expect(
      panel.locator('h2').first()
    ).toBeVisible({ timeout: 8_000 })

    // Email should also be visible in the header
    await expect(
      panel.getByText(/@/).first()
    ).toBeVisible({ timeout: 5_000 })
  })

  test('detail panel shows Job Details section', async ({ page }) => {
    const panel = await openFirstDetailPanel(page)
    if (!panel) {
      test.skip(true, 'No applications available')
      return
    }

    await expect(
      panel.getByText(/job details/i)
    ).toBeVisible({ timeout: 8_000 })
  })

  test('detail panel shows Application Info section with applied date', async ({ page }) => {
    const panel = await openFirstDetailPanel(page)
    if (!panel) {
      test.skip(true, 'No applications available')
      return
    }

    await expect(
      panel.getByText(/application info/i)
    ).toBeVisible({ timeout: 8_000 })

    // "Applied" date should be visible
    await expect(
      panel.getByText(/applied/i).first()
    ).toBeVisible({ timeout: 5_000 })
  })

  test('detail panel shows Status Timeline section', async ({ page }) => {
    const panel = await openFirstDetailPanel(page)
    if (!panel) {
      test.skip(true, 'No applications available')
      return
    }

    await expect(
      panel.getByText(/status timeline/i)
    ).toBeVisible({ timeout: 8_000 })
  })

  test('detail panel shows HR Notes section with add-note form', async ({ page }) => {
    const panel = await openFirstDetailPanel(page)
    if (!panel) {
      test.skip(true, 'No applications available')
      return
    }

    await expect(
      panel.getByText(/hr notes/i)
    ).toBeVisible({ timeout: 8_000 })

    // The notes panel should have a textarea or add-note button
    const hasTextarea = await panel.locator('textarea').first().isVisible({ timeout: 5_000 }).catch(() => false)
    const hasAddBtn = await panel.getByRole('button', { name: /add note|add/i }).first().isVisible({ timeout: 3_000 }).catch(() => false)

    expect(hasTextarea || hasAddBtn).toBeTruthy()
  })

  test('detail panel shows CV / Resume section', async ({ page }) => {
    const panel = await openFirstDetailPanel(page)
    if (!panel) {
      test.skip(true, 'No applications available')
      return
    }

    // Right pane heading
    await expect(
      panel.getByText(/cv.*resume|resume.*cv/i).first()
    ).toBeVisible({ timeout: 8_000 })
  })

  test('Update Status button opens the status update modal', async ({ page }) => {
    const panel = await openFirstDetailPanel(page)
    if (!panel) {
      test.skip(true, 'No applications available')
      return
    }

    const updateStatusBtn = page.getByRole('button', { name: /update status/i })
    await expect(updateStatusBtn).toBeVisible({ timeout: 8_000 })
    await updateStatusBtn.click()

    // Status update modal should appear (dialog role)
    const statusModal = page.getByRole('dialog')
    await expect(statusModal).toBeVisible({ timeout: 5_000 })

    // Close without saving
    const cancelBtn = statusModal.getByRole('button', { name: /cancel|close/i }).first()
    if (await cancelBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await cancelBtn.click()
    } else {
      await page.keyboard.press('Escape')
    }
  })

  test('Close button dismisses the detail panel', async ({ page }) => {
    const panel = await openFirstDetailPanel(page)
    if (!panel) {
      test.skip(true, 'No applications available')
      return
    }

    const closeBtn = page.getByRole('button', { name: /^close$/i }).first()
    await expect(closeBtn).toBeVisible({ timeout: 5_000 })
    await closeBtn.click()

    // Panel should disappear
    await expect(panel).not.toBeVisible({ timeout: 5_000 })
  })
})

// ── HRM2 application detail panel — same assertions from HRM2's perspective ──

/** Opens /applications as HRM2, clicks View on the first row, returns the panel or null. */
async function openFirstDetailPanelAsHrm2(page: import('@playwright/test').Page) {
  await page.goto('/applications')
  await page.waitForLoadState('load')
  const viewBtn = page.getByRole('button', { name: /^view$/i }).first()
  if (!(await viewBtn.isVisible({ timeout: 8_000 }).catch(() => false))) return null
  await viewBtn.click()
  const panel = page.locator('div.fixed.inset-0').last()
  await expect(panel).toBeVisible({ timeout: 8_000 })
  return panel
}

test.describe('HRM2 Application Detail Panel', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page, 'hrmanager2@gmail.com', 'password@123', 'hrmanager1.json')
  })

  test('hrm2 View button opens detail panel with candidate info', async ({ page }) => {
    const panel = await openFirstDetailPanelAsHrm2(page)
    if (!panel) {
      test.skip(true, 'No HRM2 applications — skipping')
      return
    }
    await expect(panel.locator('h2').first()).toBeVisible({ timeout: 8_000 })
    await expect(panel.getByText(/@/).first()).toBeVisible({ timeout: 5_000 })
  })

  test('hrm2 detail panel shows Job Details section', async ({ page }) => {
    const panel = await openFirstDetailPanelAsHrm2(page)
    if (!panel) {
      test.skip(true, 'No HRM2 applications')
      return
    }
    await expect(panel.getByText(/job details/i)).toBeVisible({ timeout: 8_000 })
  })

  test('hrm2 detail panel shows HR Notes section', async ({ page }) => {
    const panel = await openFirstDetailPanelAsHrm2(page)
    if (!panel) {
      test.skip(true, 'No HRM2 applications')
      return
    }
    await expect(panel.getByText(/hr notes/i)).toBeVisible({ timeout: 8_000 })
  })

  test('hrm2 Update Status button opens the status update modal', async ({ page }) => {
    const panel = await openFirstDetailPanelAsHrm2(page)
    if (!panel) {
      test.skip(true, 'No HRM2 applications')
      return
    }
    const updateStatusBtn = page.getByRole('button', { name: /update status/i })
    await expect(updateStatusBtn).toBeVisible({ timeout: 8_000 })
    await updateStatusBtn.click()
    const statusModal = page.getByRole('dialog')
    await expect(statusModal).toBeVisible({ timeout: 5_000 })
    const cancelBtn = statusModal.getByRole('button', { name: /cancel|close/i }).first()
    if (await cancelBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await cancelBtn.click()
    } else {
      await page.keyboard.press('Escape')
    }
  })
})
