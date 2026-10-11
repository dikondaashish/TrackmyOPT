import { expect, test } from '@playwright/test';
test('monitoring email GET never qualifies engagement; the deliberate click is verified', async ({
  page,
}) => {
  let engagement = 0;
  await page.route('**/api/premium/monitoring-engagement', (route) => {
    engagement++;
    expect(route.request().method()).toBe('POST');
    return route.fulfill({
      status: 409,
      json: { error: 'This offer is no longer eligible' },
    });
  });
  await page.goto('/premium/monitoring?token=synthetic-preview-token');
  await expect(
    page.getByRole('heading', { name: 'Let us handle the daily checks.' })
  ).toBeVisible();
  expect(engagement).toBe(0);
  await page.getByRole('button', { name: 'See my monitoring options' }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: 'This offer link is unavailable' })
  ).toBeVisible();
  expect(engagement).toBe(1);
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
test('short monitoring message fits mobile with no token', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/premium/monitoring');
  await expect(
    page.getByRole('button', { name: 'See my monitoring options' })
  ).toBeDisabled();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
});
