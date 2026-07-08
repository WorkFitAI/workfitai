/**
 * E2E spec - application status-update permission boundary.
 *
 * Backend facts verify status update requires application:update/admin, not assignment.
 * HR accounts in this environment may have that permission, so the boundary
 * assertion uses a candidate account and asserts non-2xx denial only.
 */
import { test, expect, type APIRequestContext } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import { readApiBase } from './helpers/e2e-target'

const TEST_APPLICATIONS_FILE = path.join(__dirname, '.data/test-applications.json')

interface AuthInfo {
  accessToken: string
  deviceId: string
}

function getApplicationId(): string | null {
  try {
    const { applications } = JSON.parse(fs.readFileSync(TEST_APPLICATIONS_FILE, 'utf-8')) as {
      applications: Array<{ applicationId: string | null; hrmKey: 'hrm1' | 'hrm2' }>
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

test('candidate without status-update authority cannot update application status', async ({ request }) => {
  const apiBase = readApiBase()
  const applicationId = getApplicationId()
  if (!applicationId) {
    test.skip(true, 'No application data available for permission-boundary test')
    return
  }

  const candidateAuth = await login(
    request,
    apiBase,
    process.env.TEST_CANDIDATE1_EMAIL!,
    process.env.TEST_CANDIDATE1_PASSWORD!,
  )
  expect(candidateAuth).toBeTruthy()
  if (!candidateAuth) return

  const res = await request.put(`${apiBase}/application/${applicationId}/status?status=INTERVIEW`, {
    headers: {
      Authorization: `Bearer ${candidateAuth.accessToken}`,
      'X-Device-Id': candidateAuth.deviceId,
    },
  })

  expect(res.ok()).toBeFalsy()
})
