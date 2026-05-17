import { test, expect } from '@playwright/test'

// Run all route-protection tests with no pre-loaded auth state.
// Tests that need auth add cookies manually via addCookies().
test.use({ storageState: { cookies: [], origins: [] } })

test.describe('Route protection', () => {
  test('unauthenticated user is redirected from /dashboard to /login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('unauthenticated user is redirected from /job-posts to /login', async ({ page }) => {
    await page.goto('/job-posts')
    await expect(page).toHaveURL(/\/login/)
  })

  test('candidate role accessing /dashboard is redirected to /', async ({ page }) => {
    // Set candidate session cookie
    await page.context().addCookies([
      {
        name: 'auth_session',
        value: encodeURIComponent(JSON.stringify({
          username: 'candidate',
          roles: ['ROLE_USER'],
          expiresAt: Date.now() + 3_600_000,
        })),
        domain: 'localhost',
        path: '/',
      },
    ])
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/')
  })

  test('admin role can access /dashboard', async ({ page }) => {
    await page.context().addCookies([
      {
        name: 'auth_session',
        value: encodeURIComponent(JSON.stringify({
          username: 'admin',
          roles: ['ROLE_ADMIN'],
          expiresAt: Date.now() + 3_600_000,
        })),
        domain: 'localhost',
        path: '/',
      },
    ])
    await page.goto('/dashboard')
    // Should NOT redirect to login
    await expect(page).not.toHaveURL(/\/login/)
  })

  test('authenticated user is redirected from /login to /', async ({ page }) => {
    await page.context().addCookies([
      {
        name: 'auth_session',
        value: encodeURIComponent(JSON.stringify({
          username: 'user',
          roles: ['ROLE_USER'],
          expiresAt: Date.now() + 3_600_000,
        })),
        domain: 'localhost',
        path: '/',
      },
    ])
    await page.goto('/login')
    await expect(page).toHaveURL('/')
  })
})
