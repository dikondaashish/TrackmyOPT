// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { load } from 'cheerio';
import { getAllEmailPreviews } from './email-preview-catalog';
import { getSupabaseAuthTemplates } from './supabase-auth-templates';
import { buildDocumentExpiryReminderEmail } from './document-expiry-email';
import {
  buildExportOtpEmailHtml,
  buildEnrollmentEmailHtml,
} from './email-service';
import { getDailyReminderSubject } from './templates/daily-reminder-html';
import { buildRefundProcessedEmailBodies } from './transactional/billing';

afterEach(() => vi.useRealTimers());
describe('production email coverage and safe rendering', () => {
  it('renders unique, complete documents for every catalog fixture without injected markup', () => {
    const previews = getAllEmailPreviews('<img src=x onerror=alert(1)>');
    expect(previews.length).toBeGreaterThan(65);
    expect(new Set(previews.map((p) => p.id)).size).toBe(previews.length);
    for (const p of previews) {
      const $ = load(p.html);
      expect(p.subject, p.id).toBeTruthy();
      expect($('meta[name=viewport]').length, p.id).toBe(1);
      expect($('[onerror]').length, p.id).toBe(0);
      expect($('body').text(), p.id).toContain('TrackMyOPT');
      expect(
        $('a[href="mailto:support@trackmyopt.com"]').length,
        p.id
      ).toBeGreaterThan(0);
      expect(p.html, p.id).not.toMatch(/\b(?:undefined|NaN|Infinity)\b/);
    }
  });
  it('preserves OTP signup and the link-based recovery flow, and separates reauthentication', () => {
    const templates = getSupabaseAuthTemplates();
    expect(templates).toHaveLength(13);
    const signup = templates.find((t) => t.key === 'confirmation')!;
    expect(signup.html).toContain('{{ .Token }}');
    expect(signup.html).not.toContain('{{ .ConfirmationURL }}');
    expect(templates.find((t) => t.key === 'recovery')!.html).toContain(
      '{{ .ConfirmationURL }}'
    );
    const reauth = templates.find((t) => t.key === 'reauthentication')!;
    expect(reauth.html).toContain('{{ .Token }}');
    expect(reauth.html).not.toContain('signup screen');
    expect(reauth.subject).not.toContain('{{ .Token }}');
    for (const t of templates)
      expect(t.html).toContain('background-color:#1E3A8A');
  });
  it('escapes names and codes in direct send builders', () => {
    const $ = load(
      buildExportOtpEmailHtml('<script>alert(1)</script>', 'A & B <Student>')
    );
    expect($('script')).toHaveLength(0);
    expect($('body').text()).toContain('A & B <Student>');
    expect(
      load(buildEnrollmentEmailHtml('<svg/onload=alert(1)>', 'default').html)(
        '[onload]'
      )
    ).toHaveLength(0);
  });
  it('uses the same Free resume limit in HTML and plain text', () => {
    const b = buildRefundProcessedEmailBodies({
      firstName: 'Alex',
      amountCents: 499,
      currency: 'usd',
    });
    expect(load(b.html)('body').text()).toContain(
      '1 AI-built resume per month'
    );
    expect(b.text).toContain('(1/month)');
  });
  it('handles an empty daily summary without an infinite countdown', () => {
    expect(getDailyReminderSubject([])).toBe('Your TrackMyOPT daily summary');
  });
});
describe('document dates use Eastern calendar days', () => {
  it.each([
    ['2026-10-11T02:00:00Z', '2026-10-10', 'expires today'],
    ['2026-10-11T02:00:00Z', '2026-10-11', 'expires in 1 day'],
    ['2026-10-11T02:00:00Z', '2026-10-09', 'has expired'],
    ['2026-11-01T05:30:00Z', '2026-11-02', 'expires in 1 day'],
    ['2026-03-08T06:30:00Z', '2026-03-09', 'expires in 1 day'],
  ])('renders %s / %s correctly', (now, expiry_date, expected) => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(now));
    const text = load(
      buildDocumentExpiryReminderEmail({
        filename: 'passport.pdf',
        expiry_date,
        document_type: 'passport',
      })
    )('body').text();
    expect(text).toContain(expected);
    expect(text).not.toContain('Invalid Date');
  });
});
