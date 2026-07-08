/**
 * Data setup — candidates submit applications driven by e2e/fixtures/application-definitions.json.
 * Add or remove entries in that file to control how many applications are created.
 * CV files are read from e2e/fixtures/cv/<username>.pdf; falls back to a blank PDF if missing.
 *
 * Writes e2e/.data/test-applications.json for downstream assignment setup and spec assertions.
 * Idempotent: skips already-applied candidates.
 */
import { test as setup } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

const DATA_DIR = path.join(__dirname, '../.data')
const TEST_JOBS_FILE = path.join(DATA_DIR, 'test-jobs.json')
const TEST_APPLICATIONS_FILE = path.join(DATA_DIR, 'test-applications.json')
const FIXTURES_FILE = path.join(__dirname, '../fixtures/application-definitions.json')
const CV_DIR = path.join(__dirname, '../fixtures/cv')

export interface TestApplicationEntry {
  applicationId: string | null
  jobId: string
  jobTitle: string
  candidateEmail: string
  candidateNum: number
  hrmKey: 'hrm1' | 'hrm2'
  createdAt: string
}

function readApiBase(): string {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) return process.env.NEXT_PUBLIC_API_BASE_URL
  const envPath = path.join(__dirname, '../../.env.local')
  if (fs.existsSync(envPath)) {
    const match = fs.readFileSync(envPath, 'utf8').match(/^NEXT_PUBLIC_API_BASE_URL=(.+)$/m)
    if (match) return match[1].trim()
  }
  return 'http://localhost:9085'
}

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

function resolveCvBuffer(email: string, cvFile?: string): Buffer {
  // Prefer the per-application CV file (e.g. candidate1_3.pdf) when provided
  if (cvFile) {
    const specificPath = path.join(CV_DIR, cvFile)
    if (fs.existsSync(specificPath)) return fs.readFileSync(specificPath)
  }
  // Fallback: generic per-candidate CV (<username>.pdf)
  const username = email.split('@')[0]
  const cvPath = path.join(CV_DIR, `${username}.pdf`)
  if (fs.existsSync(cvPath)) return fs.readFileSync(cvPath)
  // Last resort: minimal valid single-page PDF
  return minimalPdfBuffer()
}

async function loginAndGetToken(
  page: import('@playwright/test').Page,
  apiBase: string,
  email: string,
  password: string,
): Promise<{ accessToken: string; deviceId: string } | null> {
  const deviceId = `playwright-e2e-${email.split('@')[0]}`
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await page.request.post(`${apiBase}/auth/login`, {
        data: { usernameOrEmail: email, password },
        headers: { 'Content-Type': 'application/json', 'X-Device-Id': deviceId },
      })
      if (!res.ok()) {
        console.warn(`Login failed for ${email}: ${res.status()} (attempt ${attempt}/3)`)
        if (res.status() >= 500 && attempt < 3) {
          await page.waitForTimeout(500 * attempt)
          continue
        }
        return null
      }
      const json = await res.json()
      const { accessToken } = json?.data ?? {}
      if (!accessToken) {
        console.warn(`Login response for ${email} did not include an access token (attempt ${attempt}/3)`)
        if (attempt < 3) {
          await page.waitForTimeout(500 * attempt)
          continue
        }
        return null
      }
      return { accessToken, deviceId }
    } catch (err) {
      console.warn(`Login error for ${email} (attempt ${attempt}/3): ${err}`)
      if (attempt < 3) {
        await page.waitForTimeout(500 * attempt)
        continue
      }
      return null
    }
  }
  return null
}

async function getExistingApplicationId(
  page: import('@playwright/test').Page,
  apiBase: string,
  jobId: string,
  auth: { accessToken: string; deviceId: string },
): Promise<string | null> {
  try {
    // Check if already applied
    const checkRes = await page.request.get(`${apiBase}/application/check?jobId=${jobId}`, {
      headers: { Authorization: `Bearer ${auth.accessToken}`, 'X-Device-Id': auth.deviceId },
    })
    if (!checkRes.ok()) return null
    const checkJson = await checkRes.json()
    if (!checkJson?.data?.applied) return null

    // Fetch existing application to get its ID
    const listRes = await page.request.get(`${apiBase}/application/my?page=0&size=50`, {
      headers: { Authorization: `Bearer ${auth.accessToken}`, 'X-Device-Id': auth.deviceId },
    })
    if (!listRes.ok()) return 'already-applied-unknown-id'
    const listJson = await listRes.json()
    const apps: Array<{ id?: string; jobId?: string }> = listJson?.data?.items ?? []
    const match = Array.isArray(apps) ? apps.find((a) => a.jobId === jobId) : null
    return match?.id ?? 'already-applied-unknown-id'
  } catch {
    return null
  }
}

