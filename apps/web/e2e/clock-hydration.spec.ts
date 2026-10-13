import { expect, test } from '@playwright/test';

test.use({ timezoneId: 'Pacific/Honolulu' });

for (const path of ['/tools/opt-clock', '/tools/stem-clock']) {
  test(`${path} hydrates with a visitor date different from the server`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (
        message.type() === 'error' &&
        /hydration|react error #418/i.test(message.text())
      ) {
        errors.push(message.text());
      }
    });
    await page.clock.install({ time: new Date('2025-01-02T08:00:00Z') });
    await page.route(
      /\/api\/(opt\/calculator|premium\/status|employment-spans|user\/tool-email)(?:\?|$)/,
      (route) =>
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: '{}',
        })
    );
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    const estimate = page.getByRole('region', {
      name: 'Unemployment estimate',
    });
    await expect(estimate).toContainText('Through Jan 1, 2025');
    await expect(
      page.getByLabel('OPT Start Date', { exact: true })
    ).toBeEnabled();
    expect(errors).toEqual([]);
  });
}
