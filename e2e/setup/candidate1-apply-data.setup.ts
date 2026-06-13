/**
 * Data setup — candidate1 applies to the E2E test job via direct API call.
 * Runs after candidate1-setup and hrm-job-data-setup.
 * Stores { applicationId, jobId } in e2e/.data/test-application.json.
 * Idempotent: exits cleanly if already applied.
 */
import { test as setup } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

const DATA_DIR = path.join(__dirname, '../.data')
const TEST_JOB_FILE = path.join(DATA_DIR, 'test-job.json')
const TEST_APPLICATION_FILE = path.join(DATA_DIR, 'test-application.json')

function readApiBase(): string {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) return process.env.NEXT_PUBLIC_API_BASE_URL;
  const envPath = path.join(__dirname, '../../.env.local');
  if (fs.existsSync(envPath)) {
    const match = fs.readFileSync(envPath, 'utf8').match(/^NEXT_PUBLIC_API_BASE_URL=(.+)$/m);
    if (match) return match[1].trim();
  }
  return 'http://localhost:9085';
}

function minimalPdfBuffer(): Buffer {
  return Buffer.from(
    '%PDF-1.4\n1 0 obj\n<</Type /Catalog /Pages 2 0 R>>\nendobj\n' +
      '2 0 obj\n<</Type /Pages /Kids [3 0 R] /Count 1>>\nendobj\n' +
      '3 0 obj\n<</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]>>\nendobj\n' +
      'xref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n' +
      '0000000058 00000 n \n0000000115 00000 n \n' +
      'trailer\n<</Size 4 /Root 1 0 R>>\nstartxref\n190\n%%EOF\n',
  );
}

setup('candidate1 applies to test job', async ({ page }) => {
  setup.setTimeout(60_000)

  if (!fs.existsSync(TEST_JOB_FILE)) {
    console.warn('test-job.json not found — skipping apply data setup')
    return
  }

  const { jobId } = JSON.parse(fs.readFileSync(TEST_JOB_FILE, 'utf-8')) as {
    jobId: string; jobTitle: string;
  }

  const API_BASE = readApiBase()
  const candidate1Email = process.env.TEST_CANDIDATE1_EMAIL!
  const candidate1Password = process.env.TEST_CANDIDATE1_PASSWORD!

  // Get device ID from stored auth state
  const AUTH_FILE = path.join(__dirname, '../.auth/candidate1.json')
  let deviceId = `playwright-e2e-${candidate1Email.split('@')[0]}`
  try {
    const storageState = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'))
    const found = storageState.origins
      ?.find((o: { origin: string }) => o.origin === 'http://localhost:3000')
      ?.localStorage?.find((item: { name: string }) => item.name === 'wfa_device_id')?.value
    if (found) deviceId = found
  } catch { /* use default */ }

  // Get a fresh access token for candidate1
  const loginRes = await page.request.post(`${API_BASE}/auth/login`, {
    data: { usernameOrEmail: candidate1Email, password: candidate1Password },
    headers: { 'Content-Type': 'application/json', 'X-Device-Id': deviceId },
  })
  if (!loginRes.ok()) {
    console.warn(`candidate1 login failed (${loginRes.status()}) — skipping apply data setup`)
    return
  }
  const loginJson = await loginRes.json()
  const accessToken: string = loginJson?.data?.accessToken
  if (!accessToken) {
    console.warn('No access token — skipping apply data setup')
    return
  }

  // Check if candidate1 has already applied to this job
  const checkRes = await page.request.get(`${API_BASE}/application/check?jobId=${jobId}`, {
    headers: { 'Authorization': `Bearer ${accessToken}`, 'X-Device-Id': deviceId },
  })
  if (checkRes.ok()) {
    const checkJson = await checkRes.json()
    if (checkJson?.data?.applied === true) {
      console.log('candidate1 already applied — skipping')
      if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
      if (!fs.existsSync(TEST_APPLICATION_FILE)) {
        fs.writeFileSync(TEST_APPLICATION_FILE, JSON.stringify({ jobId, applicationId: null, alreadyExisted: true }, null, 2))
      }
      return
    }
  }

  // Submit application directly via multipart/form-data API call
  const pdfBuffer = minimalPdfBuffer()
  const submitRes = await page.request.post(`${API_BASE}/application`, {
    multipart: {
      jobId,
      email: candidate1Email,
      cvPdfFile: { name: 'test-cv.pdf', mimeType: 'application/pdf', buffer: pdfBuffer },
      coverLetter: 'Test application submitted by E2E setup.',
    },
    headers: { 'Authorization': `Bearer ${accessToken}`, 'X-Device-Id': deviceId },
  })

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

  if (!submitRes.ok()) {
    const body = await submitRes.text().catch(() => '')
    console.warn(`Application submission failed (${submitRes.status()}): ${body.substring(0, 200)}`)
    fs.writeFileSync(TEST_APPLICATION_FILE, JSON.stringify({ jobId, applicationId: null, submitFailed: true, createdAt: new Date().toISOString() }, null, 2))
    return
  }

  const submitJson = await submitRes.json()
  const applicationId: string | null = submitJson?.data?.id ?? submitJson?.data?.applicationId ?? submitJson?.applicationId ?? null

  fs.writeFileSync(TEST_APPLICATION_FILE, JSON.stringify({ jobId, applicationId, createdAt: new Date().toISOString() }, null, 2))
  console.log(`Application submitted via API. applicationId=${applicationId ?? 'unknown'}`)
})
