import { expect, test, type Locator } from '@playwright/test';

async function translateLabel(locator: Locator, original: string, translated: string) {
  await locator.evaluate((element, labels) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (node.textContent === labels.original) {
        const font = document.createElement('font');
        font.textContent = labels.translated;
        node.parentNode!.replaceChild(font, node);
        return;
      }
    }
    throw new Error('Translation fixture did not find its label');
  }, { original, translated });
}

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
    // The banner appears only after mount; dismissing it proves client hydration finished.
    const privacyChoices = page.getByRole('region', {
      name: 'Privacy choices',
      exact: true,
    });
    await privacyChoices
      .getByRole('button', { name: 'Essential Only', exact: true })
      .click();
    await expect(privacyChoices).toBeHidden();
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

test('translated landing controls update without DOM mutation failures', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const privacyChoices = page.getByRole('region', { name: 'Privacy choices', exact: true });
  await privacyChoices.getByRole('button', { name: 'Essential Only', exact: true }).click();
  await expect(privacyChoices).toBeHidden();

  // The resume mockup is shown only at the desktop breakpoint.
  if ((page.viewportSize()?.width ?? 0) >= 1024) {
    await page.getByRole('button', { name: /AI Resume/ }).click();
    // Locate the stable toolbar, since translation changes the accessible name.
    const enhance = page.getByRole('heading', { name: 'Resume Editor', exact: true })
      .locator('..').getByRole('button');
    await translateLabel(enhance, 'Enhance with AI', 'Mejorar con IA');
    await enhance.click();
    await expect(enhance).toHaveText('Enhancing...');
    await expect(enhance).toHaveText('AI Enhanced');
    await expect(enhance).toBeDisabled();
    await page.getByRole('button', { name: /Timeline/ }).click();
    await expect(enhance).toHaveCount(0);
  }

  const sound = page.getByLabel('TrackMyOPT Chrome extension video preview', { exact: true })
    .getByRole('button').nth(1);
  await translateLabel(sound, 'Unmute', 'Activar sonido');
  await sound.click();
  await expect(sound).toHaveText('Mute');
  await sound.click();
  await expect(sound).toHaveText('Unmute');
  expect(errors).toEqual([]);
});
