import { test, expect } from '@playwright/test';

test.describe('Authentication & Dashboard Journey', () => {
  test('User can access public landing pages', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/OPT Tracker/);
    
    // Pricing should be public
    await page.goto('/pricing');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Unauthenticated user is bounced from /dashboard to /login', async ({ page }) => {
    await page.goto('/dashboard');
    // Ensure the middleware redirect works
    await expect(page).toHaveURL(/.*\/login/);
  });
});

test.describe('Empty States & Board Polish', () => {
    test.fixme('Job Tracker empty state triggers CTA highlight pulse', async ({ page }) => {
        // Needs test database seed
        // await page.goto('/dashboard/career/job-tracker');
        // await expect(page.locator('text=Add Application')).toHaveClass(/animate-pulse/);
    });
});
