/**
 * Data setup — HRM assigns candidate applications to HR staff.
 *
 * Assignment plan (ensures every HR user has ≥1 assigned application):
 *   HRM1 assigns:
 *     candidate2's application → hrtest1 (HR1)
 *     candidate3's application → hrtest2 (HR2)
 *     candidate5's application → hrtest3 (HR3)
 *   HRM2 assigns:
 *     candidate8's first application → hrtest4 (HR4)
 *     candidate9's application       → hrtest5 (HR5)
 *     candidate10's application      → hrtest6 (HR6)
 *
 * Reads e2e/.data/test-applications.json (written by multi-candidate-apply-data.setup.ts).
 * Idempotent: re-assigning the same HR user is a no-op on the backend.
 */
import { test as setup } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

const DATA_DIR = path.join(__dirname, '../.data')
const TEST_APPLICATIONS_FILE = path.join(DATA_DIR, 'test-applications.json')

interface AppEntry {
  applicationId: string | null
  jobId: string
  jobTitle: string
  candidateEmail: string
  candidateNum: number
  hrmKey: 'hrm1' | 'hrm2'
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

async function loginAndGetToken(
  page: import('@playwright/test').Page,
  apiBase: string,
  email: string,
  password: string,
): Promise<{ accessToken: string; deviceId: string; username: string } | null> {
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
      const { accessToken, username } = json?.data ?? {}
      if (!accessToken) {
        console.warn(`Login response for ${email} did not include an access token (attempt ${attempt}/3)`)
        if (attempt < 3) {
          await page.waitForTimeout(500 * attempt)
          continue
        }
        return null
      }
      return { accessToken, deviceId, username: username ?? email.split('@')[0] }
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

async function assignApplication(
  page: import('@playwright/test').Page,
  apiBase: string,
  applicationId: string,
  hrUsername: string,
  auth: { accessToken: string; deviceId: string },
): Promise<boolean> {
  try {
    const res = await page.request.put(`${apiBase}/application/${applicationId}/assign`, {
      data: { assignedTo: hrUsername },
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.accessToken}`,
        'X-Device-Id': auth.deviceId,
      },
    })
    if (!res.ok()) {
      const body = await res.text().catch(() => '')
      if (
        res.status() === 400 &&
        body.toLowerCase().includes('already assigned') &&
        body.toLowerCase().includes(hrUsername.toLowerCase())
      ) {
        return true
      }
      console.warn(`Assign ${applicationId} → ${hrUsername} failed (${res.status()}): ${body.substring(0, 150)}`)
      return false
    }
    return true
  } catch (err) {
    console.warn(`assignApplication error: ${err}`)
    return false
  }
}

/** Resolve the actual username of an HR user by logging in and reading the response. */
async function resolveUsername(
  page: import('@playwright/test').Page,
  apiBase: string,
  emailEnvKey: string,
  passwordEnvKey: string,
): Promise<string | null> {
  const email = process.env[emailEnvKey]
  const password = process.env[passwordEnvKey]
  if (!email || !password) return null
  const auth = await loginAndGetToken(page, apiBase, email, password)
  if (auth?.username) return auth.username

  const fallbackUsername = email.split('@')[0]
  console.warn(`Using username fallback for ${emailEnvKey}: ${fallbackUsername}`)
  return fallbackUsername
}

setup('assign applications to HR staff', async ({ page }) => {
  setup.setTimeout(120_000)

  if (!fs.existsSync(TEST_APPLICATIONS_FILE)) {
    console.warn('test-applications.json not found — skipping assignment setup')
    return
  }

  const { applications } = JSON.parse(fs.readFileSync(TEST_APPLICATIONS_FILE, 'utf-8')) as {
    applications: AppEntry[]
  }

  if (!applications?.length) {
    console.warn('No applications in test-applications.json — skipping')
    return
  }

  const API_BASE = readApiBase()

  // ── Resolve HR usernames from login responses ────────────────────────────
  const [hr1User, hr2User, hr3User, hr4User, hr5User, hr6User] = await Promise.all([
    resolveUsername(page, API_BASE, 'TEST_HR1_EMAIL', 'TEST_HR1_PASSWORD'),
    resolveUsername(page, API_BASE, 'TEST_HR2_EMAIL', 'TEST_HR2_PASSWORD'),
    resolveUsername(page, API_BASE, 'TEST_HR3_EMAIL', 'TEST_HR3_PASSWORD'),
    resolveUsername(page, API_BASE, 'TEST_HR4_EMAIL', 'TEST_HR4_PASSWORD'),
    resolveUsername(page, API_BASE, 'TEST_HR5_EMAIL', 'TEST_HR5_PASSWORD'),
    resolveUsername(page, API_BASE, 'TEST_HR6_EMAIL', 'TEST_HR6_PASSWORD'),
  ])

  console.log('Resolved HR usernames:', { hr1User, hr2User, hr3User, hr4User, hr5User, hr6User })

  // ── Login as HRM1 and HRM2 to make assignments ───────────────────────────
  const hrm1Auth = await loginAndGetToken(
    page,
    API_BASE,
    process.env.TEST_HRMANAGER1_EMAIL!,
    process.env.TEST_HRMANAGER1_PASSWORD!,
  )
  const hrm2Auth = await loginAndGetToken(
    page,
    API_BASE,
    process.env.TEST_HRMANAGER2_EMAIL!,
    process.env.TEST_HRMANAGER2_PASSWORD!,
  )

  // Assignment plan: candidateNum → hrUsername, using the correct HRM auth
  const assignmentPlan: Array<{
    candidateNum: number
    hrmKey: 'hrm1' | 'hrm2'
    hrUsername: string | null
  }> = [
    { candidateNum: 2, hrmKey: 'hrm1', hrUsername: hr1User },
    { candidateNum: 3, hrmKey: 'hrm1', hrUsername: hr2User },
    { candidateNum: 5, hrmKey: 'hrm1', hrUsername: hr3User },
    { candidateNum: 8, hrmKey: 'hrm2', hrUsername: hr4User },
    { candidateNum: 9, hrmKey: 'hrm2', hrUsername: hr5User },
    { candidateNum: 10, hrmKey: 'hrm2', hrUsername: hr6User },
  ]

  for (const plan of assignmentPlan) {
    if (!plan.hrUsername) {
      console.warn(`No HR username for candidateNum=${plan.candidateNum} plan — skipping`)
      continue
    }

    const auth = plan.hrmKey === 'hrm1' ? hrm1Auth : hrm2Auth
    if (!auth) {
      console.warn(`No auth for ${plan.hrmKey} — skipping assignment`)
      continue
    }

    // Find the first application for this candidate+hrmKey that has a real applicationId
    const app = applications.find(
      (a) => a.candidateNum === plan.candidateNum && a.hrmKey === plan.hrmKey && a.applicationId,
    )
    if (!app?.applicationId) {
      console.warn(`No applicationId for candidate${plan.candidateNum}/${plan.hrmKey} — skipping`)
      continue
    }

    const ok = await assignApplication(page, API_BASE, app.applicationId, plan.hrUsername, auth)
    console.log(
      `Assign candidate${plan.candidateNum} app (${app.applicationId}) → ${plan.hrUsername}: ${ok ? 'OK' : 'FAILED'}`,
    )
  }

  console.log('Assignment setup complete')
})
