/**
 * Data setup — all 10 candidates submit applications to the multi-job dataset.
 *
 * Application matrix:
 *   Candidate 2, 3, 4  → HRM1 Frontend Developer job
 *   Candidate 5, 6, 7  → HRM1 Data Analyst job
 *   Candidate 8, 9     → HRM2 Product Manager job
 *   Candidate 8, 10    → HRM2 Mobile Developer job  (C8 applies to both HRM2 jobs)
 *
 * Candidate 1 is handled by the existing candidate1-apply-data.setup.ts (Backend Engineer).
 * Writes e2e/.data/test-applications.json for downstream assignment setup and spec assertions.
 * Idempotent: skips already-applied candidates.
 */
import { test as setup } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

const DATA_DIR = path.join(__dirname, '../.data')
const TEST_JOBS_FILE = path.join(DATA_DIR, 'test-jobs.json')
const TEST_APPLICATIONS_FILE = path.join(DATA_DIR, 'test-applications.json')

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

const COVER_LETTERS: Record<number, string> = {
  2: 'I have 3 years of professional React and TypeScript experience, having shipped several large-scale SPAs for e-commerce and fintech clients. I am excited about this Frontend Developer role and confident I can contribute from day one.',
  3: 'Frontend development is my passion. I specialize in React with TypeScript and have a strong eye for performance — Lighthouse scores above 90 are my baseline. I would love to bring that discipline to your team.',
  4: 'As a frontend engineer who recently transitioned from backend development, I bring a unique perspective on full-stack concerns. I have 2 years of React/TypeScript work and am eager to grow further in a product-focused environment.',
  5: 'My background in statistics combined with hands-on SQL and Python experience makes me a strong candidate for this Data Analyst role. I have built end-to-end dashboards in Tableau and Power BI for retail analytics teams.',
  6: 'With a Master\'s degree in Data Science and 1 year of industry experience, I am eager to bring rigorous analytical thinking and BI skills to your organisation. I am particularly excited about turning complex datasets into clear business stories.',
  7: 'I am an entry-level analyst with strong SQL fundamentals, a working knowledge of Python (pandas, matplotlib), and hands-on Metabase experience. I am motivated by data-driven cultures and keen to grow with your team.',
  8: 'With 4 years of mobile product management across iOS and Android — including two apps exceeding 500k MAU — I have a proven record of shipping impactful products. Your remote-friendly culture and equity programme make this opportunity especially exciting.',
  9: 'I have led product discovery, defined OKRs, and collaborated with engineering and design for 3+ years at a growth-stage startup. I am particularly skilled at balancing user needs with business metrics and would thrive in your senior PM role.',
  10: 'Two years of React Native development with one shipped Flutter project gives me cross-platform versatility. I focus on clean architecture, smooth animations, and rigorous testing. I am excited to bring this experience to your Mobile Developer position.',
}

async function loginAndGetToken(
  page: import('@playwright/test').Page,
  apiBase: string,
  email: string,
  password: string,
): Promise<{ accessToken: string; deviceId: string } | null> {
  const deviceId = `playwright-e2e-${email.split('@')[0]}`
  try {
    const res = await page.request.post(`${apiBase}/auth/login`, {
      data: { usernameOrEmail: email, password },
      headers: { 'Content-Type': 'application/json', 'X-Device-Id': deviceId },
    })
    if (!res.ok()) {
      console.warn(`Login failed for ${email}: ${res.status()}`)
      return null
    }
    const json = await res.json()
    const { accessToken } = json?.data ?? {}
    if (!accessToken) return null
    return { accessToken, deviceId }
  } catch (err) {
    console.warn(`Login error for ${email}: ${err}`)
    return null
  }
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
): Promise<string | null> {
  try {
    const res = await page.request.post(`${apiBase}/application`, {
      multipart: {
        jobId,
        email,
        cvPdfFile: {
          name: 'cv.pdf',
          mimeType: 'application/pdf',
          buffer: minimalPdfBuffer(),
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

  const hrm1Jobs = jobs.filter((j) => j.hrmKey === 'hrm1')
  const hrm2Jobs = jobs.filter((j) => j.hrmKey === 'hrm2')

  // Map each candidate to the jobs they should apply to
  const candidateJobMap: Array<{ num: number; jobs: typeof jobs }> = [
    // Candidates 2-4 → HRM1 jobs (prefer Frontend Developer = index 0)
    { num: 2, jobs: hrm1Jobs.slice(0, 1) },
    { num: 3, jobs: hrm1Jobs.slice(0, 1) },
    { num: 4, jobs: hrm1Jobs.slice(0, 1) },
    // Candidates 5-7 → HRM1 Data Analyst (index 1) or fallback to first HRM1 job
    { num: 5, jobs: hrm1Jobs.length > 1 ? hrm1Jobs.slice(1, 2) : hrm1Jobs.slice(0, 1) },
    { num: 6, jobs: hrm1Jobs.length > 1 ? hrm1Jobs.slice(1, 2) : hrm1Jobs.slice(0, 1) },
    { num: 7, jobs: hrm1Jobs.length > 1 ? hrm1Jobs.slice(1, 2) : hrm1Jobs.slice(0, 1) },
    // Candidates 8-9 → HRM2 Product Manager (index 0)
    { num: 8, jobs: hrm2Jobs.slice(0, 1) },
    { num: 9, jobs: hrm2Jobs.slice(0, 1) },
    // Candidate 8 also applies to HRM2 Mobile Developer (index 1) → handled with separate entry
    { num: 8, jobs: hrm2Jobs.length > 1 ? hrm2Jobs.slice(1, 2) : [] },
    // Candidate 10 → HRM2 Mobile Developer (index 1)
    { num: 10, jobs: hrm2Jobs.length > 1 ? hrm2Jobs.slice(1, 2) : hrm2Jobs.slice(0, 1) },
  ]

  const API_BASE = readApiBase()
  const results: TestApplicationEntry[] = []

  for (const { num, jobs: targetJobs } of candidateJobMap) {
    if (!targetJobs.length) continue

    const emailKey = `TEST_CANDIDATE${num}_EMAIL`
    const passwordKey = `TEST_CANDIDATE${num}_PASSWORD`
    const email = process.env[emailKey]
    const password = process.env[passwordKey]

    if (!email || !password) {
      console.warn(`No env vars for candidate${num} — skipping`)
      continue
    }

    const auth = await loginAndGetToken(page, API_BASE, email, password)
    if (!auth) continue

    for (const job of targetJobs) {
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

      const coverLetter = COVER_LETTERS[num] ?? `I am excited to apply for the ${job.jobTitle} position.`
      const applicationId = await submitApplication(page, API_BASE, job.jobId, email, coverLetter, auth)

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
  }

  fs.writeFileSync(TEST_APPLICATIONS_FILE, JSON.stringify({ applications: results }, null, 2))
  console.log(`test-applications.json written with ${results.length} application record(s)`)
})
