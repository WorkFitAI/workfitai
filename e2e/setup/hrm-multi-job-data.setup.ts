/**
 * Data setup — creates 4 diverse published jobs via browser UI automation.
 *   HRM1 creates: Frontend Developer, Data Analyst
 *   HRM2 creates: Product Manager, Mobile Developer
 *
 * Uses UI form submission (not direct API) to bypass the job-service circuit
 * breaker that rejects POST /job/hr/jobs when triggered by prior failures.
 * Switches user context mid-test by swapping the auth_session cookie and
 * localStorage token.
 *
 * Writes e2e/.data/test-jobs.json for downstream setups and spec files.
 */
import { test as setup, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

const DATA_DIR = path.join(__dirname, '../.data')
const TEST_JOBS_FILE = path.join(DATA_DIR, 'test-jobs.json')

export interface TestJobEntry {
  jobId: string
  jobTitle: string
  hrmKey: 'hrm1' | 'hrm2'
  createdAt: string
}

function readApiBase(): string {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) return process.env.NEXT_PUBLIC_API_BASE_URL
  const envPath = path.join(__dirname, '../../.env.local')
  if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, 'utf8')
    const match = raw.match(/^NEXT_PUBLIC_API_BASE_URL=(.+)$/m)
    if (match) return match[1].trim()
  }
  return 'http://localhost:9085'
}

interface LoginResult {
  accessToken: string
  deviceId: string
  companyId: string | null
  username: string
  roles: string[]
  expiryInMs: number
}

async function loginViaApi(
  page: import('@playwright/test').Page,
  apiBase: string,
  email: string,
  password: string,
): Promise<LoginResult | null> {
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
    const { accessToken, expiryInMs, username, roles, companyId } = json?.data ?? {}
    if (!accessToken) return null
    return {
      accessToken,
      deviceId,
      companyId: companyId ?? null,
      username: username ?? email.split('@')[0],
      roles: ((roles as string[]) ?? []).map((r: string) => (r.startsWith('ROLE_') ? r : `ROLE_${r}`)),
      expiryInMs: expiryInMs ?? 900_000,
    }
  } catch (err) {
    console.warn(`Login error for ${email}: ${err}`)
    return null
  }
}

async function switchSession(
  page: import('@playwright/test').Page,
  auth: LoginResult,
): Promise<void> {
  const expiresAt = Date.now() + auth.expiryInMs
  const session = {
    username: auth.username,
    roles: auth.roles,
    companyId: auth.companyId ?? null,
    expiresAt,
  }

  // Replace auth_session cookie with the new user's session
  await page.context().clearCookies()
  await page.context().addCookies([
    {
      name: 'auth_session',
      value: encodeURIComponent(JSON.stringify(session)),
      domain: 'localhost',
      path: '/',
      expires: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    },
  ])

  // Replace localStorage tokens
  await page.evaluate(
    ({ token, expiry, id }: { token: string; expiry: string; id: string }) => {
      localStorage.setItem('wfa_device_id', id)
      localStorage.setItem('wfa_access_token', token)
      localStorage.setItem('wfa_token_expiry', expiry)
    },
    { token: auth.accessToken, expiry: String(expiresAt), id: auth.deviceId },
  )
}

interface JobFormData {
  title: string
  shortDescription: string
  fullDescription: string
  location: string
  educationLevel: string
  requiredExperience: string
  skills: string[]
  salaryMin: number
  salaryMax: number
  quantity: number
}

