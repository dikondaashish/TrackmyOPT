import { devices, expect, test, type Page } from '@playwright/test';

/**
 * Network-level verification of the region-aware privacy manager.
 * Region comes from the same `x-vercel-ip-country` header Vercel sets in
 * production. Tracker endpoints are stubbed so nothing leaves the machine;
 * the assertions are about which requests the page *attempts*.
 */

const TRACKERS = {
  googleAnalytics: /googletagmanager\.com|google-analytics\.com/,
  adsense: /googlesyndication\.com|doubleclick\.net|adtrafficquality\.google/,
  posthog: /\/ingest\/|posthog\.com/,
  vercel: /va\.vercel-scripts\.com|\/_vercel\/(insights|speed-insights)\//,
} as const;
type Tracker = keyof typeof TRACKERS;

const BLOG_WITH_AD = '/blog/opt-processing-time-2026';
// The dev server compiles routes on first hit; allow for a cold start.
const POLL = { timeout: 20_000 };

test.describe.configure({ timeout: 90_000 });

function watchTrackers(page: Page) {
  const seen: Record<Tracker, string[]> = {
    googleAnalytics: [],
    adsense: [],
    posthog: [],
    vercel: [],
  };
  page.on('request', (request) => {
    for (const [name, pattern] of Object.entries(TRACKERS) as [Tracker, RegExp][]) {
      if (pattern.test(request.url())) seen[name].push(request.url());
    }
  });
  return seen;
}

async function stubTrackers(page: Page) {
  for (const pattern of Object.values(TRACKERS)) {
    await page.route(pattern, (route) =>
      route.fulfill({
        status: 200,
        contentType: /\.js|gtag|adsbygoogle/.test(route.request().url())
          ? 'application/javascript'
          : 'application/json',
        body: /\.js|gtag|adsbygoogle/.test(route.request().url()) ? '' : '{}',
      })
    );
  }
}

async function setCountry(page: Page, country: string) {
  await page.setExtraHTTPHeaders({ 'x-vercel-ip-country': country });
}

const bannerOf = (page: Page) =>
  page.getByRole('region', { name: 'Privacy choices', exact: true });

async function trackerCookies(page: Page) {
  const cookies = await page.context().cookies();
  return cookies
    .map(({ name }) => name)
    .filter((name) => /^(_ga|_gid|ph_|__gads|__gpi|__eoi)/.test(name));
}

test.describe('privacy consent (EU / UK)', () => {
  test('EU visitor: no analytics or ad requests before consent', async ({ page }) => {
    await stubTrackers(page);
    await setCountry(page, 'DE');
    const seen = watchTrackers(page);
    await page.goto(BLOG_WITH_AD, { waitUntil: 'domcontentloaded' });
    await expect(bannerOf(page)).toBeVisible();
    await expect(bannerOf(page).getByRole('button', { name: 'Reject non-essential' })).toBeVisible();
    await page.waitForTimeout(1_000);

    expect(seen).toEqual({ googleAnalytics: [], adsense: [], posthog: [], vercel: [] });
    expect(await trackerCookies(page)).toEqual([]);
    const region = (await page.context().cookies()).find((c) => c.name === 'tmo_privacy_region');
    expect(region?.value).toBe('EU_EEA');
    expect(region?.httpOnly).toBe(false);
  });

  test('EU accept all: analytics, Vercel, PostHog, and AdSense start afterwards', async ({ page }) => {
    await stubTrackers(page);
    await setCountry(page, 'FR');
    const seen = watchTrackers(page);
    await page.goto(BLOG_WITH_AD, { waitUntil: 'domcontentloaded' });
    await bannerOf(page).getByRole('button', { name: 'Accept all' }).click();
    await expect(bannerOf(page)).toBeHidden();

    await expect.poll(() => seen.googleAnalytics.length, POLL).toBeGreaterThan(0);
    await expect.poll(() => seen.posthog.length, POLL).toBeGreaterThan(0);
    await expect.poll(() => seen.vercel.length, POLL).toBeGreaterThan(0);
    await expect.poll(() => seen.adsense.length, POLL).toBeGreaterThan(0);
  });

  test('EU reject: stays blocked across reloads and the banner does not return', async ({ page }) => {
    await stubTrackers(page);
    await setCountry(page, 'IE');
    const seen = watchTrackers(page);
    await page.goto(BLOG_WITH_AD, { waitUntil: 'domcontentloaded' });
    await bannerOf(page).getByRole('button', { name: 'Reject non-essential' }).click();
    await expect(bannerOf(page)).toBeHidden();

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('button', { name: 'Open privacy choices' })).toBeVisible();
    await expect(bannerOf(page)).toHaveCount(0);
    expect(seen).toEqual({ googleAnalytics: [], adsense: [], posthog: [], vercel: [] });
  });

  test('UK customize: analytics only, never ads; later revocation stops PostHog', async ({ page }) => {
    await stubTrackers(page);
    await setCountry(page, 'GB');
    const seen = watchTrackers(page);
    await page.goto(BLOG_WITH_AD, { waitUntil: 'domcontentloaded' });
    await bannerOf(page).getByRole('button', { name: 'Customize' }).click();
    const dialog = page.getByRole('dialog', { name: 'Your Privacy Choices' });
    await expect(dialog.getByRole('switch', { name: 'Essential' })).toBeDisabled();
    await dialog.getByRole('switch', { name: 'Analytics' }).click();
    await dialog.getByRole('button', { name: 'Save choices' }).click();
    await expect(dialog).toBeHidden();

    await expect.poll(() => seen.googleAnalytics.length, POLL).toBeGreaterThan(0);
    await expect.poll(() => seen.posthog.length, POLL).toBeGreaterThan(0);
    await page.waitForTimeout(1_000);
    expect(seen.adsense).toEqual([]);

    // Revoke analytics from the persistent control.
    await page.getByRole('button', { name: 'Open privacy choices' }).click();
    await dialog.getByRole('switch', { name: 'Analytics' }).click();
    await dialog.getByRole('button', { name: 'Save choices' }).click();
    await page.waitForTimeout(500);
    const posthogBefore = seen.posthog.length;
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2_000);
    expect(seen.posthog.length).toBe(posthogBefore);
    expect(await trackerCookies(page)).not.toContain('_ga');
  });

  test('keyboard: Escape closes settings and the banner remains usable', async ({ page }) => {
    await stubTrackers(page);
    await setCountry(page, 'NL');
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const customize = bannerOf(page).getByRole('button', { name: 'Customize' });
    await customize.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog', { name: 'Your Privacy Choices' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(customize).toBeFocused();
  });
});

