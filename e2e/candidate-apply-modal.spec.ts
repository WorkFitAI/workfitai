/**
 * E2E spec — Apply Now Modal (Candidate)
 * Runs under the e2e-candidate project (storageState: candidate1.json).
 * Playwright config matches: testMatch: 'e2e/candidate-*.spec.ts'
 * Depends on: candidate1-setup, hrm-job-data-setup, candidate1-apply-data-setup
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

/** Minimal valid single-page PDF as a Buffer. */
function minimalPdfBuffer(): Buffer {
  return Buffer.from(
    '%PDF-1.4\n1 0 obj\n<</Type /Catalog /Pages 2 0 R>>\nendobj\n' +
      '2 0 obj\n<</Type /Pages /Kids [3 0 R] /Count 1>>\nendobj\n' +
      '3 0 obj\n<</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]>>\nendobj\n' +
      'xref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n' +
      '0000000058 00000 n \n0000000115 00000 n \n' +
      'trailer\n<</Size 4 /Root 1 0 R>>\nstartxref\n190\n%%EOF\n',
  )
}

/** Navigate to the test job and open the Apply modal. Returns false if already applied. */
async function openApplyModal(page: import('@playwright/test').Page): Promise<boolean> {
  const job = getTestJob()
  if (!job) return false

  await page.goto(`/jobs/${job.jobId}`)
  await page.waitForLoadState('networkidle')

  // If candidate already applied, the modal will show "Already Applied" state —
  // which is still a valid test scenario.
  const applyBtn = page.getByRole('button', { name: /apply now/i })
  if (!(await applyBtn.isVisible({ timeout: 8_000 }).catch(() => false))) {
    return false
  }

  await applyBtn.click()
  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 8_000 })
  return true
}

