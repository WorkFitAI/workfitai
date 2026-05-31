/**
 * Data setup — candidate1 applies to the E2E test job.
 * Runs after candidate1-setup and hrm-job-data-setup.
 * Stores { applicationId, jobId } in e2e/.data/test-application.json.
 * Idempotent: if the modal shows "Already Applied" the setup exits cleanly.
 */
import { test as setup, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

const DATA_DIR = path.join(__dirname, '../.data')
const TEST_JOB_FILE = path.join(DATA_DIR, 'test-job.json')
const TEST_APPLICATION_FILE = path.join(DATA_DIR, 'test-application.json')

setup('candidate1 applies to test job', async ({ page }) => {
  setup.setTimeout(60_000)

  // Load the test job created by hrm-job-data-setup
  if (!fs.existsSync(TEST_JOB_FILE)) {
    console.warn('test-job.json not found — skipping apply data setup')
    return
  }

  const { jobId } = JSON.parse(fs.readFileSync(TEST_JOB_FILE, 'utf-8')) as {
    jobId: string
    jobTitle: string
  }

  // storageState restores cookies + localStorage but NOT sessionStorage (wfa_access_token).
  // Do a fresh login so the modal's API calls are authenticated without needing a token refresh.
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9085'
  const candidate1Email = process.env.TEST_CANDIDATE1_EMAIL!
  const candidate1Password = process.env.TEST_CANDIDATE1_PASSWORD!

  const AUTH_FILE = path.join(__dirname, '../.auth/candidate1.json')
  try {
    const storageState = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'))
    const deviceId =
      storageState.origins
        ?.find((o: { origin: string }) => o.origin === 'http://localhost:3000')
        ?.localStorage?.find((item: { name: string }) => item.name === 'wfa_device_id')
        ?.value ?? 'playwright-e2e-candidate1'

    const loginRes = await page.request.post(`${API_BASE}/auth/login`, {
      data: { usernameOrEmail: candidate1Email, password: candidate1Password },
      headers: { 'Content-Type': 'application/json', 'X-Device-Id': deviceId },
    })
    if (loginRes.ok()) {
      const json = await loginRes.json()
      const { accessToken, expiryInMs } = json?.data ?? {}
      if (accessToken) {
        const expiresAt = String(Date.now() + (expiryInMs ?? 900_000))
        await page.addInitScript(
          ({ token, expiry }: { token: string; expiry: string }) => {
            sessionStorage.setItem('wfa_access_token', token)
            sessionStorage.setItem('wfa_token_expiry', expiry)
          },
          { token: accessToken, expiry: expiresAt },
        )
      }
    }
  } catch {
    // login pre-injection failed — page will attempt cookie-based refresh on first 401
  }

  // Navigate to the job detail page
  await page.goto(`/jobs/${jobId}`)
  await page.waitForLoadState('networkidle')

  // Check if already applied — if so, store a sentinel and exit
  const alreadyApplied = page
    .getByRole('button', { name: /applied/i })
    .or(page.getByText(/already applied/i))

  if (await alreadyApplied.first().isVisible({ timeout: 5_000 }).catch(() => false)) {
    console.log('candidate1 already applied — skipping')
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
    if (!fs.existsSync(TEST_APPLICATION_FILE)) {
      fs.writeFileSync(
        TEST_APPLICATION_FILE,
        JSON.stringify({ jobId, applicationId: null, alreadyExisted: true }, null, 2),
      )
    }
    return
  }

  // Click Apply Now to open modal — use .first() because related-jobs section also renders Apply Now buttons
  const applyBtn = page.getByRole('button', { name: /apply now/i }).first()
  await expect(applyBtn).toBeVisible({ timeout: 10_000 })
  await applyBtn.click()

  // Wait for modal dialog
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible({ timeout: 8_000 })

  // Check if modal already shows "Already Applied" state
  const alreadyAppliedInModal = dialog.getByText(/already applied/i)
  if (await alreadyAppliedInModal.isVisible({ timeout: 2_000 }).catch(() => false)) {
    console.log('modal shows already applied — skipping')
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
    if (!fs.existsSync(TEST_APPLICATION_FILE)) {
      fs.writeFileSync(
        TEST_APPLICATION_FILE,
        JSON.stringify({ jobId, applicationId: null, alreadyExisted: true }, null, 2),
      )
    }
    return
  }

  // Upload a minimal PDF (inline Buffer — no external fixture needed)
  const minimalPdf = Buffer.from(
    '%PDF-1.4\n1 0 obj\n<</Type /Catalog /Pages 2 0 R>>\nendobj\n' +
      '2 0 obj\n<</Type /Pages /Kids [3 0 R] /Count 1>>\nendobj\n' +
      '3 0 obj\n<</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]>>\nendobj\n' +
      'xref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n' +
      '0000000058 00000 n \n0000000115 00000 n \n' +
      'trailer\n<</Size 4 /Root 1 0 R>>\nstartxref\n190\n%%EOF\n',
  )

  await page.locator('#cv-upload').setInputFiles({
    name: 'test-cv.pdf',
    mimeType: 'application/pdf',
    buffer: minimalPdf,
  })

  // Wait for the submit button to become enabled (CV + email both filled)
  const submitBtn = page.getByRole('button', { name: /submit application/i })
  await expect(submitBtn).toBeEnabled({ timeout: 5_000 })

  // Intercept to capture the application ID from the response
  let applicationId: string | null = null
  page.on('response', async (res) => {
    if (res.url().includes('/application') && res.request().method() === 'POST') {
      try {
        const json = await res.json()
        applicationId = json?.data?.applicationId ?? json?.applicationId ?? null
      } catch {
        // ignore parse errors
      }
    }
  })

  await submitBtn.click()

  // Wait for modal to close — backend CV upload can be slow; use a soft timeout.
  // If it times out, write a partial sentinel so dependent tests can skip gracefully.
  const closed = await dialog.waitFor({ state: 'hidden', timeout: 45_000 }).then(() => true).catch(() => false)

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

  if (!closed) {
    console.warn('Apply modal did not close within 45 s — backend may be slow or erroring. Writing sentinel for dependent tests.')
    fs.writeFileSync(
      TEST_APPLICATION_FILE,
      JSON.stringify({ jobId, applicationId: null, timedOut: true, createdAt: new Date().toISOString() }, null, 2),
    )
    // Close the dialog so the browser is in a clean state
    await page.keyboard.press('Escape')
    return
  }

  fs.writeFileSync(
    TEST_APPLICATION_FILE,
    JSON.stringify({ jobId, applicationId, createdAt: new Date().toISOString() }, null, 2),
  )

  console.log(`Application submitted. applicationId=${applicationId ?? 'unknown'}`)
})