async function createJobViaUI(
  page: import('@playwright/test').Page,
  auth: LoginResult,
  jobData: JobFormData,
  apiBase: string,
): Promise<string | null> {
  // Ensure we're on the job-posts page with the right session
  await switchSession(page, auth)
  await page.goto('/job-posts')
  await expect(page).toHaveURL(/job-posts/, { timeout: 15_000 })

  const createBtn = page.getByRole('button', { name: /create new job/i })
  await expect(createBtn).toBeVisible({ timeout: 20_000 })
  await createBtn.click()

  const dialog = page.getByRole('dialog', { name: /add new job/i })
  await expect(dialog).toBeVisible({ timeout: 8_000 })

  // Fill required form fields
  await page.getByLabel('Job Title').fill(jobData.title)
  await page
    .getByPlaceholder('Brief overview for job listing...')
    .fill(jobData.shortDescription)
  await page
    .locator("label:has-text('Full Description') ~ textarea")
    .fill(jobData.fullDescription)
  await page.getByPlaceholder('City, Country').fill(jobData.location)
  await page.getByPlaceholder('e.g. Bachelor in CS').fill(jobData.educationLevel)
  await page.getByPlaceholder('e.g. 3-5 years').fill(jobData.requiredExperience)

  // Add skills using the skill input
  const skillInput = page.getByPlaceholder('Type skill and press Enter...')
  for (const skillName of jobData.skills) {
    await skillInput.fill(skillName)
    await page.waitForTimeout(700)
    const suggestion = dialog
      .locator('.absolute.z-50')
      .locator('.cursor-pointer')
      .filter({ hasText: skillName })
      .first()
    if (await suggestion.isVisible({ timeout: 2_500 }).catch(() => false)) {
      await suggestion.click()
    } else {
      await skillInput.press('Enter')
    }
    await page.waitForTimeout(300)
  }

  // Salary min/max/quantity
  await page.locator('input[type="number"]').nth(0).fill(String(jobData.salaryMin))
  await page.locator('input[type="number"]').nth(1).fill(String(jobData.salaryMax))
  await page
    .locator('input[type="number"]')
    .nth(2)
    .fill(String(jobData.quantity))
    .catch(() => {})

  // Set expiration date (next month, day 20)
  const calTrigger = page
    .getByRole('button')
    .filter({ hasText: /\d+\/\d+\/\d+/ })
    .first()
  if (await calTrigger.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await calTrigger.click()
    const nextMonthBtn = page.getByRole('button', { name: 'Go to the Next Month' })
    if (await nextMonthBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await nextMonthBtn.click()
      const day20Btn = page
        .locator('[role="grid"] button')
        .filter({ hasText: /^20$/ })
        .first()
      if (await day20Btn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await day20Btn.click({ timeout: 3_000 })
      }
    }
    await page.keyboard.press('Escape')
  }

  // Capture POST response before clicking save
  const capturedResponses: import('@playwright/test').Response[] = []
  const listener = (res: import('@playwright/test').Response) => {
    if (res.url().includes('/job/hr/jobs') && res.request().method() === 'POST') {
      capturedResponses.push(res)
    }
  }
  page.on('response', listener)

  await page.getByRole('button', { name: /save job post/i }).click()
  await expect(dialog).not.toBeVisible({ timeout: 8_000 })
  await page.waitForTimeout(10_000)
  page.off('response', listener)

  const jobRes = capturedResponses.find((r) => r.ok()) ?? capturedResponses[0]
  if (!jobRes) {
    console.warn(`No POST /job/hr/jobs response captured for "${jobData.title}"`)
    return null
  }
  if (!jobRes.ok()) {
    const body = await jobRes.text().catch(() => '')
    console.warn(`Job creation failed (${jobRes.status()}) for "${jobData.title}": ${body.substring(0, 200)}`)
    return null
  }

  // Extract job ID from response
  let jobId: string | null = null
  try {
    const json = await jobRes.json()
    jobId =
      json?.result?.postId ??
      json?.data?.postId ??
      json?.postId ??
      json?.result?.id ??
      json?.data?.id ??
      json?.id ??
      null
  } catch {
    // ignore
  }

  // Fallback: extract job ID from a job link on the page
  if (!jobId) {
    const firstLink = page.locator('a[href*="/jobs/"]').first()
    if (await firstLink.isVisible({ timeout: 12_000 }).catch(() => false)) {
      const href = await firstLink.getAttribute('href')
      const match = href?.match(/\/jobs\/([^/?#]+)/)
      jobId = match ? match[1] : null
    }
  }

  if (!jobId) {
    console.warn(`Could not determine job ID for "${jobData.title}"`)
    return null
  }

  // Publish via API (PUT is not circuit-broken)
  try {
    const pubRes = await page.request.put(`${apiBase}/job/hr/jobs/${jobId}/PUBLISHED`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.accessToken}`,
        'X-Device-Id': auth.deviceId,
      },
    })
    if (pubRes.ok()) {
      console.log(`Published job ${jobId} ("${jobData.title}")`)
    } else {
      const body = await pubRes.text().catch(() => '')
      console.warn(`Publish returned ${pubRes.status()} for ${jobId}: ${body.substring(0, 100)}`)
    }
  } catch (err) {
    console.warn(`Publish API error for ${jobId}: ${err}`)
  }

  return jobId
}

async function ensureJobsPublished(
  apiBase: string,
  page: import('@playwright/test').Page,
  jobs: TestJobEntry[],
  hrm1Token: string,
  hrm2Token: string,
): Promise<boolean> {
  for (const job of jobs) {
    const token = job.hrmKey === 'hrm1' ? hrm1Token : hrm2Token
    const headers = { Authorization: `Bearer ${token}`, 'X-Device-Id': 'playwright-e2e-check' }
    try {
      const res = await page.request.get(`${apiBase}/job/hr/jobs/${job.jobId}`, { headers })
      if (!res.ok()) return false
      const json = await res.json()
      const status = json?.data?.status
      if (status === 'PUBLISHED') continue
      // Re-publish CLOSED or DRAFT jobs rather than recreating from scratch
      const pubRes = await page.request.put(`${apiBase}/job/hr/jobs/${job.jobId}/PUBLISHED`, { headers })
      if (!pubRes.ok()) {
        console.warn(`Re-publish failed for ${job.jobId}: ${pubRes.status()}`)
        return false
      }
      console.log(`Re-published ${job.jobId} (was ${status})`)
    } catch {
      return false
    }
  }
  return true
}

// ─────────────────────────────────────────────────────────────────────────────

setup('create multi-job test data', async ({ page }) => {
  setup.setTimeout(300_000) // 5 min — creating 4 jobs via UI takes time

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

  const API_BASE = readApiBase()
  const results: TestJobEntry[] = []

  // ── Login as HRM1 and HRM2 ───────────────────────────────────────────────
  const hrm1 = await loginViaApi(
    page,
    API_BASE,
    process.env.TEST_HRMANAGER1_EMAIL!,
    process.env.TEST_HRMANAGER1_PASSWORD!,
  )
  const hrm2 = await loginViaApi(
    page,
    API_BASE,
    process.env.TEST_HRMANAGER2_EMAIL!,
    process.env.TEST_HRMANAGER2_PASSWORD!,
  )

  // ── Idempotency: skip creation if 4 valid PUBLISHED jobs already exist ──────
  if (fs.existsSync(TEST_JOBS_FILE)) {
    try {
      const existing = JSON.parse(fs.readFileSync(TEST_JOBS_FILE, 'utf-8')) as { jobs: TestJobEntry[] }
      if (existing.jobs?.length === 4 && hrm1 && hrm2) {
        const allPublished = await ensureJobsPublished(
          API_BASE,
          page,
          existing.jobs,
          hrm1.accessToken,
          hrm2.accessToken,
        )
        if (allPublished) {
          console.log('test-jobs.json has 4 valid jobs (all published) — skipping creation')
          return
        }
        console.log('Could not verify/publish existing jobs — re-creating')
      }
    } catch {
      // corrupt file — re-create
    }
  }

  // Navigate to a page first so evaluate() + cookies work
  await page.goto('/')

  // ── HRM1: Frontend Developer ─────────────────────────────────────────────
  if (hrm1) {
    const jobId = await createJobViaUI(page, hrm1, {
      title: 'Frontend Developer - React/TypeScript',
      shortDescription:
        'Join our product team as a Frontend Developer building fast, accessible web interfaces with React and TypeScript.',
      fullDescription:
        'Responsibilities:\n' +
        '- Build React/TypeScript web interfaces that are fast and accessible\n' +
        '- Collaborate with designers on pixel-perfect implementations\n' +
        '- Own features from design handoff to production deployment\n' +
        '- Write maintainable, well-tested frontend code\n\n' +
        'Requirements:\n' +
        '- At least 2 years of professional React experience\n' +
        '- Strong TypeScript proficiency\n' +
        '- Experience with state management (Redux or Zustand)\n' +
        '- Familiarity with RESTful API integration\n' +
        '- Good understanding of responsive design and accessibility',
      location: 'Ha Noi, Vietnam',
      educationLevel: "Bachelor's in Computer Science or related field",
      requiredExperience: '2+ years of React/TypeScript experience',
      skills: ['ReactJS', 'Angular', 'NodeJS'],
      salaryMin: 1500,
      salaryMax: 3500,
      quantity: 20,
    }, API_BASE)

    if (jobId) {
      results.push({ jobId, jobTitle: 'Frontend Developer - React/TypeScript', hrmKey: 'hrm1', createdAt: new Date().toISOString() })
      console.log(`HRM1 created Frontend Developer: ${jobId}`)
    }

    // ── HRM1: Data Analyst ─────────────────────────────────────────────────
    const jobId2 = await createJobViaUI(page, hrm1, {
      title: 'Data Analyst / Business Intelligence',
      shortDescription:
        'We are seeking a Data Analyst to turn raw data into actionable insights through dashboards and reports.',
      fullDescription:
        'Responsibilities:\n' +
        '- Design dashboards and run ad-hoc analyses\n' +
        '- Build automated reports and collaborate with product teams\n' +
        '- Drive data-informed decisions across the organisation\n\n' +
        'Requirements:\n' +
        '- Proficient in SQL — complex queries, CTEs, window functions\n' +
        '- Experience with Python or R for data manipulation\n' +
        '- Hands-on Tableau, Power BI, or Metabase experience\n' +
        '- Strong analytical and problem-solving mindset',
      location: 'Ho Chi Minh City, Vietnam',
      educationLevel: "Bachelor's in Statistics, Mathematics, or CS",
      requiredExperience: '0-2 years of data analysis experience',
      skills: ['Python', 'MySQL', 'MongoDB'],
      salaryMin: 1000,
      salaryMax: 2200,
      quantity: 20,
    }, API_BASE)

    if (jobId2) {
      results.push({ jobId: jobId2, jobTitle: 'Data Analyst / Business Intelligence', hrmKey: 'hrm1', createdAt: new Date().toISOString() })
      console.log(`HRM1 created Data Analyst: ${jobId2}`)
    }
  } else {
    console.warn('HRM1 login failed — skipping HRM1 jobs')
  }

  // ── HRM2: Product Manager ────────────────────────────────────────────────
  if (hrm2) {
    const jobId3 = await createJobViaUI(page, hrm2, {
      title: 'Product Manager - Mobile Apps',
      shortDescription:
        'Lead product strategy and execution for our flagship mobile application with ownership of the product roadmap.',
      fullDescription:
        'Responsibilities:\n' +
        '- Own the product roadmap for our mobile application\n' +
        '- Gather user feedback and prioritise features with engineering\n' +
        '- Drive key product metrics from concept through launch\n\n' +
        'Requirements:\n' +
        '- Minimum 3 years of product management experience\n' +
        '- Proven track record shipping mobile products on iOS and Android\n' +
        '- Experience with Agile/Scrum methodologies\n' +
        '- Strong data-driven decision making with SQL and analytics tools',
      location: 'Da Nang, Vietnam',
      educationLevel: "Bachelor's in Business, Computer Science, or related",
      requiredExperience: '3+ years of product management experience',
      skills: ['AWS', 'Docker'],
      salaryMin: 2000,
      salaryMax: 4000,
      quantity: 20,
    }, API_BASE)

    if (jobId3) {
      results.push({ jobId: jobId3, jobTitle: 'Product Manager - Mobile Apps', hrmKey: 'hrm2', createdAt: new Date().toISOString() })
      console.log(`HRM2 created Product Manager: ${jobId3}`)
    }

    // ── HRM2: Mobile Developer ───────────────────────────────────────────────
    const jobId4 = await createJobViaUI(page, hrm2, {
      title: 'Mobile Developer - React Native / Flutter',
      shortDescription:
        'Build exceptional cross-platform mobile experiences in our React Native and Flutter codebases.',
      fullDescription:
        'Responsibilities:\n' +
        '- Architect and develop features in React Native and Flutter codebases\n' +
        '- Optimise performance on both iOS and Android\n' +
        '- Integrate native SDKs and maintain high code quality\n\n' +
        'Requirements:\n' +
        '- 2+ years building production mobile apps with React Native or Flutter\n' +
        '- Strong knowledge of iOS and Android platform guidelines\n' +
        '- Experience integrating third-party SDKs (payments, maps, analytics)\n' +
        '- Familiarity with CI/CD pipelines for mobile',
      location: 'Ho Chi Minh City, Vietnam',
      educationLevel: "Bachelor's in Computer Science or related",
      requiredExperience: '2+ years of mobile development',
      skills: ['ReactJS', 'NodeJS'],
      salaryMin: 1800,
      salaryMax: 3200,
      quantity: 20,
    }, API_BASE)

    if (jobId4) {
      results.push({ jobId: jobId4, jobTitle: 'Mobile Developer - React Native / Flutter', hrmKey: 'hrm2', createdAt: new Date().toISOString() })
      console.log(`HRM2 created Mobile Developer: ${jobId4}`)
    }
  } else {
    console.warn('HRM2 login failed — skipping HRM2 jobs')
  }

  fs.writeFileSync(TEST_JOBS_FILE, JSON.stringify({ jobs: results }, null, 2))
  console.log(`test-jobs.json written with ${results.length} job(s)`)

  if (!results.length) {
    throw new Error('No jobs were created — check HRM login credentials and job form interactions')
  }
})
