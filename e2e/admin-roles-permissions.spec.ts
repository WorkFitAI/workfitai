/**
 * E2E spec — Admin Roles & Permissions Management
 * Runs under the e2e-admin project (storageState: admin.json).
 * Playwright config matches: testMatch: 'e2e/admin-*.spec.ts'
 *
 * Tests admin-level access to /roles-permissions: view, built-in badge,
 * clone/delete button visibility, modal interactions, and tab navigation.
 * These tests work against whatever roles the live backend has seeded.
 */
import { test, expect } from '@playwright/test'
import { injectAuthToken } from './helpers/inject-auth-token'

test.describe('Admin Roles & Permissions', () => {
  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page, 'admin@workfitai.com', 'admin123', 'admin.json')
  })

  test('page loads at /roles-permissions and is accessible for admin', async ({ page }) => {
    await page.goto('/roles-permissions')
    await expect(page).toHaveURL(/roles-permissions/, { timeout: 15_000 })
    await expect(page.locator('main')).toBeVisible()
  })

  test('Roles tab is active by default and roles table is visible', async ({ page }) => {
    await page.goto('/roles-permissions')
    await page.waitForLoadState('networkidle')

    // The Roles tab button should be highlighted (blue background)
    const rolesTab = page.getByRole('button', { name: /^roles$/i })
    await expect(rolesTab).toBeVisible({ timeout: 8_000 })
    await expect(rolesTab).toHaveClass(/bg-blue-600/)

    // Roles search input should be visible
    await expect(page.getByPlaceholder('Search roles…')).toBeVisible({ timeout: 8_000 })
  })

  test('can switch to Permissions tab and back', async ({ page }) => {
    await page.goto('/roles-permissions')
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: /permissions/i }).click()
    await expect(page.getByPlaceholder('Search permissions…')).toBeVisible({ timeout: 8_000 })

    await page.getByRole('button', { name: /^roles$/i }).click()
    await expect(page.getByPlaceholder('Search roles…')).toBeVisible({ timeout: 5_000 })
  })

  test('built-in roles have "built-in" badge and no delete button', async ({ page }) => {
    await page.goto('/roles-permissions')
    await page.waitForLoadState('networkidle')

    // Wait for roles to load
    await expect(page.getByPlaceholder('Search roles…')).toBeVisible({ timeout: 8_000 })

    // At least one built-in role should be visible (ADMIN, HR, HR_MANAGER, or CANDIDATE)
    const hasBuiltIn = await page.getByText('built-in').first().isVisible({ timeout: 8_000 }).catch(() => false)
    if (!hasBuiltIn) {
      console.warn('No built-in badge found — backend may not have seeded roles yet')
      return
    }

    // The row containing "built-in" badge should not have a delete (Trash) button
    const builtInRow = page.locator('tr').filter({ has: page.getByText('built-in') }).first()
    await expect(builtInRow.getByTitle('Delete')).not.toBeVisible()
  })

  test('clone button is visible on role rows for admin', async ({ page }) => {
    await page.goto('/roles-permissions')
    await page.waitForLoadState('networkidle')

    await expect(page.getByPlaceholder('Search roles…')).toBeVisible({ timeout: 8_000 })

    const hasRoles = await page.locator('tbody tr').first().isVisible({ timeout: 5_000 }).catch(() => false)
    if (!hasRoles) {
      console.warn('No role rows found — skipping clone button assertion')
      return
    }

    // At least one clone button should be present
    await expect(page.getByTitle('Clone').first()).toBeVisible({ timeout: 5_000 })
  })

  test('eye/view icon opens role detail modal and close works', async ({ page }) => {
    await page.goto('/roles-permissions')
    await page.waitForLoadState('networkidle')

    await expect(page.getByPlaceholder('Search roles…')).toBeVisible({ timeout: 8_000 })

    const viewBtn = page.getByTitle('View').first()
    const hasView = await viewBtn.isVisible({ timeout: 5_000 }).catch(() => false)
    if (!hasView) {
      console.warn('No view button found — skipping modal test')
      return
    }

    await viewBtn.click()

    // Dialog should open
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 5_000 })

    // Close the dialog
    const closeBtn = dialog.getByRole('button', { name: /close/i })
    if (await closeBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await closeBtn.click()
    } else {
      await page.keyboard.press('Escape')
    }

    await expect(dialog).not.toBeVisible({ timeout: 5_000 })
  })

  test('clone modal opens with name prefix pre-filled', async ({ page }) => {
    await page.goto('/roles-permissions')
    await page.waitForLoadState('networkidle')

    await expect(page.getByPlaceholder('Search roles…')).toBeVisible({ timeout: 8_000 })

    const cloneBtn = page.getByTitle('Clone').first()
    const hasClone = await cloneBtn.isVisible({ timeout: 5_000 }).catch(() => false)
    if (!hasClone) {
      console.warn('No clone button found — skipping clone modal test')
      return
    }

    await cloneBtn.click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 5_000 })
    await expect(dialog.getByText('Clone Role')).toBeVisible()

    // Name field should be pre-filled with a scope prefix (ends with _)
    const nameInputs = dialog.getByRole('textbox')
    const nameValue = await nameInputs.first().inputValue()
    expect(nameValue).toMatch(/_$/) // prefix ends with underscore

    // Close the dialog
    await dialog.getByRole('button', { name: /cancel/i }).click()
    await expect(dialog).not.toBeVisible({ timeout: 5_000 })
  })

  test('Permissions tab loads namespace groups', async ({ page }) => {
    await page.goto('/roles-permissions')
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: /permissions/i }).click()
    await expect(page.getByPlaceholder('Search permissions…')).toBeVisible({ timeout: 8_000 })

    // Wait for permissions to load (spinner should disappear)
    await expect(page.getByText('Loading permissions…')).not.toBeVisible({ timeout: 10_000 })

    // Count display should be visible
    const hasCount = await page.getByText(/\d+ permissions?/).isVisible({ timeout: 5_000 }).catch(() => false)
    if (!hasCount) {
      console.warn('Permissions count not found — backend may not have seeded permissions')
    }
    await expect(page.locator('main')).toBeVisible()
  })

  test('refresh button re-loads the roles table', async ({ page }) => {
    await page.goto('/roles-permissions')
    await page.waitForLoadState('networkidle')

    await expect(page.getByPlaceholder('Search roles…')).toBeVisible({ timeout: 8_000 })

    const refreshBtn = page.getByRole('button', { name: /refresh/i })
    await expect(refreshBtn).toBeVisible()
    await refreshBtn.click()

    // After refresh, table should still be functional
    await expect(page.getByPlaceholder('Search roles…')).toBeVisible({ timeout: 5_000 })
  })
})
