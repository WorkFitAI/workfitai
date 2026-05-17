/**
 * E2E spec — Jobs Browsing (Candidate)
 * Runs under the e2e-candidate project (storageState: candidate1.json).
 * Playwright config matches: testMatch: 'e2e/candidate-*.spec.ts'
 * Depends on: candidate1-setup, hrm-job-data-setup
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

test.describe('Jobs Browsing — Candidate', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page, 'candidate1@gmail.com', 'password@123', 'candidate1.json')
  })

  test('jobs page renders main heading and content area', async ({ page }) => {
    await page.goto('/jobs')
    await expect(page).toHaveURL(/\/jobs/, { timeout: 15_000 })
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })
    // Page should have some identifiable jobs-related heading or title
    const heading = page
      .getByRole('heading', { name: /jobs?/i })
      .or(page.getByText(/find.*job|browse.*job|job.*listing/i).first())
    await expect(heading.first()).toBeVisible({ timeout: 10_000 })
  })

  test('job cards or empty state is visible after load', async ({ page }) => {
    await page.goto('/jobs')
    await page.waitForLoadState('networkidle')

    // Job cards are divs (not anchor tags) — check for job title headings or count text
    const hasCards = await page
      .locator('main h2')
      .first()
      .isVisible({ timeout: 8_000 })
      .catch(() => false)

    const hasJobCount = await page
      .getByText(/showing.*jobs|of \d+ jobs/i)
      .first()
      .isVisible({ timeout: 5_000 })
      .catch(() => false)

    const hasEmptyState = await page
      .getByText(/no jobs found|no result/i)
      .first()
      .isVisible({ timeout: 3_000 })
      .catch(() => false)

    expect(hasCards || hasJobCount || hasEmptyState).toBeTruthy()
  })

  test('search / keyword input accepts text', async ({ page }) => {
    await page.goto('/jobs')
    await page.waitForLoadState('networkidle')

    const searchInput = page
      .getByPlaceholder(/search|keyword|job title/i)
      .or(page.getByRole('searchbox'))
      .first()

    if (!(await searchInput.isVisible({ timeout: 5_000 }).catch(() => false))) {
      test.skip(true, 'No search input found on jobs page')
      return
    }

    await searchInput.fill('engineer')
    await expect(searchInput).toHaveValue('engineer')
  })

  test('filter sidebar or filter controls are rendered', async ({ page }) => {
    await page.goto('/jobs')
    await page.waitForLoadState('networkidle')

    // The jobs page has an "Advance Filter" heading and filter checkboxes in the sidebar
    const hasFilterSection = await page
      .getByRole('heading', { name: /advance filter/i })
      .first()
      .isVisible({ timeout: 8_000 })
      .catch(() => false)

    const hasFilterButton = await page
      .getByRole('button', { name: /reset/i })
      .first()
      .isVisible({ timeout: 3_000 })
      .catch(() => false)

    expect(hasFilterSection || hasFilterButton).toBeTruthy()
  })

  test('clicking a job card navigates to the job detail page', async ({ page }) => {
    await page.goto('/jobs')
    await page.waitForLoadState('networkidle')

    const jobLink = page.locator('a[href*="/jobs/"]').first()
    if (!(await jobLink.isVisible({ timeout: 8_000 }).catch(() => false))) {
      test.skip(true, 'No job listings available — skipping navigation test')
      return
    }

    await jobLink.click()
    await expect(page).toHaveURL(/\/jobs\/.+/, { timeout: 10_000 })
  })

  test('job detail page shows the job title heading', async ({ page }) => {
    await page.goto('/jobs')
    await page.waitForLoadState('networkidle')

    const jobLink = page.locator('a[href*="/jobs/"]').first()
    if (!(await jobLink.isVisible({ timeout: 8_000 }).catch(() => false))) {
      test.skip(true, 'No job listings available')
      return
    }

    // Capture the job URL before clicking
    const href = await jobLink.getAttribute('href')
    if (!href) {
      test.skip(true, 'Could not determine job link href')
      return
    }

    await page.goto(href)
    await page.waitForLoadState('networkidle')

    // Detail page should show a prominent heading (job title)
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 10_000 })
  })

  test('job detail page shows key sections (description, requirements or overview)', async ({ page }) => {
    await page.goto('/jobs')
    await page.waitForLoadState('networkidle')

    const jobLink = page.locator('a[href*="/jobs/"]').first()
    if (!(await jobLink.isVisible({ timeout: 8_000 }).catch(() => false))) {
      test.skip(true, 'No job listings available')
      return
    }

    const href = await jobLink.getAttribute('href')
    if (!href) return

    await page.goto(href)
    await page.waitForLoadState('networkidle')

    // At least one content section should be visible
    const hasDescription = await page
      .getByText(/job description|description|about this role/i)
      .first()
      .isVisible({ timeout: 8_000 })
      .catch(() => false)

    const hasRequirements = await page
      .getByText(/requirements?|qualifications?|responsibilities/i)
      .first()
      .isVisible({ timeout: 3_000 })
      .catch(() => false)

    expect(hasDescription || hasRequirements).toBeTruthy()
  })

  test('test job detail shows Apply Now or Already Applied button', async ({ page }) => {
    const job = getTestJob()
    if (!job) {
      test.skip(true, 'Test job data not available')
      return
    }

    await page.goto(`/jobs/${job.jobId}`)
    await page.waitForLoadState('networkidle')

    const applyBtn = page.getByRole('button', { name: /apply now/i })
    const alreadyApplied = page
      .getByRole('button', { name: /applied/i })
      .or(page.getByText(/already applied/i))

    const hasApply = await applyBtn.isVisible({ timeout: 10_000 }).catch(() => false)
    const hasAlreadyApplied = await alreadyApplied.first().isVisible({ timeout: 3_000 }).catch(() => false)

    expect(hasApply || hasAlreadyApplied).toBeTruthy()
  })

})

// Unauthenticated test is kept outside the main describe so it does NOT inherit the beforeEach
// token injection above (which would make the browser appear authenticated).
test.describe('Jobs Browsing — unauthenticated', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('unauthenticated user visiting /jobs can browse but Apply redirects to login', async ({ page }) => {
    await page.goto('/jobs')
    await page.waitForLoadState('networkidle')

    // Page should still load (public route)
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })

    // Navigate to a job detail if any exist
    const jobLink = page.locator('a[href*="/jobs/"]').first()
    if (!(await jobLink.isVisible({ timeout: 5_000 }).catch(() => false))) {
      return
    }

    const href = await jobLink.getAttribute('href')
    if (!href) return
    await page.goto(href)
    await page.waitForLoadState('networkidle')

    // Clicking Apply Now should redirect unauthenticated user to login
    const applyBtn = page.getByRole('button', { name: /apply now/i })
    if (!(await applyBtn.isVisible({ timeout: 5_000 }).catch(() => false))) {
      return
    }

    await applyBtn.click()
    await expect(page).toHaveURL(/\/login/, { timeout: 8_000 })
  })
})
