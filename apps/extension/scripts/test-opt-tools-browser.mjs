// Isolated Chrome form regression tests. No real accounts or services are used.
import assert from 'node:assert/strict';
import { readFile, mkdir } from 'node:fs/promises';
import { build } from 'esbuild';
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const bundle = await build({
  stdin: { contents: `
    import { renderOptApply } from './pages/opt-apply';
    import { renderStemApply } from './pages/stem-apply';
    import { renderClock } from './pages/clock';
    import { renderStemClock } from './pages/stem-clock';
    import { buildThemeCss } from './design/theme-css';
    window.optTest = { renderOptApply, renderStemApply, renderClock, renderStemClock };
    const style = document.createElement('style'); style.textContent = buildThemeCss(); document.head.prepend(style);`,
    resolveDir: fileURLToPath(new URL('../src', import.meta.url)), loader: 'ts' },
  bundle: true, write: false, format: 'iife', platform: 'browser',
  define: { 'process.env.NODE_ENV': '"test"', 'process.env.EXT_TARGET': '"test"' },
});
const browser = await chromium.launch({ channel: process.env.OPT_TEST_BROWSER || 'chrome', headless: true });
const results = [];
const screenshotDir = process.env.OPT_TEST_SCREENSHOTS;
if (screenshotDir) await mkdir(screenshotDir, { recursive: true });
const logo = 'data:image/gif;base64,' + (await readFile(new URL('../public/icons/logo.gif', import.meta.url))).toString('base64');
try {
  for (const timezoneId of process.env.OPT_TEST_TIMEZONES?.split(',') || ['America/New_York', 'America/Los_Angeles', 'Asia/Kolkata', 'UTC']) {
   for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({ viewport: { width: 360, height: 600 }, timezoneId, colorScheme: theme });
    await context.route('**/*', route => route.abort());
    for (const [render, inputId] of [
      ['renderOptApply', 'program-end-date'], ['renderClock', 'opt-start-date'],
      ['renderStemApply', 'current-opt-end-date'], ['renderStemClock', 'stem-ead-start-date'],
    ]) {
      const page = await context.newPage();
      page.setDefaultTimeout(8000);
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.setContent('<html><body><div id="root"></div></body></html>');
      await page.addStyleTag({ content: await readFile(new URL('../public/popup.css', import.meta.url), 'utf8') });
      await page.evaluate(({ logo, theme, render }) => {
        window.testPosts = [];
        window.testAlerts = [];
        const values = { theme };
        const storage = {
          get: async key => ({ [key]: values[key] }),
          set: async patch => Object.assign(values, patch),
        };
        window.testStorage = values;
        window.testStemDates = null;
        window.chrome = {
          storage: { local: storage, sync: storage },
          runtime: { getURL: () => logo },
        };
        window.alert = message => window.testAlerts.push(message);
        window.fetch = async (_url, options = {}) => {
          if (options.method === 'POST') window.testPosts.push(JSON.parse(options.body));
          if (render === 'renderStemApply' && _url.includes('/calculator')) {
            if (options.method === 'POST') window.testStemDates = { ...window.testStemDates, ...JSON.parse(options.body) };
            return { ok: true, json: async () => ({ ok: true, data: window.testStemDates }) };
          }
          if (_url.includes('/premium/status')) return { ok: true, json: async () => ({ isPremium: theme === 'dark' }) };
          if (theme === 'dark' && _url.includes('/tool-email')) return { ok: true, json: async () => ({ email: 'student@example.com' }) };
          if (theme === 'dark' && _url.includes('/calculator') && options.method === 'GET' && window.testPosts.length) {
            const stem = render === 'renderStemClock';
            return { ok: true, json: async () => ({ ok: true, data: { unemployment_clock: {
              active: true, used: 20, max: stem ? 150 : 90, remaining: stem ? 130 : 70, phase: stem ? 'stem' : 'initial',
            } } }) };
          }
          return { ok: options.method !== 'GET', json: async () => ({ ok: true, data: {} }) };
        };
        document.body.classList.toggle('dark-mode', theme === 'dark');
      }, { logo, theme, render });
      await page.addScriptTag({ content: bundle.outputFiles[0].text });
      const open = () => page.evaluate(render => {
        window.optTest[render](document.getElementById('root'), () => {
          document.getElementById('root').textContent = 'Home';
        });
      }, render);
      await open();
      await page.waitForTimeout(300); // allow the initial saved-theme transition to settle
      const beforeTheme = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      await page.getByRole('button', { name: 'Toggle theme' }).click();
      await page.waitForTimeout(300);
      assert.notEqual(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), beforeTheme, 'manual theme overrides OS preference');
      await page.getByRole('button', { name: 'Toggle theme' }).click();
      await page.waitForTimeout(300);
      const help = page.locator('.tool-help-button').first();
      const tip = page.locator('[role="tooltip"]').first();
      assert.equal(await tip.isVisible(), false);
      await help.hover();
      assert.equal(await tip.isVisible(), true);
      await tip.hover();
      assert.equal(await tip.isVisible(), true, 'help remains open when hovered');
      const bounds = await tip.boundingBox();
      assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= 360 && bounds.y >= 0 && bounds.y + bounds.height <= 600);
      await help.focus();
      await page.keyboard.press('Escape');
      assert.equal(await tip.isVisible(), false);
      await help.click();
      await page.mouse.click(1, 599);
      assert.equal(await tip.isVisible(), false, 'outside click dismisses help');
      await page.locator(`#${inputId}`).focus();
      await help.focus();
      assert.equal(await tip.isVisible(), true, 'keyboard focus opens help');
      await help.click();
      await page.mouse.move(1, 599);
      assert.equal(await tip.isVisible(), true, 'click keeps help open');
      await page.keyboard.press('Escape');
      assert.equal(await tip.isVisible(), false);
      if (screenshotDir && timezoneId === 'America/New_York') await page.screenshot({ path: `${screenshotDir}/${render}-${theme}-form.png`, fullPage: true, animations: 'disabled' });
      const input = page.locator(`#${inputId}`);
      await page.getByRole('button', { name: /^Choose / }).first().click();
      await page.getByRole('button', { name: 'Next month' }).click();
      await page.getByRole('button', { name: 'Previous month' }).click();
      await page.getByRole('button', { name: "Use today's date", exact: true }).click();
      assert.match(await input.inputValue(), /^\d{2}\/\d{2}\/\d{4}$/);
      await input.fill('');
      await input.pressSequentially('02292024');
      assert.equal(await input.inputValue(), '02/29/2024');
      await input.press('End');
      await input.press('Backspace');
      await input.pressSequentially('5');
      assert.equal(await input.inputValue(), '02/29/2025');
      await page.getByRole('button', { name: /Calculate Filing Window|Save & Go/ }).click();
      assert.ok(await input.isVisible()); // impossible calendar date rejected
      assert.equal(await page.evaluate(() => window.testPosts.length), 0);
      await input.fill('09/21/2026');
      if (render === 'renderStemApply') await page.locator('#stem-dso-recommendation-date').fill('06/25/2026');
      await page.getByRole('button', { name: /Calculate Filing Window|Save & Go/ }).click();
      await page.getByRole('button', { name: /Modify/ }).waitFor();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false, 'no horizontal overflow');
      if (theme === 'dark') {
        await page.getByRole('textbox', { name: 'Reminder email' }).waitFor();
        assert.equal(await page.getByRole('textbox', { name: 'Reminder email' }).inputValue(), 'student@example.com');
        await page.getByRole('button', { name: 'Stop reminders' }).waitFor();
        if (render.includes('Clock')) {
          await page.getByText(render === 'renderStemClock' ? '130 days remaining' : '70 days remaining', { exact: true }).waitFor();
          await page.waitForFunction(expected => document.querySelector('.tool-usage-track > div')?.style.width === expected, render === 'renderStemClock' ? '13%' : '22%');
        }
      }
      if (screenshotDir && timezoneId === 'America/New_York') await page.screenshot({ path: `${screenshotDir}/${render}-${theme}-result.png`, fullPage: true, animations: 'disabled' });
      const posts = await page.evaluate(() => window.testPosts);
      const owned = { renderOptApply: ['program_end_date', 'dso_recommendation_date'], renderClock: ['opt_start_date'],
        renderStemApply: ['opt_ead_end_date', 'stem_dso_recommendation_date'], renderStemClock: ['stem_start_date'] }[render];
      assert.ok(posts.length > 0);
      for (const post of posts) assert.deepEqual(Object.keys(post).filter(k => ![...owned, '_lastModifiedField'].includes(k)), []);
      if (render === 'renderStemApply') {
        const date = await page.evaluate(() => {
          const value = new Date(window.testStorage['stem-countdown_data'].results.filingDeadline);
          return [value.getFullYear(), value.getMonth() + 1, value.getDate()];
        });
        assert.deepEqual(date, [2026, 8, 24]);
      }
      await page.getByRole('button', { name: /Modify/ }).click();
      await input.waitFor();
      if (render === 'renderStemApply') {
        const dso = page.locator('#stem-dso-recommendation-date');
        const calculate = page.getByRole('button', { name: 'Calculate Filing Window' });
        await calculate.waitFor();
        await page.waitForFunction(() => !document.querySelector('.tool-button-primary').disabled);
        assert.equal(await dso.inputValue(), '06/25/2026');
        for (const value of ['07/01/2026', '']) {
          const beforePosts = await page.evaluate(() => window.testPosts.length);
          await dso.fill(value);
          await dso.blur();
          await calculate.click();
          await page.getByRole('button', { name: /Modify/ }).waitFor();
          const saved = await page.evaluate(() => ({ posts: window.testPosts, results: window.testStorage['stem-countdown_data'].results }));
          assert.equal(saved.posts.length, beforePosts + 1, 'blur and Calculate produce one save');
          assert.deepEqual(saved.posts.at(-1), { opt_ead_end_date: '09/21/2026', stem_dso_recommendation_date: value || null });
          assert.equal(saved.results.dsoRecommendationDate === null, !value);
          await page.getByRole('button', { name: /Modify/ }).click();
          await page.waitForFunction(() => document.querySelector('.tool-button-primary')?.disabled === false);
          assert.equal(await dso.inputValue(), value, 'Modify loads saved API edit/clear');
          await open();
          await page.waitForFunction(() => document.querySelector('.tool-button-primary')?.disabled === false);
          assert.equal(await dso.inputValue(), value, 'fresh form loads saved API edit/clear');
        }
      }
      if (render === 'renderOptApply') {
        await input.fill('05/15/2026');
        await input.blur();
        await page.locator('#back-btn').click();
        await page.waitForTimeout(400); // exercise the actual 300ms delayed autosave
        assert.equal(await page.locator('#root').textContent(), 'Home');
      }
      assert.deepEqual(errors, []);
      results.push(`${timezoneId} ${theme}: ${render} PASS`);
      await page.close();
    }
    await context.close();
   }
  }
  console.log(results.join('\n'));
  console.log(`${results.length} Chrome tool/timezone flows passed (mocked APIs).`);
} finally {
  await browser.close();
}
