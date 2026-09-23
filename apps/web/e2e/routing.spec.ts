import { test, expect } from '@playwright/test';

test.describe('Authentication & Dashboard Journey', () => {
  test('User can access public landing pages', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/TrackMyOPT/);

    // Pricing should be public
    await page.goto('/pricing', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Unauthenticated user is bounced from /dashboard to /login', async ({
    page,
  }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    // Ensure the middleware redirect works
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('Landing page hydrates when reduced motion is enabled', async ({
    page,
  }) => {
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
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveTitle(/TrackMyOPT/);
    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Never miss an OPT deadline',
      })
    ).toBeVisible();
    expect(hydrationErrors).toEqual([]);
  });
});
