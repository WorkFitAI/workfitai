import { test, expect } from '@playwright/test'

test.describe('Visual regression — Homepage', () => {
  test('hero section matches snapshot', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    // Clip to hero section only to avoid flakiness from dynamic data
    const hero = page.locator('section').first()
    await expect(hero).toHaveScreenshot('hero-section.png', {
      maxDiffPixels: 200,
    })
  })

  test('full homepage above-the-fold matches snapshot', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.setViewportSize({ width: 1280, height: 800 })
    await expect(page).toHaveScreenshot('homepage-above-fold.png', {
      clip: { x: 0, y: 0, width: 1280, height: 800 },
      maxDiffPixels: 300,
    })
  })
})