async function submitApplication(
  page: import('@playwright/test').Page,
  apiBase: string,
  jobId: string,
  email: string,
  coverLetter: string,
  auth: { accessToken: string; deviceId: string },
  cvBuffer: Buffer,
): Promise<string | null> {
  const username = email.split('@')[0]
  try {
    const res = await page.request.post(`${apiBase}/application`, {
      multipart: {
        jobId,
        email,
        cvPdfFile: {
          name: `${username}.pdf`,
          mimeType: 'application/pdf',
          buffer: cvBuffer,
        },
        coverLetter,
      },
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
        'X-Device-Id': auth.deviceId,
      },
    })
    if (!res.ok()) {
      const body = await res.text().catch(() => '')
      console.warn(`Apply failed for ${email} → ${jobId} (${res.status()}): ${body.substring(0, 150)}`)
      return null
    }
    const json = await res.json()
    return json?.data?.id ?? json?.data?.applicationId ?? json?.applicationId ?? null
  } catch (err) {
    console.warn(`submitApplication error: ${err}`)
    return null
  }
}

setup('apply to jobs with all candidates', async ({ page }) => {
  setup.setTimeout(180_000)

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

  if (!fs.existsSync(TEST_JOBS_FILE)) {
    console.warn('test-jobs.json not found — skipping multi-candidate apply setup')
    return
  }

  const { jobs } = JSON.parse(fs.readFileSync(TEST_JOBS_FILE, 'utf-8')) as {
    jobs: Array<{ jobId: string; jobTitle: string; hrmKey: 'hrm1' | 'hrm2' }>
  }

  if (!jobs?.length) {
    console.warn('No jobs in test-jobs.json — skipping')
    return
  }

  // Index jobs by hrmKey for O(1) lookup by { hrmKey, index }
  const jobsByKey: Record<string, Array<{ jobId: string; jobTitle: string; hrmKey: 'hrm1' | 'hrm2' }>> = {
    hrm1: jobs.filter((j) => j.hrmKey === 'hrm1'),
    hrm2: jobs.filter((j) => j.hrmKey === 'hrm2'),
  }

  // Load application definitions from fixture — controls quantity and mapping
  const { applications: appDefs } = JSON.parse(fs.readFileSync(FIXTURES_FILE, 'utf-8')) as {
    applications: Array<{
      candidateNum: number
      jobRef: { hrmKey: 'hrm1' | 'hrm2'; index: number }
      cvFile?: string
      coverLetter: string
    }>
  }

  const API_BASE = readApiBase()
  const results: TestApplicationEntry[] = []
  const previousApplications: TestApplicationEntry[] = fs.existsSync(TEST_APPLICATIONS_FILE)
    ? JSON.parse(fs.readFileSync(TEST_APPLICATIONS_FILE, 'utf-8')).applications ?? []
    : []

  for (const appDef of appDefs) {
    const { candidateNum: num, jobRef, coverLetter } = appDef

    const jobPool = jobsByKey[jobRef.hrmKey] ?? []
    // Fallback to first job in the pool if the index doesn't exist
    const job = jobPool[jobRef.index] ?? jobPool[0]
    if (!job) {
      console.warn(`No job for ref { hrmKey: ${jobRef.hrmKey}, index: ${jobRef.index} } — skipping candidate${num}`)
      continue
    }

    const emailKey = `TEST_CANDIDATE${num}_EMAIL`
    const passwordKey = `TEST_CANDIDATE${num}_PASSWORD`
    const email = process.env[emailKey]
    const password = process.env[passwordKey]

    if (!email || !password) {
      console.warn(`No env vars for candidate${num} — skipping`)
      continue
    }

    const auth = await loginAndGetToken(page, API_BASE, email, password)
    if (!auth) {
      const previousEntry = previousApplications.find(
        (entry) => entry.candidateNum === num && entry.jobId === job.jobId && entry.hrmKey === job.hrmKey,
      )
      if (previousEntry) {
        console.warn(`Reusing previous application record for candidate${num} -> ${job.jobTitle}`)
        results.push({ ...previousEntry, createdAt: new Date().toISOString() })
      }
      continue
    }

    const existingId = await getExistingApplicationId(page, API_BASE, job.jobId, auth)
    if (existingId !== null) {
      console.log(`candidate${num} already applied to ${job.jobTitle} — id=${existingId}`)
      results.push({
        applicationId: existingId === 'already-applied-unknown-id' ? null : existingId,
        jobId: job.jobId,
        jobTitle: job.jobTitle,
        candidateEmail: email,
        candidateNum: num,
        hrmKey: job.hrmKey,
        createdAt: new Date().toISOString(),
      })
      continue
    }

    const cvBuffer = resolveCvBuffer(email, appDef.cvFile)
    const applicationId = await submitApplication(page, API_BASE, job.jobId, email, coverLetter, auth, cvBuffer)

    results.push({
      applicationId,
      jobId: job.jobId,
      jobTitle: job.jobTitle,
      candidateEmail: email,
      candidateNum: num,
      hrmKey: job.hrmKey,
      createdAt: new Date().toISOString(),
    })

    console.log(`candidate${num} applied to "${job.jobTitle}": applicationId=${applicationId ?? 'unknown'}`)
  }

  fs.writeFileSync(TEST_APPLICATIONS_FILE, JSON.stringify({ applications: results }, null, 2))
  console.log(`test-applications.json written with ${results.length} application record(s)`)
})
