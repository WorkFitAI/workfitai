import { test, expect } from '@playwright/test'
import { readApiBase } from './helpers/e2e-target'

async function resolveCompanyId(request: import('@playwright/test').APIRequestContext): Promise<string | null> {
  const res = await request.get(`${readApiBase()}/job/public/jobs?page=0&size=1`)
  if (!res.ok()) return null
  const json = await res.json()
  const firstJob = json?.data?.result?.[0] ?? json?.result?.[0] ?? json?.data?.items?.[0]
  return firstJob?.company?.companyNo ?? firstJob?.companyNo ?? null
}

test('company detail route renders company content for a known company when available', async ({ page, request }) => {
  const companyId = await resolveCompanyId(request)
  if (!companyId) {
    test.skip(true, 'No public company id available from jobs API')
    return
  }

  await page.goto(`/companies/${companyId}`)
  await expect(page.locator('main').or(page.locator('body')).first()).toBeVisible({ timeout: 10_000 })
  await expect(page.getByText(/company|jobs|employees|website/i).first()).toBeVisible({ timeout: 10_000 })
})

test('company detail route handles unknown company id without crashing', async ({ page }) => {
  await page.goto('/companies/e2e-missing-company-id')
  await expect(page.locator('body')).toBeVisible({ timeout: 10_000 })
  await expect(page.getByText(/not found|company/i).first()).toBeVisible({ timeout: 10_000 })
})
