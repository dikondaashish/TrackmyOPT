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

  test('Landing page hydrates when reduced motion is enabled', async ({ page }) => {
    const hydrationErrors: string[] = [];

    page.on('pageerror', (error) => {
      if (/hydration|react error #418/i.test(error.message)) {
        hydrationErrors.push(error.message);
      }
    });
    page.on('console', (message) => {
      if (
        message.type() === 'error' &&
        /hydration|react error #418/i.test(message.text())
      ) {
        hydrationErrors.push(message.text());
      }
    });

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    await expect(page).toHaveTitle(/OPT Tracker/);
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'The Ultimate OPT Tracker & H-1B Finder',
      })
    ).toBeVisible();
    expect(hydrationErrors).toEqual([]);
  });
});

test.describe('Empty States & Board Polish', () => {
    test.fixme('Job Tracker empty state triggers CTA highlight pulse', async ({ page }) => {
        void page;
    });
});
