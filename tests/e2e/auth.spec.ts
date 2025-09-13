import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should display sign in page', async ({ page }) => {
    await page.goto('/auth/signin')
    
    await expect(page.locator('h1')).toContainText('Business Intelligence Dashboard')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toContainText('Sign In')
  })

  test('should show demo credentials', async ({ page }) => {
    await page.goto('/auth/signin')
    
    await expect(page.locator('text=Demo Credentials')).toBeVisible()
    await expect(page.locator('text=admin@example.com')).toBeVisible()
    await expect(page.locator('text=demo@example.com')).toBeVisible()
  })

  test('should redirect unauthenticated users to sign in', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Should redirect to sign in page
    await expect(page).toHaveURL('/auth/signin')
  })
})