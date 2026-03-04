import { test, expect } from '@playwright/test'

test.describe('Visual regression — Auth pages', () => {
  test('login page matches snapshot', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('login-page.png', { maxDiffPixels: 100 })
  })

  test('register page matches snapshot', async ({ page }) => {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('register-page.png', { maxDiffPixels: 100 })
  })

  test('forgot password page matches snapshot', async ({ page }) => {
    await page.goto('/forgot-password')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('forgot-password-page.png', { maxDiffPixels: 100 })
  })
})
