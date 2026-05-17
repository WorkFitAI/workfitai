import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/WorkfitAI/i)
  })

  test('hero section shows headline', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('hero search bar accepts keyword input', async ({ page }) => {
    await page.goto('/')
    const searchInput = page.getByPlaceholder(/keyword/i)
    await searchInput.fill('Developer')
    await expect(searchInput).toHaveValue('Developer')
  })

  test('nav links are visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Jobs List' })).toBeVisible()
  })
})

// Requires unauthenticated state — candidate storageState causes middleware to
// redirect /login → / so the Sign in link is never visited.
test.describe('Homepage unauthenticated', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('Sign in button navigates to login', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /sign in/i }).first().click()
    await expect(page).toHaveURL('/login')
  })
})
