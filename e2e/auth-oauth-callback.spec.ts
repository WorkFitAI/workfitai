import { test, expect } from '@playwright/test'

test.use({ storageState: { cookies: [], origins: [] } })

test.describe('OAuth callback edge paths', () => {
  test('callback without session shows sign-in recovery UI', async ({ page }) => {
    await page.goto('/oauth/callback')
    await expect(page.getByText('Authentication Failed', { exact: true })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/missing session id/i)).toBeVisible()
    await expect(page.getByRole('link', { name: /back to sign in/i })).toHaveAttribute('href', '/login')
  })

  test('callback with invalid session fails closed', async ({ page }) => {
    await page.goto('/oauth/callback?session=e2e-invalid-session')
    await expect(page.getByText('Authentication Failed', { exact: true })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('Authentication failed. Please try again.')).toBeVisible()
    await expect(page.getByRole('link', { name: /back to sign in/i })).toHaveAttribute('href', '/login')
  })
})
