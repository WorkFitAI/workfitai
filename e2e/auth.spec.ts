import { test, expect } from '@playwright/test'

test.describe('Auth flows', () => {
  test('login page renders form fields', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByLabel(/email|username/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('login shows validation error for empty form submission', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: /sign in/i }).click()
    // Zod validation — required error should appear
    await expect(page.getByText(/required/i).first()).toBeVisible()
  })

  test('login shows error for wrong credentials', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email|username/i).fill('wrong@example.com')
    await page.getByLabel(/password/i).fill('WrongPass123')
    await page.getByRole('button', { name: /sign in/i }).click()
    // API error toast or inline error
    await expect(page.getByRole('alert').or(page.getByText(/invalid|unauthorized|failed/i)).first()).toBeVisible({ timeout: 5000 })
  })

  test('register page renders correctly', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByRole('heading', { name: /register|sign up|create/i })).toBeVisible()
  })

  test('forgot password page renders email input', async ({ page }) => {
    await page.goto('/forgot-password')
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /reset|send/i })).toBeVisible()
  })
})
