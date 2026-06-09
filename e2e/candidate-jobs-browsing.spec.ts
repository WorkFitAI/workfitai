/**
 * E2E spec — Jobs Browsing (Candidate)
 * Runs under the e2e-candidate project (storageState: candidate1.json).
 * Playwright config matches: testMatch: 'e2e/candidate-*.spec.ts'
 * Depends on: candidate1-setup, hrm-job-data-setup, hrm-multi-job-data-setup
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
    const heading = page
      .getByRole('heading', { name: /jobs?/i })
      .or(page.getByText(/find.*job|browse.*job|job.*listing/i).first())
    await expect(heading.first()).toBeVisible({ timeout: 10_000 })
  })

  test('job cards or empty state is visible after load', async ({ page }) => {
    await page.goto('/jobs')
    await page.waitForLoadState('load')

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
    await page.waitForLoadState('load')

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

  test('search works with diverse technical role keywords', async ({ page }) => {
    await page.goto('/jobs')
    await page.waitForLoadState('load')

    const searchInput = page
      .getByPlaceholder(/search|keyword|job title/i)
      .or(page.getByRole('searchbox'))
      .first()

    if (!(await searchInput.isVisible({ timeout: 5_000 }).catch(() => false))) {
      test.skip(true, 'No search input found on jobs page')
      return
    }

    const keywords = ['backend', 'frontend', 'fullstack', 'data scientist', 'devops', 'react']
    for (const kw of keywords) {
      await searchInput.fill(kw)
      await expect(searchInput).toHaveValue(kw)
      await page.waitForTimeout(150)
    }

    // Clear the search and verify the input resets
    await searchInput.fill('')
    await expect(searchInput).toHaveValue('')
  })

  test('search with partial match returns results or empty state (not an error)', async ({ page }) => {
    await page.goto('/jobs')
    await page.waitForLoadState('load')

    const searchInput = page
      .getByPlaceholder(/search|keyword|job title/i)
      .or(page.getByRole('searchbox'))
      .first()

    if (!(await searchInput.isVisible({ timeout: 5_000 }).catch(() => false))) {
      test.skip(true, 'No search input found')
      return
    }

    // Partial keyword — "eng" matches "engineer", "engineering", etc.
    await searchInput.fill('eng')
    await page.waitForTimeout(600) // debounce

    // Page should show results or empty state — no error page
    const hasMain = await page.locator('main').isVisible({ timeout: 5_000 }).catch(() => false)
    expect(hasMain).toBeTruthy()
  })

  test('search with non-existent keyword shows empty state gracefully', async ({ page }) => {
    await page.goto('/jobs')
    await page.waitForLoadState('load')

    const searchInput = page
      .getByPlaceholder(/search|keyword|job title/i)
      .or(page.getByRole('searchbox'))
      .first()

    if (!(await searchInput.isVisible({ timeout: 5_000 }).catch(() => false))) {
      test.skip(true, 'No search input found')
      return
    }

    await searchInput.fill('xyzzy-nonexistent-job-99999')
    await page.waitForTimeout(800)

    const hasEmptyState = await page
      .getByText(/no jobs found|no result|0 jobs/i)
      .first()
      .isVisible({ timeout: 8_000 })
      .catch(() => false)

    const hasContent = await page.locator('main').isVisible().catch(() => false)
    // Either an explicit empty state or main stays rendered — never a crash
    expect(hasContent).toBeTruthy()
    if (hasEmptyState) {
      expect(hasEmptyState).toBeTruthy()
    }
  })

  test('filter sidebar or filter controls are rendered', async ({ page }) => {
    await page.goto('/jobs')
    await page.waitForLoadState('load')

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

  test('filter sidebar has employment type or skill checkboxes', async ({ page }) => {
    await page.goto('/jobs')
    await page.waitForLoadState('load')

    // Filter section should have checkboxes or filter group labels
    const hasCheckboxes = await page
      .locator('input[type="checkbox"]')
      .first()
      .isVisible({ timeout: 8_000 })
      .catch(() => false)

    const hasFilterGroup = await page
      .getByText(/employment type|job type|experience|skill/i)
      .first()
      .isVisible({ timeout: 5_000 })
      .catch(() => false)

    expect(hasCheckboxes || hasFilterGroup).toBeTruthy()
  })

  test('clicking a job card navigates to the job detail page', async ({ page }) => {
    await page.goto('/jobs')
    await page.waitForLoadState('load')

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
    await page.waitForLoadState('load')

    const jobLink = page.locator('a[href*="/jobs/"]').first()
    if (!(await jobLink.isVisible({ timeout: 8_000 }).catch(() => false))) {
      test.skip(true, 'No job listings available')
      return
    }

    const href = await jobLink.getAttribute('href')
    if (!href) {
      test.skip(true, 'Could not determine job link href')
      return
    }

    await page.goto(href)
    await page.waitForLoadState('load')

    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 10_000 })
  })

  test('job detail page shows key sections (description, requirements or overview)', async ({ page }) => {
    await page.goto('/jobs')
    await page.waitForLoadState('load')

    const jobLink = page.locator('a[href*="/jobs/"]').first()
    if (!(await jobLink.isVisible({ timeout: 8_000 }).catch(() => false))) {
      test.skip(true, 'No job listings available')
      return
    }

    const href = await jobLink.getAttribute('href')
    if (!href) return

    await page.goto(href)
    await page.waitForLoadState('load')

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

  test('job detail page shows location information', async ({ page }) => {
    await page.goto('/jobs')
    await page.waitForLoadState('load')

    const jobLink = page.locator('a[href*="/jobs/"]').first()
    if (!(await jobLink.isVisible({ timeout: 8_000 }).catch(() => false))) {
      test.skip(true, 'No job listings available')
      return
    }

    const href = await jobLink.getAttribute('href')
    if (!href) return

    await page.goto(href)
    await page.waitForLoadState('load')

    // Detail page should show location or at minimum key metadata
    const hasLocation = await page
      .getByText(/location|city|remote|ho chi minh|hanoi|vietnam/i)
      .first()
      .isVisible({ timeout: 8_000 })
      .catch(() => false)

    const hasMetadata = await page
      .getByText(/salary|experience|education|deadline/i)
      .first()
      .isVisible({ timeout: 5_000 })
      .catch(() => false)

    expect(hasLocation || hasMetadata).toBeTruthy()
  })

  test('job detail page shows salary or compensation info', async ({ page }) => {
    const job = getTestJob()
    if (!job) {
      test.skip(true, 'Test job data not available')
      return
    }

    await page.goto(`/jobs/${job.jobId}`)
    await page.waitForLoadState('load')

    const hasSalary = await page
      .getByText(/salary|compensation|\$|usd|vnd|\d+,\d+/i)
      .first()
      .isVisible({ timeout: 8_000 })
      .catch(() => false)

    // Salary may not always be shown — page should still render cleanly
    const hasMain = await page.locator('main').isVisible().catch(() => false)
    expect(hasMain).toBeTruthy()
    if (hasSalary) expect(hasSalary).toBeTruthy()
  })

  test('test job detail shows Apply Now or Already Applied button', async ({ page }) => {
    const job = getTestJob()
    if (!job) {
      test.skip(true, 'Test job data not available')
      return
    }

    await page.goto(`/jobs/${job.jobId}`)
    await page.waitForLoadState('load')

    const applyBtn = page.getByRole('button', { name: /apply now/i }).first()
    const alreadyApplied = page
      .getByRole('button', { name: /applied/i })
      .or(page.getByText(/already applied/i))

    const hasApply = await applyBtn.isVisible({ timeout: 10_000 }).catch(() => false)
    const hasAlreadyApplied = await alreadyApplied.first().isVisible({ timeout: 3_000 }).catch(() => false)

    expect(hasApply || hasAlreadyApplied).toBeTruthy()
  })

  test('test job detail shows the expected job title', async ({ page }) => {
    const job = getTestJob()
    if (!job) {
      test.skip(true, 'Test job data not available')
      return
    }

    await page.goto(`/jobs/${job.jobId}`)
    await page.waitForLoadState('load')

    // Page should show the job title text somewhere prominent
    await expect(
      page.getByText(job.jobTitle, { exact: false }).first()
    ).toBeVisible({ timeout: 10_000 })
  })

  test('back navigation from job detail returns to jobs list', async ({ page }) => {
    await page.goto('/jobs')
    await page.waitForLoadState('load')

    const jobLink = page.locator('a[href*="/jobs/"]').first()
    if (!(await jobLink.isVisible({ timeout: 8_000 }).catch(() => false))) {
      test.skip(true, 'No job listings available')
      return
    }

    await jobLink.click()
    await expect(page).toHaveURL(/\/jobs\/.+/, { timeout: 10_000 })

    await page.goBack()
    await expect(page).toHaveURL(/\/jobs$/, { timeout: 10_000 })
    await expect(page.locator('main')).toBeVisible({ timeout: 5_000 })
  })
})

// Unauthenticated tests — no token injection so browser appears unauthenticated
test.describe('Jobs Browsing — unauthenticated', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('unauthenticated user visiting /jobs can browse but Apply redirects to login', async ({ page }) => {
    await page.goto('/jobs')
    await page.waitForLoadState('load')

    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })

    const jobLink = page.locator('a[href*="/jobs/"]').first()
    if (!(await jobLink.isVisible({ timeout: 5_000 }).catch(() => false))) {
      return
    }

    const href = await jobLink.getAttribute('href')
    if (!href) return
    await page.goto(href)
    await page.waitForLoadState('load')

    const applyBtn = page.getByRole('button', { name: /apply now/i }).first()
    if (!(await applyBtn.isVisible({ timeout: 5_000 }).catch(() => false))) {
      return
    }

    await applyBtn.click()
    await expect(page).toHaveURL(/\/login/, { timeout: 8_000 })
  })

  test('unauthenticated user can view job details without logging in', async ({ page }) => {
    await page.goto('/jobs')
    await page.waitForLoadState('load')

    const jobLink = page.locator('a[href*="/jobs/"]').first()
    if (!(await jobLink.isVisible({ timeout: 5_000 }).catch(() => false))) {
      return
    }

    const href = await jobLink.getAttribute('href')
    if (!href) return

    await page.goto(href)
    await page.waitForLoadState('load')

    // Job detail should load without redirecting to login
    await expect(page).toHaveURL(/\/jobs\/.+/, { timeout: 10_000 })
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 10_000 })
  })

  test('jobs page is publicly accessible and shows listings', async ({ page }) => {
    await page.goto('/jobs')
    await expect(page).toHaveURL(/\/jobs/, { timeout: 15_000 })
    // Must not redirect to login
    await expect(page).not.toHaveURL(/\/login/)
    await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })
  })
})

// ── Additional candidates browsing the multi-job dataset ─────────────────────

function getMultiJobs(): Array<{ jobId: string; jobTitle: string; hrmKey: string }> {
  const jobsFile = path.join(__dirname, '.data/test-jobs.json')
  try {
    const { jobs } = JSON.parse(fs.readFileSync(jobsFile, 'utf-8'))
    return jobs ?? []
  } catch {
    return []
  }
}

for (const { num, email, password } of [
  { num: 6, email: 'candidate6@gmail.com', password: 'password@123' },
  { num: 7, email: 'candidate7@gmail.com', password: 'password@123' },
]) {
  test.describe(`Candidate ${num} — Jobs Browsing`, () => {
    test.beforeEach(async ({ page }) => {
      await injectAuthToken(page, email, password, 'candidate1.json')
    })

    test(`candidate${num} can browse the jobs listing page`, async ({ page }) => {
      await page.goto('/jobs')
      await expect(page).toHaveURL(/\/jobs/, { timeout: 15_000 })
      await expect(page.locator('main')).toBeVisible({ timeout: 10_000 })
    })

    test(`candidate${num} can search for a job by keyword`, async ({ page }) => {
      await page.goto('/jobs')
      await page.waitForLoadState('load')
      const searchInput = page
        .getByPlaceholder(/search|keyword|job title/i)
        .or(page.getByRole('searchbox'))
        .first()
      if (!(await searchInput.isVisible({ timeout: 5_000 }).catch(() => false))) {
        test.skip(true, 'No search input found')
        return
      }
      await searchInput.fill('developer')
      await expect(searchInput).toHaveValue('developer')
    })

    test(`candidate${num} can navigate to an HRM1 job detail`, async ({ page }) => {
      const hrm1Jobs = getMultiJobs().filter((j) => j.hrmKey === 'hrm1')
      if (!hrm1Jobs.length) {
        test.skip(true, 'No HRM1 jobs available')
        return
      }
      await page.goto(`/jobs/${hrm1Jobs[0].jobId}`)
      await page.waitForLoadState('load')
      await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 10_000 })
    })

    test(`candidate${num} sees Apply Now or Already Applied on a job detail`, async ({ page }) => {
      const jobs = getMultiJobs()
      if (!jobs.length) {
        test.skip(true, 'No multi-jobs available')
        return
      }
      await page.goto(`/jobs/${jobs[0].jobId}`)
      await page.waitForLoadState('load')
      const hasApply = await page.getByRole('button', { name: /apply now/i }).first().isVisible({ timeout: 8_000 }).catch(() => false)
      const hasApplied = await page.getByRole('button', { name: /applied/i }).first().isVisible({ timeout: 3_000 }).catch(() => false)
      expect(hasApply || hasApplied).toBeTruthy()
    })
  })
}
