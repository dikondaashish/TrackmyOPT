import { test as base, expect } from '@playwright/test';
import { createRequire } from 'node:module';
import path from 'node:path';
import react from '@vitejs/plugin-react';

const test = base.extend<object, { onboardingUrl: string }>({
  onboardingUrl: [
    async ({}, provide) => {
      const webRoot = process.cwd();
      const require = createRequire(path.join(webRoot, 'package.json'));
      const vitePath = createRequire(
        require.resolve('vitest/package.json')
      ).resolve('vite');
      const { createServer } = await import(vitePath);
      const server = await createServer({
        configFile: false,
        root: path.join(webRoot, 'e2e/fixtures/onboarding'),
        plugins: [react()],
        resolve: {
          alias: [
            {
              find: /^@sentry\/nextjs$/,
              replacement: path.join(webRoot, 'e2e/fixtures/onboarding/sentry.ts'),
            },
            {
              find: /^next\/link$/,
              replacement: path.join(
                webRoot,
                'e2e/fixtures/onboarding/link.tsx'
              ),
            },
            { find: '@', replacement: webRoot },
          ],
        },
        css: { postcss: webRoot },
        // Immutable fixture: skip the native hot-refresh wrapper.
        server: { host: '127.0.0.1', hmr: false, port: 0, fs: { allow: [webRoot] } },
        logLevel: 'error',
      });
      await server.listen();
      try {
        await provide(server.resolvedUrls.local[0]);
      } finally {
        await server.close();
      }
    },
    { scope: 'worker' },
  ],
});

test('case choice skips education and dates, including keyboard navigation', async ({
  page,
  onboardingUrl,
}) => {
  const profileWrites: string[] = [];
  await page.route('**/api/**', (route) => {
    profileWrites.push(route.request().url());
    return route.fulfill({ json: { ok: true } });
  });
  await page.goto(onboardingUrl);
  const choice = page.getByRole('link', { name: /track my case/i });
  await expect(choice).toBeFocused();
  await choice.press('Enter');
  await expect(page).toHaveURL(/\/dashboard\/case-status$/);
  await expect(
    page.getByRole('heading', { name: 'Know where your case stands' })
  ).toBeVisible();
  await expect(
    page.getByLabel('Enter your USCIS receipt number')
  ).toBeVisible();
  expect(profileWrites).toEqual([]);
});

test('OPT dates choice keeps the existing education path', async ({
  page,
  onboardingUrl,
}) => {
  await page.goto(onboardingUrl);
  await page.getByRole('button', { name: /set up OPT dates/i }).click();
  await expect(
    page.getByRole('heading', { name: 'What did you study?' })
  ).toBeVisible();
});

test('both starting choices fit a narrow mobile screen with reduced motion', async ({
  page,
  onboardingUrl,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(onboardingUrl);
  await expect(
    page.getByRole('link', { name: /track my case/i })
  ).toBeInViewport({ ratio: 1 });
  await expect(
    page.getByRole('button', { name: /set up OPT dates/i })
  ).toBeInViewport({ ratio: 1 });
  await expect(
    page.getByRole('button', { name: /skip onboarding/i })
  ).toBeInViewport({ ratio: 1 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
});
