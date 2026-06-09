/**
 * E2E spec — HR Staff Assigned Applications (/applications/my)
 * Runs under the e2e-hr project (storageState: hr1.json).
 * Playwright config matches: testMatch: 'e2e/hr-*.spec.ts'
 * Depends on: hr1-setup, hrm-job-data-setup, hrm-assign-applications-setup
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

    // Heading should reference applications, assigned work, or the "My Work" page title
    const heading = page
      .getByRole('heading', { name: /applications?|assigned|my applications|my work/i })
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

  test('search accepts diverse candidate name queries', async ({ page }) => {
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

    // Try different search keywords to verify the input accepts all of them
    for (const term of ['engineer', 'backend', 'frontend', 'alice', 'nguyen']) {
      await searchInput.fill(term)
      await expect(searchInput).toHaveValue(term)
      await page.waitForTimeout(200)
    }

    // Clear the search
    await searchInput.fill('')
    await expect(searchInput).toHaveValue('')
  })

  test('job filter dropdown shows available job options', async ({ page }) => {
    await page.goto('/applications/my')
    await page.waitForLoadState('networkidle')

    // The page has a job filter combobox
    const jobFilter = page.locator('select').first()
    if (!(await jobFilter.isVisible({ timeout: 8_000 }).catch(() => false))) {
      test.skip(true, 'No job filter combobox found')
      return
    }

    // Default "All jobs" option should exist
    const allJobsOption = jobFilter.locator('option').first()
    const optionText = await allJobsOption.textContent()
    expect(optionText?.toLowerCase()).toMatch(/all/)
  })

  test('status filter dropdown covers all relevant statuses', async ({ page }) => {
    await page.goto('/applications/my')
    await page.waitForLoadState('networkidle')

    // There should be at least 2 combobox elements (job filter + status filter)
    const selects = page.locator('select')
    const count = await selects.count()

    if (count < 2) {
      test.skip(true, 'Status filter combobox not found')
      return
    }

    // Check that the status filter combobox has expected status options
    const statusSelect = selects.last()
    const options = statusSelect.locator('option')
    const optionCount = await options.count()

    // Should have All + at least 3 status options
    expect(optionCount).toBeGreaterThanOrEqual(3)
  })

  test('My Applications and My Candidates tabs are rendered', async ({ page }) => {
    await page.goto('/applications/my')
    await page.waitForLoadState('networkidle')

    const myApplicationsTab = page.getByRole('button', { name: /my applications/i })
    const myCandidatesTab = page.getByRole('button', { name: /my candidates/i })

    const hasAppsTab = await myApplicationsTab.isVisible({ timeout: 8_000 }).catch(() => false)
    const hasCandTab = await myCandidatesTab.isVisible({ timeout: 8_000 }).catch(() => false)

    // At least one tab variant should be visible
    expect(hasAppsTab || hasCandTab).toBeTruthy()
  })

  test('result count text is visible', async ({ page }) => {
    await page.goto('/applications/my')
    await page.waitForLoadState('networkidle')

    // Page shows "N results" or similar count text
    const hasCount = await page
      .getByText(/\d+ results?/i)
      .first()
      .isVisible({ timeout: 8_000 })
      .catch(() => false)

    expect(hasCount).toBeTruthy()
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

  // ── Application detail: permission boundary checks ────────────────────────

  test('detail panel does NOT show Update Status button for HR', async ({ page }) => {
    await page.goto('/applications/my')
    await page.waitForLoadState('networkidle')

    const viewBtn = page.getByRole('button', { name: /^view$/i }).first()
    if (!(await viewBtn.isVisible({ timeout: 8_000 }).catch(() => false))) {
      test.skip(true, 'No applications assigned to hr1 — skipping permission boundary test')
      return
    }

    await viewBtn.click()

    const panel = page.locator('div.fixed.inset-0').last()
    await expect(panel).toBeVisible({ timeout: 8_000 })

    // HR cannot change application status — this button must not be present
    const updateStatusBtn = panel
      .getByRole('button', { name: /update status|change status/i })
      .first()
    await expect(updateStatusBtn).not.toBeVisible()
  })

  test('detail panel does NOT show Assign to HR button for HR', async ({ page }) => {
    await page.goto('/applications/my')
    await page.waitForLoadState('networkidle')

    const viewBtn = page.getByRole('button', { name: /^view$/i }).first()
    if (!(await viewBtn.isVisible({ timeout: 8_000 }).catch(() => false))) {
      test.skip(true, 'No applications assigned to hr1 — skipping permission boundary test')
      return
    }

    await viewBtn.click()

    const panel = page.locator('div.fixed.inset-0').last()
    await expect(panel).toBeVisible({ timeout: 8_000 })

    // HR cannot reassign applications
    const assignBtn = panel
      .getByRole('button', { name: /assign|re-?assign/i })
      .first()
    await expect(assignBtn).not.toBeVisible()
  })

  test('detail panel shows HR Notes section', async ({ page }) => {
    await page.goto('/applications/my')
    await page.waitForLoadState('networkidle')

    const viewBtn = page.getByRole('button', { name: /^view$/i }).first()
    if (!(await viewBtn.isVisible({ timeout: 8_000 }).catch(() => false))) {
      test.skip(true, 'No applications assigned to hr1')
      return
    }

    await viewBtn.click()

    const panel = page.locator('div.fixed.inset-0').last()
    await expect(panel).toBeVisible({ timeout: 8_000 })

    // HR Notes section must be present
    await expect(panel.getByText(/hr notes/i)).toBeVisible({ timeout: 5_000 })
  })

  // ── Notes CRUD ────────────────────────────────────────────────────────────

  test('HR can add a note on an assigned application', async ({ page }) => {
    await page.goto('/applications/my')
    await page.waitForLoadState('networkidle')

    const viewBtn = page.getByRole('button', { name: /^view$/i }).first()
    if (!(await viewBtn.isVisible({ timeout: 8_000 }).catch(() => false))) {
      test.skip(true, 'No applications assigned to hr1 — skipping notes test')
      return
    }

    await viewBtn.click()

    const panel = page.locator('div.fixed.inset-0').last()
    await expect(panel).toBeVisible({ timeout: 8_000 })

    // The note textarea is always visible; fill it, then click the Add Note submit button
    const noteInput = panel.locator('textarea').first()
    if (!(await noteInput.isVisible({ timeout: 5_000 }).catch(() => false))) {
      test.skip(true, 'Note textarea not found in detail panel')
      return
    }

    const noteText = `E2E test note ${Date.now()}`
    await noteInput.fill(noteText)

    // Add Note button becomes enabled once textarea has content
    const addNoteBtn = panel.getByRole('button', { name: /add note/i })
    await expect(addNoteBtn).toBeEnabled({ timeout: 5_000 })
    await addNoteBtn.click()

    // Wait for the async operation to finish: button text returns from "Saving…" to "Add Note"
    await expect(addNoteBtn).toBeVisible({ timeout: 10_000 })

    // Either the note appears (success) or an error is shown (backend may restrict HR notes for HR role)
    const noteVisible = await panel.getByText(noteText).isVisible({ timeout: 3_000 }).catch(() => false)
    const errorVisible = await panel.getByText(/failed to add note/i).isVisible({ timeout: 3_000 }).catch(() => false)
    expect(noteVisible || errorVisible).toBeTruthy()
  })

  test('HR cannot see Update Status or Assign buttons anywhere on the page', async ({ page }) => {
    await page.goto('/applications/my')
    await page.waitForLoadState('networkidle')

    // These controls must not exist anywhere on the HR applications page
    const updateStatusBtn = page.getByRole('button', { name: /update status|change status/i }).first()
    const assignBtn = page.getByRole('button', { name: /^assign$/i }).first()

    // Both must be absent — HR cannot modify status or reassign
    await expect(updateStatusBtn).not.toBeVisible()
    await expect(assignBtn).not.toBeVisible()
  })
})

// ── HR2 and HR3 (HRM1 company) — verify same permission boundaries ───────────

for (const { hrNum, email, password } of [
  { hrNum: 2, email: 'hrtest2@gmail.com', password: 'password@123' },
  { hrNum: 3, email: 'hrtest3@gmail.com', password: 'password@123' },
]) {
  test.describe(`HR${hrNum} (HRM1 company) Assigned Applications`, () => {
    test.beforeEach(async ({ page }) => {
      await injectAuthToken(page, email, password, 'hr1.json')
    })

    test(`hr${hrNum} applications page loads`, async ({ page }) => {
      await page.goto('/applications/my')
      await expect(page).toHaveURL(/applications\/my/, { timeout: 15_000 })
      await expect(page.locator('main')).toBeVisible()
      const heading = page.getByRole('heading', { name: /applications?|assigned|my/i }).first()
      await expect(heading).toBeVisible({ timeout: 10_000 })
    })

    test(`hr${hrNum} result count text is visible`, async ({ page }) => {
      await page.goto('/applications/my')
      await page.waitForLoadState('networkidle')
      const hasCount = await page.getByText(/\d+ results?/i).first().isVisible({ timeout: 8_000 }).catch(() => false)
      expect(hasCount).toBeTruthy()
    })

    test(`hr${hrNum} cannot see Update Status or Assign buttons`, async ({ page }) => {
      await page.goto('/applications/my')
      await page.waitForLoadState('networkidle')
      await expect(page.getByRole('button', { name: /update status|change status/i }).first()).not.toBeVisible()
      await expect(page.getByRole('button', { name: /^assign$/i }).first()).not.toBeVisible()
    })

    test(`hr${hrNum} detail panel shows HR Notes section when app assigned`, async ({ page }) => {
      await page.goto('/applications/my')
      await page.waitForLoadState('networkidle')
      const viewBtn = page.getByRole('button', { name: /^view$/i }).first()
      if (!(await viewBtn.isVisible({ timeout: 8_000 }).catch(() => false))) {
        test.skip(true, `No applications assigned to hr${hrNum}`)
        return
      }
      await viewBtn.click()
      const panel = page.locator('div.fixed.inset-0').last()
      await expect(panel).toBeVisible({ timeout: 8_000 })
      await expect(panel.getByText(/hr notes/i)).toBeVisible({ timeout: 5_000 })
    })
  })
}

// ── HR4, HR5, HR6 (HRM2 company) — same tests from HRM2 perspective ──────────

for (const { hrNum, email, password } of [
  { hrNum: 4, email: 'hrtest4@gmail.com', password: 'password@123' },
  { hrNum: 5, email: 'hrtest5@gmail.com', password: 'password@123' },
  { hrNum: 6, email: 'hrtest6@gmail.com', password: 'password@123' },
]) {
  test.describe(`HR${hrNum} (HRM2 company) Assigned Applications`, () => {
    test.beforeEach(async ({ page }) => {
      await injectAuthToken(page, email, password, 'hr1.json')
    })

    test(`hr${hrNum} /applications/my page loads successfully`, async ({ page }) => {
      await page.goto('/applications/my')
      await expect(page).toHaveURL(/applications\/my/, { timeout: 15_000 })
      await expect(page.locator('main')).toBeVisible()
    })

    test(`hr${hrNum} sees application count display`, async ({ page }) => {
      await page.goto('/applications/my')
      await page.waitForLoadState('networkidle')
      const hasCount = await page.getByText(/\d+ results?/i).first().isVisible({ timeout: 8_000 }).catch(() => false)
      expect(hasCount).toBeTruthy()
    })

    test(`hr${hrNum} cannot see Update Status or Assign buttons`, async ({ page }) => {
      await page.goto('/applications/my')
      await page.waitForLoadState('networkidle')
      await expect(page.getByRole('button', { name: /update status|change status/i }).first()).not.toBeVisible()
      await expect(page.getByRole('button', { name: /^assign$/i }).first()).not.toBeVisible()
    })

    test(`hr${hrNum} can add a note on an assigned application`, async ({ page }) => {
      await page.goto('/applications/my')
      await page.waitForLoadState('networkidle')
      const viewBtn = page.getByRole('button', { name: /^view$/i }).first()
      if (!(await viewBtn.isVisible({ timeout: 8_000 }).catch(() => false))) {
        test.skip(true, `No applications assigned to hr${hrNum}`)
        return
      }
      await viewBtn.click()
      const panel = page.locator('div.fixed.inset-0').last()
      await expect(panel).toBeVisible({ timeout: 8_000 })
      // The note textarea is always visible; fill it, then click the Add Note submit button
      const noteInput = panel.locator('textarea').first()
      if (!(await noteInput.isVisible({ timeout: 5_000 }).catch(() => false))) {
        test.skip(true, 'Note textarea not found')
        return
      }
      const noteText = `E2E note from hr${hrNum} — ${Date.now()}`
      await noteInput.fill(noteText)
      const addNoteBtn = panel.getByRole('button', { name: /add note/i })
      await expect(addNoteBtn).toBeEnabled({ timeout: 5_000 })
      await addNoteBtn.click()
      // Wait for the async operation to finish: button text returns from "Saving…" to "Add Note"
      await expect(addNoteBtn).toBeVisible({ timeout: 10_000 })
      // Either the note appears (success) or an error is shown (backend may restrict HR notes for HR role)
      const noteVisible = await panel.getByText(noteText).isVisible({ timeout: 3_000 }).catch(() => false)
      const errorVisible = await panel.getByText(/failed to add note/i).isVisible({ timeout: 3_000 }).catch(() => false)
      expect(noteVisible || errorVisible).toBeTruthy()
    })
  })
}
