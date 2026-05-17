import { test, expect } from '@playwright/test'
import { injectAuthToken } from './helpers/inject-auth-token'

// ── A-1: Unauthenticated redirect ─────────────────────────────────────────
// Kept in its own describe with empty storageState so the token injection
// beforeEach below does NOT run for this test.
test.describe('A-1 unauthenticated', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('A-1: /applied-jobs redirects to /login when not authenticated', async ({ page }) => {
    await page.goto('/applied-jobs')
    await expect(page).toHaveURL(/\/login/, { timeout: 8_000 })
  })
})

// ── Authenticated tests ───────────────────────────────────────────────────
// Wrapped in a describe so test.beforeEach applies only here (not to A-1).
// Uses candidate1 credentials — works for both e2e-chromium and e2e-firefox projects.
test.describe('Authenticated application flow', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page, 'candidate1@gmail.com', 'password@123', 'candidate.json')
  })

test('A-2: authenticated candidate sees My Applications page', async ({ page }) => {
  await page.goto('/applied-jobs')
  await expect(page.getByRole('heading', { name: /my applications/i })).toBeVisible({ timeout: 8_000 })
  await expect(page.getByText(/application.*total/i)).toBeVisible({ timeout: 10_000 })
})

test('A-3: status filter tabs are rendered and clickable', async ({ page }) => {
  await page.goto('/applied-jobs')
  await page.waitForLoadState('networkidle')

  for (const label of ['All', 'Applied', 'Reviewing', 'Interview', 'Offer', 'Hired', 'Rejected']) {
    await expect(page.getByRole('button', { name: label, exact: true })).toBeVisible()
  }

  // Click "Applied" tab — page should remain on /applied-jobs
  await page.getByRole('button', { name: 'Applied', exact: true }).click()
  await expect(page).toHaveURL('/applied-jobs')
  await expect(page.getByText(/application.*total/i)).toBeVisible({ timeout: 8_000 })
})

test('A-4: clicking an application card navigates to detail page', async ({ page }) => {
  await page.goto('/applied-jobs')
  await page.waitForLoadState('networkidle')

  // Find first application card main clickable area
  const card = page.locator('button.flex-1.text-left').first()

  if (!(await card.isVisible({ timeout: 5_000 }).catch(() => false))) {
    test.skip(true, 'No applications found for this account — skipping navigation test')
    return
  }

  await card.click()
  await expect(page).toHaveURL(/\/applied-jobs\/.+/, { timeout: 8_000 })
})

test('A-5: detail page shows job info and Status History section', async ({ page }) => {
  await page.goto('/applied-jobs')
  await page.waitForLoadState('networkidle')

  const card = page.locator('button.flex-1.text-left').first()
  if (!(await card.isVisible({ timeout: 5_000 }).catch(() => false))) {
    test.skip(true, 'No applications found — skipping detail content test')
    return
  }

  await card.click()
  await expect(page).toHaveURL(/\/applied-jobs\/.+/, { timeout: 8_000 })
  await expect(page.getByText(/status history/i)).toBeVisible({ timeout: 10_000 })
  await expect(page.getByRole('link', { name: /back to my applications/i })).toBeVisible()
})

test('A-6: withdraw dialog opens and confirm button is present', async ({ page }) => {
  await page.goto('/applied-jobs')
  await page.waitForLoadState('networkidle')

  // Find a withdrawable application (DRAFT, APPLIED, or REVIEWING)
  const withdrawBtn = page.getByTitle('Withdraw application').first()

  if (!(await withdrawBtn.isVisible({ timeout: 3_000 }).catch(() => false))) {
    test.skip(true, 'No withdrawable applications found — skipping withdraw test')
    return
  }

  await withdrawBtn.click()

  // Confirm dialog should appear
  await expect(page.getByRole('alertdialog')).toBeVisible({ timeout: 5_000 })
  await expect(page.getByRole('button', { name: /yes, withdraw/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible()

  // Cancel to avoid actually withdrawing
  await page.getByRole('button', { name: /cancel/i }).click()
  await expect(page.getByRole('alertdialog')).not.toBeVisible({ timeout: 3_000 })
})

test('A-7: apply flow — find a job and open apply modal', async ({ page }) => {
  await page.goto('/jobs')
  await page.waitForLoadState('networkidle')

  // Click first job listing
  const jobLink = page.locator('a[href*="/jobs/"]').first()
  if (!(await jobLink.isVisible({ timeout: 5_000 }).catch(() => false))) {
    test.skip(true, 'No job listings found — skipping apply flow test')
    return
  }

  await jobLink.click()
  await expect(page).toHaveURL(/\/jobs\/.+/, { timeout: 8_000 })

  // Wait for Apply Now button (not the skeleton)
  const applyBtn = page.getByRole('button', { name: /apply now/i })
  const alreadyApplied = page.getByRole('button', { name: /applied/i })

  await Promise.race([
    applyBtn.waitFor({ state: 'visible', timeout: 10_000 }),
    alreadyApplied.waitFor({ state: 'visible', timeout: 10_000 }),
  ])

  if (await alreadyApplied.isVisible()) {
    test.skip(true, 'Already applied to this job — skipping apply modal test')
    return
  }

  // Open the apply modal
  await applyBtn.click()

  // Apply modal should open — expect email field or file upload
  await expect(
    page.getByRole('dialog').or(page.getByLabel(/email/i)).first()
  ).toBeVisible({ timeout: 5_000 })
})
}) // end describe 'Authenticated application flow'
