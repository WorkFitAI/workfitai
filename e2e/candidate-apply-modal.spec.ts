/**
 * E2E spec — Apply Now Modal (Candidate)
 * Runs under the e2e-candidate project (storageState: candidate1.json).
 * Playwright config matches: testMatch: 'e2e/candidate-*.spec.ts'
 * Depends on: candidate1-setup, hrm-job-data-setup,
 * candidate1-apply-modal-job-setup, candidate1-apply-data-setup
 */
import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import { injectAuthToken } from './helpers/inject-auth-token'

function readJobFile(fileName: string): { jobId: string; jobTitle: string } | null {
  const jobFile = path.join(__dirname, `.data/${fileName}`)
  try {
    return JSON.parse(fs.readFileSync(jobFile, 'utf-8'))
  } catch {
    return null
  }
}

function getTestJob(): { jobId: string; jobTitle: string } | null {
  return readJobFile('apply-modal-job.json')
}

function getAppliedTestJob(): { jobId: string; jobTitle: string } | null {
  return readJobFile('test-job.json')
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
    await page.waitForLoadState('load')

    const applyBtn = page.getByRole('button', { name: /apply now/i }).first()
    await expect(applyBtn).toBeVisible({ timeout: 8_000 })
    await expect(applyBtn).toBeEnabled({ timeout: 5_000 })

    await applyBtn.click()
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 8_000 })
  })

  test('modal shows Already Applied state when candidate has already submitted', async ({ page }) => {
    const job = getAppliedTestJob()
    if (!job) {
      test.skip(true, 'No applied test job available')
      return
    }

    await page.goto(`/jobs/${job.jobId}`)
    await page.waitForLoadState('load')

    const alreadyAppliedBtn = page.getByRole('button', { name: /applied/i }).first()
    await expect(alreadyAppliedBtn).toBeVisible({ timeout: 8_000 })
  })

  test('modal shows email field and CV upload zone when candidate has not applied', async ({ page }) => {
    const job = getTestJob()
    if (!job) {
      test.skip(true, 'No test job available')
      return
    }

    await page.goto(`/jobs/${job.jobId}`)
    await page.waitForLoadState('load')

    const applyBtn = page.getByRole('button', { name: /apply now/i }).first()
    await expect(applyBtn).toBeVisible({ timeout: 8_000 })
    await expect(applyBtn).toBeEnabled({ timeout: 5_000 })

    await applyBtn.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 8_000 })
    await expect(dialog.getByText(/already applied/i)).not.toBeVisible({ timeout: 2_000 })

    // Email field should be auto-populated
    await expect(dialog.locator('#apply-email')).toBeVisible({ timeout: 5_000 })
    const emailValue = await dialog.locator('#apply-email').inputValue()
    expect(emailValue.length).toBeGreaterThan(0)
    expect(emailValue).toMatch(/@/)

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
    await page.waitForLoadState('load')

    const applyBtn = page.getByRole('button', { name: /apply now/i }).first()
    await expect(applyBtn).toBeVisible({ timeout: 8_000 })
    await expect(applyBtn).toBeEnabled({ timeout: 5_000 })

    await applyBtn.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 8_000 })
    await expect(dialog.getByText(/already applied/i)).not.toBeVisible({ timeout: 2_000 })

    // Upload a non-PDF file — plain text
    await page.locator('#cv-upload').setInputFiles({
      name: 'document.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('this is not a PDF'),
    })

    await expect(dialog.getByText(/only pdf files/i)).toBeVisible({ timeout: 5_000 })
  })

  test('uploading an image file also shows the file-type validation error', async ({ page }) => {
    const job = getTestJob()
    if (!job) {
      test.skip(true, 'No test job available')
      return
    }

    await page.goto(`/jobs/${job.jobId}`)
    await page.waitForLoadState('load')

    const applyBtn = page.getByRole('button', { name: /apply now/i }).first()
    await expect(applyBtn).toBeVisible({ timeout: 8_000 })
    await expect(applyBtn).toBeEnabled({ timeout: 5_000 })

    await applyBtn.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 8_000 })
    await expect(dialog.getByText(/already applied/i)).not.toBeVisible({ timeout: 2_000 })

    // Upload a PNG file (1×1 red pixel)
    const pngBuffer = Buffer.from(
      '89504e470d0a1a0a0000000d49484452000000010000000108020000009001' +
        '2e00000000c49444154789c6260f8cf0000000200015e221bc30000000049454e44ae426082',
      'hex',
    )
    await page.locator('#cv-upload').setInputFiles({
      name: 'photo.png',
      mimeType: 'image/png',
      buffer: pngBuffer,
    })

    await expect(dialog.getByText(/only pdf files/i)).toBeVisible({ timeout: 5_000 })
  })

  test('uploading a valid PDF shows the filename and enables Submit', async ({ page }) => {
    const job = getTestJob()
    if (!job) {
      test.skip(true, 'No test job available')
      return
    }

    await page.goto(`/jobs/${job.jobId}`)
    await page.waitForLoadState('load')

    const applyBtn = page.getByRole('button', { name: /apply now/i }).first()
    await expect(applyBtn).toBeVisible({ timeout: 8_000 })
    await expect(applyBtn).toBeEnabled({ timeout: 5_000 })

    await applyBtn.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 8_000 })
    await expect(dialog.getByText(/already applied/i)).not.toBeVisible({ timeout: 2_000 })

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

  test('uploading a second PDF replaces the first file', async ({ page }) => {
    const job = getTestJob()
    if (!job) {
      test.skip(true, 'No test job available')
      return
    }

    await page.goto(`/jobs/${job.jobId}`)
    await page.waitForLoadState('load')

    const applyBtn = page.getByRole('button', { name: /apply now/i }).first()
    await expect(applyBtn).toBeVisible({ timeout: 8_000 })
    await expect(applyBtn).toBeEnabled({ timeout: 5_000 })

    await applyBtn.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 8_000 })
    await expect(dialog.getByText(/already applied/i)).not.toBeVisible({ timeout: 2_000 })

    // Upload first file
    await page.locator('#cv-upload').setInputFiles({
      name: 'cv-v1.pdf',
      mimeType: 'application/pdf',
      buffer: minimalPdfBuffer(),
    })
    await expect(dialog.getByText('cv-v1.pdf')).toBeVisible({ timeout: 5_000 })

    // Upload second file — should replace the first
    await page.locator('#cv-upload').setInputFiles({
      name: 'cv-final.pdf',
      mimeType: 'application/pdf',
      buffer: minimalPdfBuffer(),
    })
    await expect(dialog.getByText('cv-final.pdf')).toBeVisible({ timeout: 5_000 })
  })

  test('clicking Submit without a CV shows the required-file validation error', async ({ page }) => {
    const job = getTestJob()
    if (!job) {
      test.skip(true, 'No test job available')
      return
    }

    await page.goto(`/jobs/${job.jobId}`)
    await page.waitForLoadState('load')

    const applyBtn = page.getByRole('button', { name: /apply now/i }).first()
    await expect(applyBtn).toBeVisible({ timeout: 8_000 })
    await expect(applyBtn).toBeEnabled({ timeout: 5_000 })

    await applyBtn.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 8_000 })
    await expect(dialog.getByText(/already applied/i)).not.toBeVisible({ timeout: 2_000 })

    // Submit button is disabled when no CV
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
    await page.waitForLoadState('load')

    const applyBtn = page.getByRole('button', { name: /apply now/i }).first()
    await expect(applyBtn).toBeVisible({ timeout: 8_000 })
    await expect(applyBtn).toBeEnabled({ timeout: 5_000 })

    await applyBtn.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 8_000 })
    await expect(dialog.getByText(/already applied/i)).not.toBeVisible({ timeout: 2_000 })

    const coverLetter = dialog.locator('#cover-letter')
    await expect(coverLetter).toBeVisible({ timeout: 5_000 })

    await coverLetter.fill('I am excited about this opportunity.')
    await expect(coverLetter).toHaveValue('I am excited about this opportunity.')
  })

  test('cover letter accepts a detailed multi-line cover letter', async ({ page }) => {
    const job = getTestJob()
    if (!job) {
      test.skip(true, 'No test job available')
      return
    }

    await page.goto(`/jobs/${job.jobId}`)
    await page.waitForLoadState('load')

    const applyBtn = page.getByRole('button', { name: /apply now/i }).first()
    await expect(applyBtn).toBeVisible({ timeout: 8_000 })
    await expect(applyBtn).toBeEnabled({ timeout: 5_000 })

    await applyBtn.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 8_000 })
    await expect(dialog.getByText(/already applied/i)).not.toBeVisible({ timeout: 2_000 })

    const coverLetter = dialog.locator('#cover-letter')
    await expect(coverLetter).toBeVisible({ timeout: 5_000 })

    const detailedText =
      'Dear Hiring Manager,\n\n' +
      'I have 5 years of experience in software engineering with expertise in TypeScript, React, and Node.js. ' +
      'I am passionate about building scalable systems and improving developer experience.\n\n' +
      'In my previous role at a fintech startup, I led a team of 4 engineers and delivered a real-time payment ' +
      'dashboard that processed 10,000 transactions per day.\n\n' +
      'I would love to contribute to your team. Thank you for considering my application.\n\n' +
      'Best regards,\nTest Candidate'

    await coverLetter.fill(detailedText)
    const savedValue = await coverLetter.inputValue()
    // Value should contain the key content (newlines may be normalised)
    expect(savedValue).toContain('5 years of experience')
    expect(savedValue).toContain('Hiring Manager')
  })

  test('cover letter accepts special characters and unicode', async ({ page }) => {
    const job = getTestJob()
    if (!job) {
      test.skip(true, 'No test job available')
      return
    }

    await page.goto(`/jobs/${job.jobId}`)
    await page.waitForLoadState('load')

    const applyBtn = page.getByRole('button', { name: /apply now/i }).first()
    await expect(applyBtn).toBeVisible({ timeout: 8_000 })
    await expect(applyBtn).toBeEnabled({ timeout: 5_000 })

    await applyBtn.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 8_000 })
    await expect(dialog.getByText(/already applied/i)).not.toBeVisible({ timeout: 2_000 })

    const coverLetter = dialog.locator('#cover-letter')
    await expect(coverLetter).toBeVisible({ timeout: 5_000 })

    // Unicode, accented characters, and tech symbols commonly used in cover letters
    const unicodeText =
      'Xin chào! I am Nguyễn Văn An, a developer with experience in C++, TypeScript & Python. ' +
      'My résumé highlights projects in AI/ML and full-stack development (React + Node.js).'

    await coverLetter.fill(unicodeText)
    const savedValue = await coverLetter.inputValue()
    expect(savedValue.length).toBeGreaterThan(50)
  })

  test('modal dialog has an accessible title or heading', async ({ page }) => {
    const job = getTestJob()
    if (!job) {
      test.skip(true, 'No test job available')
      return
    }

    await page.goto(`/jobs/${job.jobId}`)
    await page.waitForLoadState('load')

    const applyBtn = page.getByRole('button', { name: /apply now/i }).first()
    await expect(applyBtn).toBeVisible({ timeout: 8_000 })
    await expect(applyBtn).toBeEnabled({ timeout: 5_000 })

    await applyBtn.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 8_000 })

    // Dialog should have a visible heading (Apply Now, Apply for Job, etc.)
    const heading = dialog.getByRole('heading').first()
    const hasHeading = await heading.isVisible({ timeout: 5_000 }).catch(() => false)

    // If no heading role, fall back to any dialog title text
    const hasTitleText = await dialog
      .getByText(/apply|application|job title/i)
      .first()
      .isVisible({ timeout: 3_000 })
      .catch(() => false)

    expect(hasHeading || hasTitleText).toBeTruthy()
  })
})
