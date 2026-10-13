import { expect, test } from '@playwright/test';

test('blog cover loads its static original when the image optimizer fails', async ({
  page,
}) => {
  test.setTimeout(60_000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/_next/image?**', (route) =>
    route.fulfill({ status: 503, body: 'Synthetic image optimizer failure' })
  );
  await page.goto('/blog/opt-receipt-number-not-working', {
    waitUntil: 'domcontentloaded',
  });
  const cover = page.getByRole('img', {
    name: 'Illustration of a student checking an OPT receipt document with a magnifying glass.',
    exact: true,
  });
  await expect(cover).toHaveAttribute(
    'src',
    /\/blog\/opt-receipt-number-not-working\.webp$/
  );
  await expect
    .poll(() =>
      cover.evaluate(
        (image: HTMLImageElement) => image.complete && image.naturalWidth > 0
      )
    )
    .toBe(true);
  expect(errors).toEqual([]);
});

test('static policy route uses the same court update and dates as the article record', async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.goto('/blog/september-2026-f1-fixed-admission-rule-opt', {
    waitUntil: 'domcontentloaded',
  });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'F-1 Duration of Status Rule Paused: What OPT Students Should Do Now'
  );
  const schemas = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  const article = schemas
    .map((value) => JSON.parse(value))
    .find((value) => value['@type'] === 'BlogPosting');
  expect(article).toMatchObject({
    datePublished: '2026-09-15',
    dateModified: '2026-10-11',
  });
});

test('I-140 guide has consistent metadata and a generic case-tracking action', async ({
  page,
}) => {
  await page.goto('/blog/i-140-case-status-tracking', {
    waitUntil: 'domcontentloaded',
  });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'How to Track Your I-140 Case: Status Messages, Delays and Alerts'
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://www.trackmyopt.com/blog/i-140-case-status-tracking'
  );
  await expect(
    page.getByRole('link', { name: 'Save my case', exact: true })
  ).toHaveAttribute('href', '/dashboard/case-status');
  const schemas = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  expect(
    schemas.some((value) => JSON.parse(value)['@type'] === 'BlogPosting')
  ).toBe(true);
});

test('mobile reduced-motion reader can play and pause the explainer without horizontal overflow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/blog/moving-while-opt-pending-ead-delivery', {
    waitUntil: 'domcontentloaded',
  });
  const play = page.getByRole('button', {
    name: 'Play animation',
    exact: true,
  });
  await play.scrollIntoViewIfNeeded();
  await expect(play).toHaveAttribute('aria-pressed', 'false');
  const figure = page.locator('figure').filter({
    hasText: 'Separate records need separate updates.',
  });
  await expect(figure.locator('img')).toHaveAttribute(
    'src',
    /\/blog\/flows\/address-change\.png$/
  );
  // A server-rendered button is visible before React attaches its handler.
  // Retry the real interaction until it produces the requested playing state.
  await expect
    .poll(
      async () => {
        if (await play.isVisible()) await play.click();
        return figure.getByRole('button').getAttribute('aria-pressed');
      },
      { timeout: 15_000 }
    )
    .toBe('true');
  await expect(figure.locator('img')).toHaveAttribute(
    'src',
    /\/blog\/flows\/address-change\.gif$/
  );
  await page.getByRole('button', { name: 'Pause animation' }).click();
  await expect(figure.locator('img')).toHaveAttribute(
    'src',
    /\/blog\/flows\/address-change\.png$/
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
});