test.describe('privacy consent (U.S.)', () => {
  test('US visitor: no banner, measurement runs, privacy choices reachable', async ({ page }) => {
    await stubTrackers(page);
    await setCountry(page, 'US');
    const seen = watchTrackers(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect.poll(() => seen.googleAnalytics.length, POLL).toBeGreaterThan(0);
    await page.waitForTimeout(1_000);
    await expect(bannerOf(page)).toHaveCount(0);

    await page.getByRole('button', { name: 'Your Privacy Choices' }).first().click();
    await expect(page.getByRole('dialog', { name: 'Your Privacy Choices' })).toBeVisible();
  });

  test('US visitor with Global Privacy Control: ads never load', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(Navigator.prototype, 'globalPrivacyControl', {
        configurable: true,
        get: () => true,
      });
    });
    await stubTrackers(page);
    await setCountry(page, 'US');
    const seen = watchTrackers(page);
    await page.goto(BLOG_WITH_AD, { waitUntil: 'domcontentloaded' });
    await expect.poll(() => seen.googleAnalytics.length, POLL).toBeGreaterThan(0);
    await page.waitForTimeout(1_500);
    expect(seen.adsense).toEqual([]);
  });

  test('US visitor without GPC: ads load on articles', async ({ page }) => {
    await stubTrackers(page);
    await setCountry(page, 'US');
    const seen = watchTrackers(page);
    await page.goto(BLOG_WITH_AD, { waitUntil: 'domcontentloaded' });
    await expect.poll(() => seen.adsense.length, POLL).toBeGreaterThan(0);
  });
});

test.describe('privacy consent (fallbacks and essentials)', () => {
  test('unknown location is treated as opt-in', async ({ page }) => {
    await stubTrackers(page);
    const seen = watchTrackers(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(bannerOf(page)).toBeVisible();
    expect(seen.googleAnalytics).toEqual([]);
    expect(seen.posthog).toEqual([]);
  });

  test('development region override simulates a jurisdiction', async ({ page }) => {
    await stubTrackers(page);
    await setCountry(page, 'US');
    await page.goto('/?privacy_region=EU_EEA', { waitUntil: 'domcontentloaded' });
    await expect(bannerOf(page)).toBeVisible();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(bannerOf(page)).toBeVisible();
  });

  test('rejecting optional cookies does not affect protected-route auth', async ({ page }) => {
    await stubTrackers(page);
    await setCountry(page, 'DE');
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await bannerOf(page).getByRole('button', { name: 'Reject non-essential' }).click();
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login\?returnTo=%2Fdashboard/);
    const email = page.locator('input[type="email"]').first();
    await expect(email).toBeEnabled();
  });
});

// Device descriptors carry a browser type, which describe-level use() rejects.
const { defaultBrowserType: _browser, ...pixel7 } = devices['Pixel 7'];

test.describe('privacy consent (mobile)', () => {
  test.use(pixel7);

  test('banner choices are reachable and large enough to tap', async ({ page }) => {
    await stubTrackers(page);
    await setCountry(page, 'ES');
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    for (const name of ['Accept all', 'Reject non-essential', 'Customize']) {
      const button = bannerOf(page).getByRole('button', { name });
      await expect(button).toBeInViewport();
      const box = await button.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    }
  });
});