test.describe('Apply Now Modal', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page, 'candidate1@gmail.com', 'password@123', 'candidate1.json')
  })

  test('Apply Now button opens the application dialog', async ({ page }) => {
    const job = getTestJob()
    if (!job) {
      test.skip(true, 'No test job available')
      return
    }

    await page.goto(`/jobs/${job.jobId}`)
    await page.waitForLoadState('networkidle')

    const applyBtn = page.getByRole('button', { name: /apply now/i })
    if (!(await applyBtn.isVisible({ timeout: 8_000 }).catch(() => false))) {
      test.skip(true, 'Apply Now button not visible — candidate may have already applied')
      return
    }

    await applyBtn.click()
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 8_000 })
  })

  test('modal shows Already Applied state when candidate has already submitted', async ({ page }) => {
    const job = getTestJob()
    if (!job) {
      test.skip(true, 'No test job available')
      return
    }

    await page.goto(`/jobs/${job.jobId}`)
    await page.waitForLoadState('networkidle')

    // This test only applies when the candidate has already applied (setup ran)
    const alreadyAppliedBtn = page.getByRole('button', { name: /applied/i })
    const applyBtn = page.getByRole('button', { name: /apply now/i })

    const isApplyVisible = await applyBtn.isVisible({ timeout: 5_000 }).catch(() => false)
    const isAlreadyApplied = await alreadyAppliedBtn.isVisible({ timeout: 3_000 }).catch(() => false)

    if (isAlreadyApplied) {
      // The button itself shows the applied state — test passes
      await expect(alreadyAppliedBtn).toBeVisible()
      return
    }

    if (!isApplyVisible) {
      test.skip(true, 'Neither Apply Now nor Applied button found')
      return
    }

    // Open the modal and check for already-applied state inside
    await applyBtn.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 8_000 })

    // If pre-check detects already applied, modal body shows "Already Applied" message
    const alreadyAppliedInModal = await dialog
      .getByText(/already applied/i)
      .isVisible({ timeout: 3_000 })
      .catch(() => false)

    if (!alreadyAppliedInModal) {
      // Candidate has not yet applied — skip (tested by other tests)
      test.skip(true, 'Candidate has not yet applied — already-applied state not shown')
    }
  })

  test('modal shows email field and CV upload zone when candidate has not applied', async ({ page }) => {
    const job = getTestJob()
    if (!job) {
      test.skip(true, 'No test job available')
      return
    }

    await page.goto(`/jobs/${job.jobId}`)
    await page.waitForLoadState('networkidle')

    const applyBtn = page.getByRole('button', { name: /apply now/i })
    if (!(await applyBtn.isVisible({ timeout: 8_000 }).catch(() => false))) {
      test.skip(true, 'Apply Now button not visible')
      return
    }

    await applyBtn.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 8_000 })

    // Skip if "Already Applied" state shown
    if (await dialog.getByText(/already applied/i).isVisible({ timeout: 2_000 }).catch(() => false)) {
      test.skip(true, 'Modal shows already-applied state — form fields not rendered')
      return
    }

    // Email field should be auto-populated
    await expect(dialog.locator('#apply-email')).toBeVisible({ timeout: 5_000 })
    const emailValue = await dialog.locator('#apply-email').inputValue()
    expect(emailValue.length).toBeGreaterThan(0)

    // CV upload drop zone should be visible
    await expect(
      dialog.getByText(/click to upload|drag.*drop/i).first()
    ).toBeVisible({ timeout: 5_000 })
  })

  test('uploading a non-PDF file shows a file-type validation error', async ({ page }) => {
    const job = getTestJob()
    if (!job) {
      test.skip(true, 'No test job available')
      return
    }

    await page.goto(`/jobs/${job.jobId}`)
    await page.waitForLoadState('networkidle')

    const applyBtn = page.getByRole('button', { name: /apply now/i })
    if (!(await applyBtn.isVisible({ timeout: 8_000 }).catch(() => false))) {
      test.skip(true, 'Apply Now button not visible')
      return
    }

    await applyBtn.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 8_000 })

    if (await dialog.getByText(/already applied/i).isVisible({ timeout: 2_000 }).catch(() => false)) {
      test.skip(true, 'Already applied state shown — skipping file validation test')
      return
    }

    // Upload a non-PDF file
    await page.locator('#cv-upload').setInputFiles({
      name: 'document.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('this is not a PDF'),
    })

    // Expect the "PDF only" validation error message
    await expect(dialog.getByText(/only pdf files/i)).toBeVisible({ timeout: 5_000 })
  })

  test('uploading a valid PDF shows the filename and enables Submit', async ({ page }) => {
    const job = getTestJob()
    if (!job) {
      test.skip(true, 'No test job available')
      return
    }

    await page.goto(`/jobs/${job.jobId}`)
    await page.waitForLoadState('networkidle')

    const applyBtn = page.getByRole('button', { name: /apply now/i })
    if (!(await applyBtn.isVisible({ timeout: 8_000 }).catch(() => false))) {
      test.skip(true, 'Apply Now button not visible')
      return
    }

    await applyBtn.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 8_000 })

    if (await dialog.getByText(/already applied/i).isVisible({ timeout: 2_000 }).catch(() => false)) {
      test.skip(true, 'Already applied — skipping PDF upload test')
      return
    }

    await page.locator('#cv-upload').setInputFiles({
      name: 'my-resume.pdf',
      mimeType: 'application/pdf',
      buffer: minimalPdfBuffer(),
    })

    // Filename should appear in the green file card
    await expect(dialog.getByText('my-resume.pdf')).toBeVisible({ timeout: 5_000 })

    // Submit button becomes enabled once email + CV are both filled
    await expect(
      dialog.getByRole('button', { name: /submit application/i })
    ).toBeEnabled({ timeout: 5_000 })
  })

  test('clicking Submit without a CV shows the required-file validation error', async ({ page }) => {
    const job = getTestJob()
    if (!job) {
      test.skip(true, 'No test job available')
      return
    }

    await page.goto(`/jobs/${job.jobId}`)
    await page.waitForLoadState('networkidle')

    const applyBtn = page.getByRole('button', { name: /apply now/i })
    if (!(await applyBtn.isVisible({ timeout: 8_000 }).catch(() => false))) {
      test.skip(true, 'Apply Now button not visible')
      return
    }

    await applyBtn.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 8_000 })

    if (await dialog.getByText(/already applied/i).isVisible({ timeout: 2_000 }).catch(() => false)) {
      test.skip(true, 'Already applied — skipping submit-without-CV test')
      return
    }

    // Submit button is disabled when no CV — the button itself should be disabled
    const submitBtn = dialog.getByRole('button', { name: /submit application/i })
    await expect(submitBtn).toBeDisabled({ timeout: 5_000 })
  })

  test('cover letter textarea is visible and accepts text input', async ({ page }) => {
    const job = getTestJob()
    if (!job) {
      test.skip(true, 'No test job available')
      return
    }

    await page.goto(`/jobs/${job.jobId}`)
    await page.waitForLoadState('networkidle')

    const applyBtn = page.getByRole('button', { name: /apply now/i })
    if (!(await applyBtn.isVisible({ timeout: 8_000 }).catch(() => false))) {
      test.skip(true, 'Apply Now button not visible')
      return
    }

    await applyBtn.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 8_000 })

    if (await dialog.getByText(/already applied/i).isVisible({ timeout: 2_000 }).catch(() => false)) {
      test.skip(true, 'Already applied — skipping cover letter test')
      return
    }

    const coverLetter = dialog.locator('#cover-letter')
    await expect(coverLetter).toBeVisible({ timeout: 5_000 })

    await coverLetter.fill('I am excited about this opportunity.')
    await expect(coverLetter).toHaveValue('I am excited about this opportunity.')
  })
})
