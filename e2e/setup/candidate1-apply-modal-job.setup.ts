/**
 * Data setup - creates a dedicated published job for apply-modal tests.
 *
 * This job is intentionally not consumed by candidate1-apply-data.setup.ts.
 * It gives candidate1 a stable "not yet applied" job while test-job.json
 * remains available for already-applied assertions.
 */
import { test as setup, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import { E2E_BASE_URL, readApiBase } from '../helpers/e2e-target'

const DATA_DIR = path.join(__dirname, '../.data')
const APPLY_MODAL_JOB_FILE = path.join(DATA_DIR, 'apply-modal-job.json')
const FIXTURE_FILE = path.join(__dirname, '../fixtures/single-job-definition.json')

interface LoginResult {
  accessToken: string
  deviceId: string
  expiryInMs: number
}

interface JobFormData {
  title: string
  shortDescription: string
  description: string
  responsibilities: string
  requirements: string
  benefits: string
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

async function loginViaApi(
  page: import('@playwright/test').Page,
  apiBase: string,
  email: string,
  password: string,
  fallbackDeviceId: string,
): Promise<LoginResult | null> {
  const deviceId = fallbackDeviceId
  const res = await page.request.post(`${apiBase}/auth/login`, {
    data: { usernameOrEmail: email, password },
    headers: { 'Content-Type': 'application/json', 'X-Device-Id': deviceId },
  })
  if (!res.ok()) return null

  const json = await res.json()
  const { accessToken, expiryInMs } = json?.data ?? {}
  return accessToken ? { accessToken, deviceId, expiryInMs: expiryInMs ?? 900_000 } : null
}

function readDeviceId(authFile: string, fallbackDeviceId: string): string {
  try {
    const storageState = JSON.parse(fs.readFileSync(authFile, 'utf-8'))
    const found = storageState.origins
      ?.find((o: { origin: string }) => o.origin === E2E_BASE_URL)
      ?.localStorage?.find((item: { name: string }) => item.name === 'wfa_device_id')?.value
    return found ?? fallbackDeviceId
  } catch {
    return fallbackDeviceId
  }
}

async function candidateHasApplied(
  page: import('@playwright/test').Page,
  apiBase: string,
  jobId: string,
  auth: LoginResult,
): Promise<boolean> {
  const checkRes = await page.request.get(`${apiBase}/application/check?jobId=${jobId}`, {
    headers: {
      Authorization: `Bearer ${auth.accessToken}`,
      'X-Device-Id': auth.deviceId,
    },
  })
  if (!checkRes.ok()) return false
  const checkJson = await checkRes.json()
  return checkJson?.data?.applied === true
}

async function ensurePublished(
  page: import('@playwright/test').Page,
  apiBase: string,
  jobId: string,
  auth: LoginResult,
): Promise<boolean> {
  const headers = {
    Authorization: `Bearer ${auth.accessToken}`,
    'X-Device-Id': auth.deviceId,
  }
  const jobRes = await page.request.get(`${apiBase}/job/hr/jobs/${jobId}`, { headers })
  if (!jobRes.ok()) return false

  const jobJson = await jobRes.json()
  if (jobJson?.data?.status === 'PUBLISHED') return true

  const publishRes = await page.request.put(`${apiBase}/job/hr/jobs/${jobId}/PUBLISHED`, {
    headers: { ...headers, 'Content-Type': 'application/json' },
  })
  return publishRes.ok()
}

// Ensure fixture skills exist on this environment — job-form.tsx fetches the
// skill list once when the dialog mounts and only accepts names present in
// that list, silently dropping unmatched ones (backend then rejects the job
// with "Job must have at least one skill").
async function ensureSkillsExist(
  page: import('@playwright/test').Page,
  apiBase: string,
  auth: LoginResult,
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

async function createJobViaUi(
  page: import('@playwright/test').Page,
  jobData: JobFormData,
  auth: LoginResult,
  apiBase: string,
): Promise<string> {
  const expiresAt = String(Date.now() + auth.expiryInMs)
  await page.addInitScript(
    ({ token, expiry, deviceId }: { token: string; expiry: string; deviceId: string }) => {
      localStorage.setItem('wfa_access_token', token)
      localStorage.setItem('wfa_token_expiry', expiry)
      localStorage.setItem('wfa_device_id', deviceId)
    },
    { token: auth.accessToken, expiry: expiresAt, deviceId: auth.deviceId },
  )

  await page.goto('/job-posts')
  await expect(page).toHaveURL(/job-posts/, { timeout: 15_000 })
  await ensureSkillsExist(page, apiBase, auth, jobData.skills)

  const createBtn = page.getByRole('button', { name: /create new job/i })
  await expect(createBtn).toBeVisible({ timeout: 20_000 })
  await createBtn.click()

  const dialog = page.getByRole('dialog', { name: /add new job/i })
  await expect(dialog).toBeVisible({ timeout: 8_000 })

  await page.getByLabel('Job Title').fill(`${jobData.title} - Apply Modal`)
  await page.getByPlaceholder('Brief overview for job listing...').fill(jobData.shortDescription)
  await dialog.locator("label:has-text('Full Description') ~ textarea").fill(jobData.description)
  await dialog.locator("label:has-text('Responsibilities') ~ textarea").fill(jobData.responsibilities)
  await dialog.locator("label:has-text('Other Requirements') ~ textarea").fill(jobData.requirements)
  await dialog.locator("label:has-text('Benefits') ~ textarea").fill(jobData.benefits)
  await page.getByPlaceholder('e.g. Bachelor in CS').fill(jobData.educationLevel)
  await page.getByPlaceholder('e.g. 3-5 years').fill(jobData.requiredExperience)

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

  const skillInput = page.getByPlaceholder('Type skill and press Enter...')
  for (const skillName of jobData.skills.slice(0, 3)) {
    await skillInput.fill(skillName)
    await page.waitForTimeout(700)
    const suggestion = dialog.locator('.absolute.z-50 .cursor-pointer').filter({ hasText: skillName }).first()
    if (await suggestion.isVisible({ timeout: 2_500 }).catch(() => false)) {
      await suggestion.click()
    } else {
      await skillInput.press('Enter')
    }
    await page.waitForTimeout(300)
  }

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

  await page.locator('input[type="number"]').nth(0).fill(String(jobData.salaryMin))
  await page.locator('input[type="number"]').nth(1).fill(String(jobData.salaryMax))
  await page.locator('input[type="number"]').nth(2).fill(String(jobData.quantity)).catch(() => {})

  const calTrigger = page.getByRole('button').filter({ hasText: /\d+\/\d+\/\d+/ }).first()
  if (await calTrigger.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await calTrigger.click()
    const nextMonthBtn = page.getByRole('button', { name: 'Go to the Next Month' })
    if (await nextMonthBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await nextMonthBtn.click()
      const day20Btn = page.locator('[role="grid"] button').filter({ hasText: /^20$/ }).first()
      if (await day20Btn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await day20Btn.click({ timeout: 3_000 })
      }
    }
    await page.keyboard.press('Escape')
  }

  const capturedResponses: import('@playwright/test').Response[] = []
  const responseListener = (res: import('@playwright/test').Response) => {
    if (res.url().includes('/job/hr/jobs') && res.request().method() === 'POST') {
      capturedResponses.push(res)
    }
  }
  page.on('response', responseListener)

  await page.getByRole('button', { name: /save job post/i }).click()
  await expect(dialog).not.toBeVisible({ timeout: 8_000 })
  await page.waitForTimeout(10_000)
  page.off('response', responseListener)

  const jobCreationResponse = capturedResponses.find((r) => r.ok()) ?? capturedResponses[0]
  if (!jobCreationResponse?.ok()) {
    const body = (await jobCreationResponse?.text().catch(() => '')) ?? ''
    throw new Error(`Apply-modal job creation failed: ${jobCreationResponse?.status()} ${body.substring(0, 200)}`)
  }

  const json = await jobCreationResponse.json()
  const jobId =
    json?.result?.postId ??
    json?.data?.postId ??
    json?.postId ??
    json?.result?.id ??
    json?.data?.id ??
    json?.id

  if (!jobId) throw new Error('Apply-modal job was created but no id was returned')
  return jobId
}

setup('create reserved apply-modal job', async ({ page }) => {
  setup.setTimeout(120_000)

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

  const apiBase = readApiBase()
  const hrmDeviceId = readDeviceId(
    path.join(__dirname, '../.auth/hrmanager1.json'),
    'playwright-e2e-hrm1',
  )
  const candidateDeviceId = readDeviceId(
    path.join(__dirname, '../.auth/candidate1.json'),
    `playwright-e2e-${process.env.TEST_CANDIDATE1_EMAIL?.split('@')[0] ?? 'candidate1'}`,
  )

  const hrmAuth = await loginViaApi(
    page,
    apiBase,
    process.env.TEST_HRMANAGER1_EMAIL!,
    process.env.TEST_HRMANAGER1_PASSWORD!,
    hrmDeviceId,
  )
  const candidateAuth = await loginViaApi(
    page,
    apiBase,
    process.env.TEST_CANDIDATE1_EMAIL!,
    process.env.TEST_CANDIDATE1_PASSWORD!,
    candidateDeviceId,
  )

  if (!hrmAuth || !candidateAuth) {
    throw new Error('Could not authenticate HRM1 and candidate1 for apply-modal setup')
  }

  if (fs.existsSync(APPLY_MODAL_JOB_FILE)) {
    const existing = JSON.parse(fs.readFileSync(APPLY_MODAL_JOB_FILE, 'utf-8')) as {
      jobId?: string
      jobTitle?: string
    }
    if (
      existing.jobId &&
      (await ensurePublished(page, apiBase, existing.jobId, hrmAuth)) &&
      !(await candidateHasApplied(page, apiBase, existing.jobId, candidateAuth))
    ) {
      console.log(`Reserved apply-modal job is valid: ${existing.jobId}`)
      return
    }
  }

  const jobDef = JSON.parse(fs.readFileSync(FIXTURE_FILE, 'utf-8')) as JobFormData
  const jobId = await createJobViaUi(page, jobDef, hrmAuth, apiBase)

  const published = await ensurePublished(page, apiBase, jobId, hrmAuth)
  if (!published) throw new Error(`Reserved apply-modal job was created but not published: ${jobId}`)

  if (await candidateHasApplied(page, apiBase, jobId, candidateAuth)) {
    throw new Error(`Reserved apply-modal job is already applied by candidate1: ${jobId}`)
  }

  const jobTitle = `${jobDef.title} - Apply Modal`
  fs.writeFileSync(
    APPLY_MODAL_JOB_FILE,
    JSON.stringify({ jobId, jobTitle, createdAt: new Date().toISOString() }, null, 2),
  )
  console.log(`Reserved apply-modal job created and published: ${jobId}`)
})
