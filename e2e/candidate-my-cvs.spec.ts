import { test, expect } from '@playwright/test'
import { injectAuthToken } from './helpers/inject-auth-token'

test.describe('Candidate My CVs', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page, 'candidate1@gmail.com', 'password@123', 'candidate1.json')
  })

  test('my-cvs page renders upload surface and list or empty state', async ({ page }) => {
    await page.goto('/my-cvs')
    await expect(page).toHaveURL(/\/my-cvs/, { timeout: 15_000 })
    await expect(page.getByRole('heading', { name: /my cvs/i }).first()).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('button', { name: /upload cv/i })).toBeVisible({ timeout: 10_000 })

    const hasListHeading = await page.getByRole('heading', { name: /my cvs|application cvs/i }).first().isVisible().catch(() => false)
    const hasEmptyState = await page.getByText(/no cvs uploaded|no self-uploaded cvs/i).first().isVisible().catch(() => false)
    expect(hasListHeading || hasEmptyState).toBeTruthy()
  })

  test('upload dialog rejects non-PDF files client-side', async ({ page }) => {
    await page.goto('/my-cvs')
    await page.getByRole('button', { name: /upload cv/i }).click()
    const dialog = page.getByRole('dialog', { name: /upload cv/i })
    await expect(dialog).toBeVisible({ timeout: 5_000 })

    await dialog.locator('input[type="file"]').setInputFiles({
      name: 'not-a-cv.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('not a pdf'),
    })

    await expect(dialog.getByText(/only pdf files are accepted/i)).toBeVisible({ timeout: 5_000 })
  })
})
