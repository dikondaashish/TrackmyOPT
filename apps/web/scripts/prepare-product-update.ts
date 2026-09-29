/** Offline only: builds a private, scoped, dry-run request. Never connects to SMTP or the database. */
import { execFileSync } from 'node:child_process';
import { readFile, realpath, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { z } from 'zod';
import { renderCampaignSource } from '../lib/notifications/campaign-template';
import { campaignTrackingSchema } from '../lib/notifications/campaign-tracking';

async function main() {
  const { values } = parseArgs({ strict: true, options: {
    'recipients-file': { type: 'string' }, 'postal-address-file': { type: 'string' },
    output: { type: 'string' }, 'campaign-id': { type: 'string' }, help: { type: 'boolean' },
  } });
  if (values.help) {
    console.log('prepare-product-update --recipients-file /private/recipients.json --postal-address-file /private/address.txt --output /private/product-update.json [--campaign-id test_product_update_2026_09_29]');
    console.log('Recipients: JSON array of 1–100 reviewed account UUIDs. Output: dryRun=true. No email is sent.');
    return;
  }
  if (!values['recipients-file'] || !values['postal-address-file'] || !values.output || !isAbsolute(values.output)) {
    throw new Error('Provide recipients-file, postal-address-file and an absolute output path outside the repository. See --help.');
  }
  const root = await realpath(execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim());
  const parent = await realpath(dirname(values.output));
  let outputRepository = '';
  try { outputRepository = execFileSync('git', ['-C', parent, 'rev-parse', '--show-toplevel'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { /* A private directory need not be a Git checkout. */ }
  if (outputRepository) throw new Error('Keep recipient request files outside all Git repositories');
  const relativeParent = relative(root, parent);
  if (!relativeParent.startsWith('../') && !isAbsolute(relativeParent)) throw new Error('Keep recipient request files outside the repository');
  const recipientUserIds = [...new Set(z.array(z.string().uuid()).min(1).max(100).parse(JSON.parse(await readFile(values['recipients-file'], 'utf8'))))];
  const directory = resolve(root, 'docs/marketing/updates/2026-09-28');
  const { subject, html, text } = renderCampaignSource(
    await readFile(resolve(directory, 'email.html'), 'utf8'),
    await readFile(resolve(directory, 'email.txt'), 'utf8'),
    await readFile(values['postal-address-file'], 'utf8'),
  );
  const config = JSON.parse(await readFile(resolve(directory, 'tracking.json'), 'utf8'));
  if (values['campaign-id']) config.id = values['campaign-id'];
  const campaign = campaignTrackingSchema.parse(config);
  await writeFile(values.output, JSON.stringify({ type: 'service_announcement', subject, htmlContent: html,
    plainTextContent: text, campaign, recipientUserIds, dryRun: true }, null, 2) + '\n', { mode: 0o600, flag: 'wx' });
  console.log(`Prepared ${recipientUserIds.length} explicitly selected accounts with dryRun=true. File: ${values.output}`);
  console.log('No email sent. Review inactive-user status, introductory-offer eligibility and permission to send before using the request.');
}

main().catch(error => { console.error(error instanceof Error ? error.message : 'Template preparation failed'); process.exitCode = 1; });
