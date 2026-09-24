import { test as base, expect, type Page } from '@playwright/test';
import { createRequire } from 'node:module';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import type { VaultDocument } from '../lib/documents/vault-utils';

// Reuse Vitest's installed Vite runtime; no production route or auth bypass.
const test = base.extend<object, { vaultUrl: string }>({
  vaultUrl: [async ({}, provide) => {
    const webRoot = process.cwd();
    const require = createRequire(path.join(webRoot, 'package.json'));
    const vitePath = createRequire(require.resolve('vitest/package.json')).resolve('vite');
    const { createServer } = await import(vitePath);
    const server = await createServer({
      configFile: false,
      root: path.join(webRoot, 'e2e/fixtures/vault'),
      plugins: [react()],
      resolve: { alias: { '@': webRoot } },
      css: { postcss: webRoot },
      server: { host: '127.0.0.1', port: 0, fs: { allow: [webRoot] } },
      logLevel: 'error',
    });
    await server.listen();
    try { await provide(server.resolvedUrls.local[0]); } finally { await server.close(); }
  }, { scope: 'worker' }],
});

const image = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWV8AAAAASUVORK5CYII=', 'base64');
// A complete, synthetic one-page PDF, including its cross-reference table.
const pdfObjects = [
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 200] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
];
const pdfText = 'BT /F1 14 Tf 24 140 Td (Synthetic vault test document) Tj ET';
pdfObjects.push(`<< /Length ${Buffer.byteLength(pdfText)} >>\nstream\n${pdfText}\nendstream`);
let pdfSource = '%PDF-1.4\n';
const pdfOffsets = [0];
for (const [index, object] of pdfObjects.entries()) {
  pdfOffsets.push(Buffer.byteLength(pdfSource));
  pdfSource += `${index + 1} 0 obj\n${object}\nendobj\n`;
}
const xrefOffset = Buffer.byteLength(pdfSource);
pdfSource += `xref\n0 ${pdfOffsets.length}\n0000000000 65535 f \n`;
pdfSource += pdfOffsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');
pdfSource += `trailer\n<< /Size ${pdfOffsets.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
const pdf = Buffer.from(pdfSource);
const fixtures: VaultDocument[] = [
  { id: 'sample-image', filename: 'Sample passport.png', documentType: 'passport', category: 'passport', issueDate: null, expiryDate: '2032-01-26', summary: 'Synthetic travel document used only for automated testing.', extractedFields: { issuing_country: 'Example', long_field: 'A'.repeat(120) }, aiConfidence: 98, uploadedAt: '2026-09-01T12:00:00Z', fileType: 'image/png' },
  { id: 'sample-pdf', filename: 'Sample letter.pdf', documentType: 'offer_letter', category: 'offer_letter', issueDate: null, expiryDate: null, summary: 'Synthetic letter for preview and download tests.', extractedFields: {}, aiConfidence: 80, uploadedAt: '2026-08-01T12:00:00Z', fileType: 'application/pdf' },
];

async function mockVault(page: Page) {
  const state = { docs: structuredClone(fixtures), hasPasscode: true, autoLockTimeout: 0, previewFails: false, downloadFails: false, deleteFails: false, saveFails: false, emailFails: false, uploadFails: false, listFails: false, deleteCalls: 0, downloadCalls: 0, emailCalls: 0, uploadCalls: 0 };
  await page.route('**/api/**', async route => {
    const url = new URL(route.request().url());
    const method = route.request().method();
    const respond = (json: unknown, status = 200) => route.fulfill({ json, status });
    if (url.pathname === '/api/premium/status') return respond({ isPremium: true });
    if (url.pathname === '/api/documents/passcode/status') return respond({ hasPasscode: state.hasPasscode, autoLockTimeout: state.autoLockTimeout });
    if (url.pathname === '/api/documents/passcode/setup') { state.hasPasscode = true; return respond({ success: true }); }
    if (url.pathname === '/api/documents/passcode/verify') return respond({ success: true });
    if (url.pathname === '/api/user/notification-email') {
      if (method === 'POST') { state.emailCalls++; return state.emailFails ? respond({ error: 'Email could not be saved.' }, 500) : respond({ success: true, email: route.request().postDataJSON().email }); }
      return respond({ email: 'student@example.com' });
    }
    if (url.pathname === '/api/documents') return state.listFails ? respond({ error: 'Unavailable' }, 500) : respond({ documents: state.docs });
    if (url.pathname === '/api/documents/upload') {
      state.uploadCalls++;
      if (state.uploadFails) return respond({ error: 'Document scanning is temporarily unavailable.' }, 503);
      const document = { ...fixtures[1], id: 'uploaded', filename: 'Uploaded.pdf' };
      state.docs.push(document);
      return respond({ success: true, document, needsManualExpiry: true });
    }
    const id = url.pathname.split('/')[3];
    const doc = state.docs.find(item => item.id === id);
    if (!doc) return respond({ error: 'Document not found' }, 404);
    if (url.pathname.endsWith('/download')) {
      state.downloadCalls++;
      if (state.downloadFails) return respond({ error: 'Storage temporarily unavailable.' }, 502);
      return route.fulfill({ body: doc.fileType === 'application/pdf' ? pdf : image, contentType: doc.fileType });
    }
    if (method === 'DELETE') {
      state.deleteCalls++;
      if (state.deleteFails) return respond({ error: 'Storage deletion failed. Please retry.' }, 502);
      state.docs = state.docs.filter(item => item.id !== id);
      return respond({ success: true });
    }
    if (method === 'PATCH') {
      if (state.saveFails) return respond({ error: 'Could not update document.' }, 500);
      Object.assign(doc, route.request().postDataJSON());
      return respond({ success: true, document: doc });
    }
    if (state.previewFails) return respond({ error: 'Preview temporarily unavailable.' }, 503);
    return respond({ document: { ...doc, viewUrl: `/test-file/${id}` } });
  });
  await page.route('**/test-file/**', route => route.fulfill({ body: route.request().url().endsWith('sample-image') ? image : pdf, contentType: route.request().url().endsWith('sample-image') ? 'image/png' : 'application/pdf' }));
  return state;
}

async function unlock(page: Page, url: string) {
  await page.goto(url);
  await page.locator('input[inputmode="numeric"]').fill('123456');
  await page.getByRole('button', { name: 'Unlock', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Document Vault', exact: true })).toBeVisible();
}

test('preview, expiry focus, metadata edits, cancel, and downloadable originals', async ({ page, vaultUrl }) => {
  const state = await mockVault(page);
  await unlock(page, vaultUrl);
  await page.getByRole('article', { name: 'Sample passport.png' }).getByRole('button', { name: 'View Document' }).click();
  const viewer = page.getByRole('dialog', { name: 'View Sample passport.png' });
  await expect(viewer.locator('img')).toBeVisible();
  await expect.poll(() => viewer.locator('img').evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
  await viewer.getByRole('button', { name: 'Edit Expiry', exact: true }).click();
  const expiry = viewer.getByLabel('Edit Expiry Date');
  await expect(expiry).toBeFocused();
  await expect(expiry).toBeInViewport();
  await expiry.fill('2033-02-03');
  await viewer.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(viewer.getByText('February 3, 2033')).toBeVisible();
  await viewer.getByRole('button', { name: 'Edit document type' }).click();
  await viewer.getByLabel('Edit Document Type').selectOption('custom');
  await viewer.getByLabel('Custom document type').fill('Travel record');
  await viewer.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(viewer.getByRole('heading', { name: 'Travel Record' })).toBeVisible();
  expect(state.docs[0].expiryDate).toBe('2033-02-03');
  expect(state.docs[0].category).toBe('travel_record');
  const download = page.waitForEvent('download');
  await viewer.getByRole('button', { name: 'Download', exact: true }).click();
  expect((await download).suggestedFilename()).toBe('Sample passport.png');
  await page.keyboard.press('Escape');
  await expect(viewer).not.toBeVisible();
  const letter = page.getByRole('article', { name: 'Sample letter.pdf' });
  await letter.getByRole('button', { name: 'View Document' }).click();
  await expect(page.getByRole('dialog').locator('iframe')).toHaveAttribute('src', '/test-file/sample-pdf');
  const pdfDownload = page.waitForEvent('download', download => download.suggestedFilename() === 'Sample letter.pdf');
  await page.getByRole('dialog').getByRole('button', { name: 'Download', exact: true }).click();
  expect((await pdfDownload).suggestedFilename()).toBe('Sample letter.pdf');
});

test('preview and download errors recover, including downloading when preview fails', async ({ page, vaultUrl }) => {
  const state = await mockVault(page);
  state.previewFails = true;
  state.downloadFails = true;
  await unlock(page, vaultUrl);
  await page.getByRole('article').first().getByRole('button', { name: 'View Document' }).click();
  const viewer = page.getByRole('dialog');
  await expect(viewer.getByRole('button', { name: 'Retry preview' })).toBeVisible();
  await viewer.getByRole('button', { name: 'Download', exact: true }).click();
  await expect(viewer.getByText('Storage temporarily unavailable.')).toBeVisible();
  state.downloadFails = false;
  const download = page.waitForEvent('download');
  await viewer.getByRole('button', { name: 'Download', exact: true }).click();
  await download;
  state.previewFails = false;
  await viewer.getByRole('button', { name: 'Retry preview' }).click();
  await expect(viewer.locator('img')).toBeVisible();
  expect(state.downloadCalls).toBe(2);
});

test('deletion requires confirmation, preserves records on error, and closes the viewer on success', async ({ page, vaultUrl }) => {
  const state = await mockVault(page);
  await unlock(page, vaultUrl);
  await page.getByRole('article').first().getByRole('button', { name: 'Delete document' }).click();
  const confirmation = page.getByRole('dialog', { name: 'Delete document?' });
  await expect(confirmation).toContainText('Sample passport.png');
  await expect(confirmation.getByRole('button', { name: 'Cancel' })).toBeFocused();
  await confirmation.getByRole('button', { name: 'Cancel' }).click();
  expect(state.deleteCalls).toBe(0);
  await page.getByRole('article').first().getByRole('button', { name: 'View Document' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete', exact: true }).click();
  state.deleteFails = true;
  await confirmation.getByRole('button', { name: 'Delete permanently' }).click();
  await expect(confirmation.getByRole('alert')).toContainText('Storage deletion failed');
  expect(state.docs).toHaveLength(2);
  state.deleteFails = false;
  await confirmation.getByRole('button', { name: 'Delete permanently' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('article')).toHaveCount(1);
  expect(state.docs).toHaveLength(1);
});

test('upload validation, retry, and Escape on completion refresh the document list', async ({ page, vaultUrl }) => {
  const state = await mockVault(page);
  await unlock(page, vaultUrl);
  await page.getByRole('button', { name: 'Upload', exact: true }).click();
  const upload = page.getByRole('dialog', { name: 'Upload document' });
  await upload.getByLabel('Document file').setInputFiles({ name: 'empty.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(0) });
  await expect(upload.getByRole('alert')).toContainText('empty');
  await upload.getByLabel('Document file').setInputFiles({ name: 'Uploaded.pdf', mimeType: 'application/pdf', buffer: pdf });
  state.uploadFails = true;
  await upload.getByRole('button', { name: 'Upload & Analyze' }).click();
  await expect(upload.getByRole('alert')).toContainText('scanning');
  await upload.getByRole('button', { name: 'Try Again' }).click();
  state.uploadFails = false;
  await upload.getByRole('button', { name: 'Upload & Analyze' }).click();
  await expect(upload.getByText('Upload Complete!')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('article', { name: 'Uploaded.pdf' })).toBeVisible();
  expect(state.uploadCalls).toBe(2);
});

test('reminder validation, failure, retry and cancel preserve the saved email', async ({ page, vaultUrl }) => {
  const state = await mockVault(page);
  await unlock(page, vaultUrl);
  const reminders = page.getByRole('region', { name: 'Expiry reminders' });
  await reminders.getByRole('button', { name: 'Edit' }).click();
  await reminders.getByLabel('Reminder email address').fill('invalid');
  await reminders.getByRole('button', { name: 'Save', exact: true }).click();
  expect(state.emailCalls).toBe(0);
  await reminders.getByLabel('Reminder email address').fill('updated@example.com');
  state.emailFails = true;
  await reminders.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(reminders.getByRole('alert')).toContainText('could not be saved');
  await expect(reminders.getByLabel('Reminder email address')).toHaveValue('updated@example.com');
  state.emailFails = false;
  await reminders.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(reminders.getByRole('status')).toContainText('saved');
  await reminders.getByRole('button', { name: 'Edit' }).click();
  await reminders.getByLabel('Reminder email address').fill('');
  await reminders.getByRole('button', { name: 'Cancel' }).click();
  await expect(reminders.getByText('updated@example.com')).toBeVisible();
});

test('list errors retry successfully and card downloads prevent duplicate clicks', async ({ page, vaultUrl }) => {
  const state = await mockVault(page);
  state.listFails = true;
  await unlock(page, vaultUrl);
  await expect(page.getByRole('alert')).toContainText('Could not load your documents');
  state.listFails = false;
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(page.getByRole('article')).toHaveCount(2);
  let finish!: () => void;
  const pending = new Promise<void>(resolve => { finish = resolve; });
  let calls = 0;
  await page.route('**/api/documents/sample-image/download', async route => {
    calls++;
    await pending;
    await route.fulfill({ body: image, contentType: 'image/png' });
  });
  const card = page.getByRole('article', { name: 'Sample passport.png' });
  const download = page.waitForEvent('download');
  await card.getByRole('button', { name: 'Download document', exact: true }).click();
  await expect(card.getByRole('button', { name: 'Downloading document' })).toBeDisabled();
  finish();
  expect((await download).suggestedFilename()).toBe('Sample passport.png');
  expect(calls).toBe(1);
});

test('failed expiry changes retain the draft and clearing expiry survives reopening', async ({ page, vaultUrl }) => {
  const state = await mockVault(page);
  await unlock(page, vaultUrl);
  const card = page.getByRole('article', { name: 'Sample passport.png' });
  await card.getByRole('button', { name: 'View Document' }).click();
  const viewer = page.getByRole('dialog');
  await viewer.getByRole('button', { name: 'Edit Expiry', exact: true }).click();
  state.saveFails = true;
  await viewer.getByLabel('Edit Expiry Date').fill('2034-01-01');
  await viewer.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(viewer.getByRole('alert')).toContainText('Could not update');
  await expect(viewer.getByLabel('Edit Expiry Date')).toHaveValue('2034-01-01');
  state.saveFails = false;
  await viewer.getByLabel('Edit Expiry Date').fill('');
  await viewer.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(viewer.getByText('No expiry date set')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(card.getByRole('button', { name: 'No expiry date Add Expiry' })).toBeVisible();
  await card.getByRole('button', { name: 'No expiry date Add Expiry' }).click();
  await expect(viewer.getByLabel('Edit Expiry Date')).toBeFocused();
  await expect(viewer.getByLabel('Edit Expiry Date')).toHaveValue('');
});

test('passcode setup is keyboard accessible and inactivity locks the vault', async ({ page, vaultUrl }) => {
  await page.clock.install();
  const state = await mockVault(page);
  state.hasPasscode = false;
  state.autoLockTimeout = 5;
  await page.goto(vaultUrl);
  const setup = page.getByRole('dialog', { name: 'Secure Your Document Vault' });
  await expect(setup).toBeVisible();
  await setup.getByLabel('Enter Passcode', { exact: true }).fill('123456');
  await setup.getByLabel('Confirm Passcode', { exact: true }).fill('654321');
  await setup.getByRole('button', { name: 'Set Passcode' }).click();
  await expect(setup.getByRole('alert')).toContainText('do not match');
  await setup.getByLabel('Confirm Passcode', { exact: true }).fill('123456');
  await setup.getByRole('button', { name: 'Set Passcode' }).click();
  const lock = page.getByRole('dialog', { name: 'Unlock Document Vault' });
  await expect(lock.getByLabel('Vault passcode')).toBeFocused();
  await lock.getByLabel('Vault passcode').fill('123456');
  await lock.getByRole('button', { name: 'Unlock', exact: true }).click();
  await expect(page.getByRole('article')).toHaveCount(2);
  await page.clock.fastForward(330_000);
  await expect(lock).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(0);
});

test('long filenames and email editing fit a narrow screen in dark mode', async ({ page, vaultUrl }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 740 });
  const state = await mockVault(page);
  state.docs[0].filename = `${'Long document filename '.repeat(8)}.png`;
  await unlock(page, vaultUrl);
  await page.locator('html').evaluate(el => el.classList.add('dark'));
  const reminders = page.getByRole('region', { name: 'Expiry reminders' });
  await reminders.getByRole('button', { name: 'Edit' }).click();
  await reminders.getByLabel('Reminder email address').fill('a-long-email-address-for-layout-tests@example.com');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('vault-dark-320.png'), fullPage: true });
  await page.getByRole('article').first().getByRole('button', { name: 'View Document' }).click();
  await expect(page.getByRole('dialog').locator('img')).toBeVisible();
  expect(await page.getByRole('dialog').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
});

for (const width of [390, 768, 1280]) {
  test(`filters, empty results, and layout at ${width}px`, async ({ page, vaultUrl }, testInfo) => {
    await page.setViewportSize({ width, height: 850 });
    await mockVault(page);
    await unlock(page, vaultUrl);
    await expect(page.getByRole('article')).toHaveCount(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`vault-${width}.png`), fullPage: true });
    await page.getByLabel('Search documents').fill('not-a-document');
    await expect(page.getByRole('heading', { name: 'No matching documents' })).toBeVisible();
    await page.getByRole('button', { name: 'Clear filters', exact: true }).first().click();
    await expect(page.getByRole('article')).toHaveCount(2);
    await page.getByLabel('Sort documents').selectOption('oldest');
    await expect(page.getByRole('article').first()).toHaveAttribute('aria-label', 'Sample letter.pdf');
    await page.getByRole('button', { name: 'Passport', exact: true }).click();
    await expect(page.getByRole('article')).toHaveCount(1);
    await page.getByRole('article').getByRole('button', { name: 'View Document' }).click();
    await expect(page.getByRole('dialog').locator('img')).toBeVisible();
    await page.getByRole('button', { name: 'Edit Expiry', exact: true }).click();
    await expect(page.getByLabel('Edit Expiry Date')).toBeInViewport();
    expect(await page.getByRole('dialog').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`viewer-${width}.png`) });
  });
}
