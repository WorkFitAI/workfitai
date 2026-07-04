/**
 * E2E spec - application status lifecycle.
 *
 * Grounded in plans/260703-0656-e2e-coverage-backend-alignment/research/backend-contract-facts.md.
 * Uses the same status endpoint as lib/application/application-service.ts.
 */
import { test, expect, type APIRequestContext } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import { readApiBase } from './helpers/e2e-target'

const DATA_DIR = path.join(__dirname, '.data')
const TEST_APPLICATION_FILE = path.join(DATA_DIR, 'test-application.json')
const TEST_APPLICATIONS_FILE = path.join(DATA_DIR, 'test-applications.json')

interface TestApplicationEntry {
  applicationId: string | null
  candidateNum: number
  hrmKey: 'hrm1' | 'hrm2'
}

interface AuthInfo {
  accessToken: string
  deviceId: string
}

function getLifecycleApplicationId(): string | null {
  try {
    const app = JSON.parse(fs.readFileSync(TEST_APPLICATION_FILE, 'utf-8')) as { applicationId?: string | null }
    if (app.applicationId) return app.applicationId
  } catch {
    // fall back to multi-candidate data
  }

  try {
    const { applications } = JSON.parse(fs.readFileSync(TEST_APPLICATIONS_FILE, 'utf-8')) as {
      applications: TestApplicationEntry[]
    }
    return applications.find((app) => app.hrmKey === 'hrm1' && app.applicationId)?.applicationId ?? null
  } catch {
    return null
  }
}

async function login(
  request: APIRequestContext,
  apiBase: string,
  email: string,
  password: string,
): Promise<AuthInfo | null> {
  const deviceId = `playwright-e2e-${email.split('@')[0]}`
  const res = await request.post(`${apiBase}/auth/login`, {
    data: { usernameOrEmail: email, password },
    headers: { 'Content-Type': 'application/json', 'X-Device-Id': deviceId },
  })
  if (!res.ok()) return null
  const json = await res.json()
  const accessToken = json?.data?.accessToken
  return accessToken ? { accessToken, deviceId } : null
}

async function updateStatus(
  request: APIRequestContext,
  apiBase: string,
  applicationId: string,
  status: string,
  auth: AuthInfo,
) {
  return request.put(`${apiBase}/application/${applicationId}/status?status=${status}`, {
    headers: {
      Authorization: `Bearer ${auth.accessToken}`,
      'X-Device-Id': auth.deviceId,
    },
  })
}

async function expectResponseText(res: { text: () => Promise<string> }, pattern: RegExp) {
  await expect(res.text()).resolves.toMatch(pattern)
}

test.describe.configure({ mode: 'serial' })

test.describe('Application status lifecycle', () => {
  test('HRM can progress an application and backend blocks invalid/same/terminal transitions', async ({ request }) => {
    const apiBase = readApiBase()
    const applicationId = getLifecycleApplicationId()
    if (!applicationId) {
      test.skip(true, 'No lifecycle application data available')
      return
    }

    const hrmAuth = await login(
      request,
      apiBase,
      process.env.TEST_HRMANAGER1_EMAIL!,
      process.env.TEST_HRMANAGER1_PASSWORD!,
    )
    expect(hrmAuth).toBeTruthy()
    if (!hrmAuth) return

    const reviewing = await updateStatus(request, apiBase, applicationId, 'REVIEWING', hrmAuth)
    expect([200, 400]).toContain(reviewing.status())
    if (reviewing.status() === 400) {
      await expectResponseText(reviewing, /Status is already REVIEWING|Invalid status transition/i)
    }

    const sameStatus = await updateStatus(request, apiBase, applicationId, 'REVIEWING', hrmAuth)
    expect(sameStatus.status()).toBe(400)
    await expectResponseText(sameStatus, /Status is already REVIEWING/)

    const illegalSkip = await updateStatus(request, apiBase, applicationId, 'OFFER', hrmAuth)
    expect(illegalSkip.status()).toBe(400)
    await expectResponseText(illegalSkip, /Invalid status transition from REVIEWING to OFFER/)

    const interview = await updateStatus(request, apiBase, applicationId, 'INTERVIEW', hrmAuth)
    expect(interview.ok()).toBeTruthy()

    const offer = await updateStatus(request, apiBase, applicationId, 'OFFER', hrmAuth)
    expect(offer.ok()).toBeTruthy()

    const hired = await updateStatus(request, apiBase, applicationId, 'HIRED', hrmAuth)
    expect(hired.ok()).toBeTruthy()

    const terminal = await updateStatus(request, apiBase, applicationId, 'REJECTED', hrmAuth)
    expect(terminal.status()).toBe(400)
    await expectResponseText(terminal, /Cannot change status from terminal state HIRED/)
  })
})
