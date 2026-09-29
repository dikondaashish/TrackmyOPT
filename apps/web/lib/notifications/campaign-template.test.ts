// @vitest-environment node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, it } from 'vitest';
import { renderCampaignSource } from './campaign-template';
const path = resolve(process.cwd(), '../../docs/marketing/updates/2026-09-28');
const html = readFileSync(resolve(path, 'email.html'), 'utf8');
const source = readFileSync(resolve(path, 'email.txt'), 'utf8');
it('prepares the real template, strips MIME metadata and escapes the postal address', () => {
  const result = renderCampaignSource(html, source, 'Fictional & Co\n123 <Test> Road, Test City, XX 00000');
  expect(result.subject).toBe('We’ve been busy 👋 Try Pro for $0.99');
  expect(result.text.startsWith('Hey {{firstName}},')).toBe(true);
  expect(result.text).not.toContain('Preheader:');
  expect(result.html).toContain('Fictional &amp; Co<br>123 &lt;Test&gt; Road');
  expect(result.html).toContain('https://www.trackmyopt.com/email/product-update-2026-09-29/next-steps.gif');
  expect(result.html).not.toContain('{{POSTAL_ADDRESS}}');
  expect(result.html).toContain('{{UNSUBSCRIBE_URL}}');
  expect(result.text).toContain('{{UNSUBSCRIBE_URL}}');
});
it('rejects an email address, missing address and unexpected merge fields', () => {
  for (const address of ['', 'support@trackmyopt.com', '{{POSTAL_ADDRESS}}']) expect(() => renderCampaignSource(html, source, address)).toThrow('physical');
  expect(() => renderCampaignSource(html + '{{unknown}}', source, '123 Fictional Road, Test City, XX 00000')).toThrow('unresolved');
});
