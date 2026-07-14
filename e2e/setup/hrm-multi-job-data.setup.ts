/**
 * Data setup — creates published jobs via browser UI automation.
 * Job definitions are loaded from e2e/fixtures/multi-job-definitions.json.
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
import { buildAuthSessionCookie, readApiBase } from '../helpers/e2e-target'

const DATA_DIR = path.join(__dirname, '../.data')
const TEST_JOBS_FILE = path.join(DATA_DIR, 'test-jobs.json')
const FIXTURES_FILE = path.join(__dirname, '../fixtures/multi-job-definitions.json')

export interface TestJobEntry {
  jobId: string
  jobTitle: string
  hrmKey: 'hrm1' | 'hrm2'
  createdAt: string
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
  await page.context().addCookies([buildAuthSessionCookie(session)])

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
  description: string
  responsibilities: string
  requirements: string
  benefits: string
  employmentType: string
  experienceLevel: string
  currency: string
  location: string
  educationLevel: string
  requiredExperience: string
  skills: string[]
  salaryMin: number
  salaryMax: number
  quantity: number
  categoryName: string
}

// Ensure fixture skills exist on this environment — job-form.tsx fetches the
// skill list once when the dialog mounts and only accepts names present in
// that list, silently dropping unmatched ones (backend then rejects the job
// with "Job must have at least one skill").
async function ensureSkillsExist(
  page: import('@playwright/test').Page,
  auth: LoginResult,
  apiBase: string,
  skillNames: string[],
): Promise<void> {
  try {
    const existingSkillsRes = await page.request.get(`${apiBase}/job/public/skills`)
    const existingNames = new Set<string>()
    if (existingSkillsRes.ok()) {
      const json = await existingSkillsRes.json()
      const list: Array<{ name: string }> = json?.data?.result ?? json?.result ?? []
      list.forEach((s) => existingNames.add(s.name))
    }
    for (const name of skillNames) {
      if (existingNames.has(name)) continue
      await page.request
        .post(`${apiBase}/job/public/skills`, {
          data: { name },
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.accessToken}`,
            'X-Device-Id': auth.deviceId,
          },
        })
        .catch(() => {/* best-effort — form falls back to a free-text tag if this fails */})
      existingNames.add(name)
    }
  } catch {
    // best-effort — form falls back to a free-text tag if this fails
  }
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
  await ensureSkillsExist(page, auth, apiBase, jobData.skills)

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
  await dialog
    .locator("label:has-text('Full Description') ~ textarea")
    .fill(jobData.description)
  await dialog.locator("label:has-text('Responsibilities') ~ textarea").fill(jobData.responsibilities)
  await dialog.locator("label:has-text('Other Requirements') ~ textarea").fill(jobData.requirements)
  await dialog.locator("label:has-text('Benefits') ~ textarea").fill(jobData.benefits)
  await page.getByPlaceholder('e.g. Bachelor in CS').fill(jobData.educationLevel)
  await page.getByPlaceholder('e.g. 3-5 years').fill(jobData.requiredExperience)

  // ── Select currency ─────────────────────────────────────────────────────
  const currencyTrigger = dialog.locator('button[role="combobox"]').filter({ hasText: /^USD$/ }).first()
  if (await currencyTrigger.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await currencyTrigger.click()
    const currencyOption = page.getByRole('option', { name: jobData.currency, exact: true })
    if (await currencyOption.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await currencyOption.click()
    }
    await page.waitForTimeout(300)
  }

  await page.getByPlaceholder('City, Country').fill(jobData.location)

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

  // Select job category
  const categoryTrigger = dialog.locator('button[role="combobox"]').filter({ hasText: /select category/i }).first()
  if (await categoryTrigger.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await categoryTrigger.click()
    const categoryOption = page.getByRole('option', { name: jobData.categoryName }).first()
    if (await categoryOption.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await categoryOption.click()
    } else {
      // Category doesn't exist on this environment yet — create it inline via the
      // same "Create <name>" affordance real HR users use (job-category-select.tsx).
      await page.getByPlaceholder('Search category...').fill(jobData.categoryName)
      const createOption = page.getByText(`Create "${jobData.categoryName}"`, { exact: true })
      if (await createOption.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await createOption.click()
      }
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
  setup.setTimeout(4_500_000) // ~75s per job via UI × 10 jobs

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

  // Load fixture first — expected job count drives idempotency check
  const { jobs: jobDefs } = JSON.parse(fs.readFileSync(FIXTURES_FILE, 'utf-8')) as {
    jobs: Array<JobFormData & { hrmKey: 'hrm1' | 'hrm2' }>
  }

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

  // ── Idempotency: skip creation if all fixture jobs already exist as PUBLISHED ──
  if (fs.existsSync(TEST_JOBS_FILE)) {
    try {
      const existing = JSON.parse(fs.readFileSync(TEST_JOBS_FILE, 'utf-8')) as { jobs: TestJobEntry[] }
      if (existing.jobs?.length === jobDefs.length && hrm1 && hrm2) {
        const allPublished = await ensureJobsPublished(
          API_BASE,
          page,
          existing.jobs,
          hrm1.accessToken,
          hrm2.accessToken,
        )
        if (allPublished) {
          console.log(`test-jobs.json has ${jobDefs.length} valid jobs (all published) — skipping creation`)
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

  for (const jobDef of jobDefs) {
    const auth = jobDef.hrmKey === 'hrm1' ? hrm1 : hrm2
    if (!auth) {
      console.warn(`${jobDef.hrmKey} login failed — skipping "${jobDef.title}"`)
      continue
    }
    const jobId = await createJobViaUI(page, auth, jobDef, API_BASE)
    if (jobId) {
      results.push({ jobId, jobTitle: jobDef.title, hrmKey: jobDef.hrmKey, createdAt: new Date().toISOString() })
      console.log(`${jobDef.hrmKey} created "${jobDef.title}": ${jobId}`)
    }
  }

  fs.writeFileSync(TEST_JOBS_FILE, JSON.stringify({ jobs: results }, null, 2))
  console.log(`test-jobs.json written with ${results.length} job(s)`)

  if (!results.length) {
    throw new Error('No jobs were created — check HRM login credentials and job form interactions')
  }
})
