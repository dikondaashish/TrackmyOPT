import { expect, test } from '@playwright/test';

// These routes appear in historical Safari recursion and React mutation reports.
// This is a regression smoke check, not proof of those events' original cause.
for (const path of [
  '/blog/october-2026-visa-bulletin-fiscal-year-reset',
  '/login',
]) {
  test(`${path} renders without recursion, DOM mutation, or hydration failures`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (
        message.type() === 'error' &&
        /hydration|react error #418|Maximum call stack|removeChild|insertBefore/i.test(
          message.text()
        )
      ) {
        errors.push(message.text());
      }
    });
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    if (path === '/login') {
      const email = page.locator('input[type="email"]').first();
      await expect(email).toBeEnabled();
      await email.fill('synthetic@example.com');
      await expect(email).toHaveValue('synthetic@example.com');
    } else {
      await expect(page.getByRole('heading', { level: 1 })).toContainText(
        'October 2026'
      );
    }
    expect(errors).toEqual([]);
  });
}
