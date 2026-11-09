/**
 * Visa Bulletin priority-date alerts: signed links, email bodies and the
 * subscription lifecycle (subscribe -> confirm -> monthly alert -> unsubscribe).
 *
 * Storage is public.visa_bulletin_alert_subscriptions (service role only).
 * Links carry only the row id and an HMAC; never the email address.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import type nodemailer from 'nodemailer';
import { z } from 'zod';
import {
  CATEGORY_LABELS,
  COUNTRY_LABELS,
  COUNTRY_SHORT,
  describeMonths,
  describeMovement,
  formatCutoff,
  isPriorityDateCurrent,
  latestBulletin,
  monthsBetween,
  previousBulletin,
  type AlertCategory,
  type AlertCountry,
  type EmploymentBulletin,
} from '@/data/visa-bulletin/employment-cutoffs';
import {
  buildTransactionalEmail,
  emailBodySectionClose,
  emailBodySectionOpen,
  emailPrimaryButton,
  emailTextMuted,
  emailTextP,
  emailTextStrong,
} from '@/lib/notifications/email-layout';
import { escapeHtml } from '@/lib/notifications/transactional/formatting';

export const TABLE = 'visa_bulletin_alert_subscriptions';
/** One person can follow at most this many category/country pairs. */
export const MAX_ALERTS_PER_EMAIL = 3;
/** Do not resend a confirmation email to the same row more often than this. */
export const CONFIRMATION_RESEND_MS = 60 * 60 * 1000;
/** Unconfirmed rows are deleted after this long. */
export const PENDING_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type LinkPurpose = 'confirm' | 'unsubscribe';

export interface Subscription {
  id: string;
  email: string;
  category: AlertCategory;
  chargeability: AlertCountry;
  priority_date: string | null;
  confirmed_at: string | null;
  confirmation_sent_at: string | null;
  last_bulletin_sent: string | null;
}

type SendMail = (options: nodemailer.SendMailOptions) => Promise<{ accepted?: unknown[]; messageId?: string }>;

// ---------------------------------------------------------------- links

function sign(purpose: LinkPurpose, id: string, secret: string) {
  return createHmac('sha256', secret).update(`visa-bulletin-alert-${purpose}-v1:${id}`).digest('base64url');
}

export function createAlertToken(purpose: LinkPurpose, id: string, secret: string): string {
  if (!secret || !z.string().uuid().safeParse(id).success) throw new Error('Invalid alert link configuration');
  return `${id}.${sign(purpose, id, secret)}`;
}

/** Returns the subscription id when the token is valid for this purpose. */
export function verifyAlertToken(purpose: LinkPurpose, token: string | null, secret: string | undefined): string | null {
  if (!token || !secret || token.length > 128) return null;
  const [id, signed, extra] = token.split('.');
  if (extra || !signed || !z.string().uuid().safeParse(id).success) return null;
  const expected = Buffer.from(sign(purpose, id!, secret));
  const actual = Buffer.from(signed);
  return actual.length === expected.length && timingSafeEqual(actual, expected) ? id! : null;
}

export function alertLink(baseUrl: string, purpose: LinkPurpose, id: string, secret: string): string {
  const url = new URL(`/api/visa-bulletin-alerts/${purpose}`, baseUrl);
  url.searchParams.set('token', createAlertToken(purpose, id, secret));
  return url.toString();
}

// ---------------------------------------------------------------- status text

export interface AlertStatus {
  headline: string;
  lines: string[];
}

/** Plain-text facts for one subscriber and one bulletin. Shared by the email and the confirmation page. */
export function describeStatus(
  bulletin: EmploymentBulletin,
  category: AlertCategory,
  country: AlertCountry,
  priorityDate: string | null,
  previous?: EmploymentBulletin
): AlertStatus {
  const label = `${CATEGORY_LABELS[category]} ${COUNTRY_SHORT[country]}`;
  const finalAction = bulletin.finalAction[category][country];
  const filing = bulletin.datesForFiling[category][country];
  const chartName = bulletin.uscisChart === 'dates_for_filing' ? 'Dates for Filing' : 'Final Action Dates';
  const usedCutoff = bulletin.uscisChart === 'dates_for_filing' ? filing : finalAction;

  const lines = [
    `Final Action Date: ${formatCutoff(finalAction)}${
      previous ? ` (${describeMovement(previous.finalAction[category][country], finalAction)} since ${previous.label})` : ''
    }.`,
    `Dates for Filing: ${formatCutoff(filing)}${
      previous ? ` (${describeMovement(previous.datesForFiling[category][country], filing)})` : ''
    }.`,
    `USCIS is accepting the ${chartName} chart for employment-based adjustment filings this month.`,
  ];

  if (priorityDate) {
    const pd = formatCutoff(priorityDate);
    if (isPriorityDateCurrent(priorityDate, finalAction)) {
      lines.push(
        `Your priority date (${pd}) is current under the Final Action Dates, so a green card can be approved this month if everything else in the case is ready.`
      );
    } else if (finalAction === 'U') {
      lines.push(`No visas are available in your category this month, so your priority date (${pd}) cannot be reached yet.`);
    } else {
      lines.push(
        `Your priority date (${pd}) is about ${describeMonths(monthsBetween(priorityDate, finalAction))} behind the Final Action Date.`
      );
      if (isPriorityDateCurrent(priorityDate, usedCutoff)) {
        lines.push(
          `It is earlier than the ${chartName} date USCIS is using this month, so the bulletin does not block an I-485 filing. Filing also needs an eligible petition and status; confirm with your attorney.`
        );
      }
    }
  }

  return { headline: `${bulletin.label} Visa Bulletin: ${label} Final Action Date is ${formatCutoff(finalAction)}`, lines };
}

// ---------------------------------------------------------------- emails

const SUPPORT = 'support@trackmyopt.com';

function choiceSummary(sub: Pick<Subscription, 'category' | 'chargeability' | 'priority_date'>) {
  return `${CATEGORY_LABELS[sub.category]}, ${COUNTRY_LABELS[sub.chargeability]}${
    sub.priority_date ? `, priority date ${formatCutoff(sub.priority_date)}` : ''
  }`;
}

export function buildConfirmationEmail(
  sub: Pick<Subscription, 'category' | 'chargeability' | 'priority_date'>,
  confirmUrl: string
) {
  const subject = 'Confirm your Visa Bulletin priority date alert';
  const summary = choiceSummary(sub);
  const html = buildTransactionalEmail({
    headerTitle: 'Confirm your alert',
    bodyHtml: `${emailBodySectionOpen()}
${emailTextP(`You asked TrackMyOPT to email you when each new Visa Bulletin is out for ${emailTextStrong(escapeHtml(summary))}.`)}
${emailPrimaryButton(escapeHtml(confirmUrl), 'Confirm my alert')}
${emailTextMuted(`One email a month, when the State Department publishes a new bulletin. If you did not ask for this, ignore this email and nothing will be sent. Questions: ${SUPPORT}.`)}
${emailBodySectionClose()}`,
  });
  const text = `You asked TrackMyOPT to email you when each new Visa Bulletin is out for ${summary}.

Confirm your alert: ${confirmUrl}

One email a month, when the State Department publishes a new bulletin. If you did not ask for this, ignore this email and nothing will be sent. Questions: ${SUPPORT}.`;
  return { subject, html, text };
}

export function buildAlertEmail(args: {
  sub: Pick<Subscription, 'category' | 'chargeability' | 'priority_date'>;
  bulletin: EmploymentBulletin;
  previous?: EmploymentBulletin;
  baseUrl: string;
  unsubscribeUrl: string;
}) {
  const { sub, bulletin, previous, baseUrl, unsubscribeUrl } = args;
  const status = describeStatus(bulletin, sub.category, sub.chargeability, sub.priority_date, previous);
  const blogUrl = bulletin.blogPath ? new URL(bulletin.blogPath, baseUrl).toString() : bulletin.officialUrl;
  const footer = `You get this because you asked for Visa Bulletin alerts for ${choiceSummary(sub)}. This is general information, not legal advice; always check the official bulletin.`;
  const html = buildTransactionalEmail({
    headerTitle: `${bulletin.label} Visa Bulletin`,
    bodyHtml: `${emailBodySectionOpen()}
${emailTextP(emailTextStrong(escapeHtml(status.headline)))}
${status.lines.map((line) => emailTextP(escapeHtml(line))).join('\n')}
${emailPrimaryButton(escapeHtml(blogUrl), bulletin.blogPath ? 'Read what changed' : 'Open the official bulletin')}
${emailTextMuted(`Official bulletin: <a href="${escapeHtml(bulletin.officialUrl)}">travel.state.gov</a>`)}
${emailTextMuted(`${escapeHtml(footer)} <a href="${escapeHtml(unsubscribeUrl)}">Unsubscribe</a>.`)}
${emailBodySectionClose()}`,
  });
  const text = `${status.headline}

${status.lines.join('\n')}

${bulletin.blogPath ? 'Read what changed' : 'Official bulletin'}: ${blogUrl}
Official bulletin: ${bulletin.officialUrl}

${footer}
Unsubscribe: ${unsubscribeUrl}`;
  return { subject: status.headline, html, text };
}

// ---------------------------------------------------------------- lifecycle

export const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(320),
  category: z.enum(['eb1', 'eb2', 'eb3', 'eb3_other', 'eb5']),
  chargeability: z.enum(['india', 'china', 'row']),
  priorityDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((value) => !Number.isNaN(Date.parse(value)) && value >= '1990-01-01' && value <= new Date().toISOString().slice(0, 10))
    .optional()
    .or(z.literal('').transform(() => undefined)),
  sourcePage: z.string().max(200).regex(/^\/[a-z0-9/_-]*$/i).optional(),
});

export type SubscribeInput = z.infer<typeof subscribeSchema>;

export type SubscribeResult = 'sent' | 'already_confirmed' | 'recently_sent' | 'limit' | 'failed';

interface Deps {
  supabase: SupabaseClient;
  sendMail: SendMail;
  from: string;
  baseUrl: string;
  secret: string;
  now?: Date;
}

/**
 * Creates or refreshes an unconfirmed alert and sends the confirmation email.
 * The HTTP response is the same for every outcome so the form never reveals
 * whether an address is already subscribed.
 */
export async function subscribe(input: SubscribeInput, deps: Deps): Promise<SubscribeResult> {
  const { supabase } = deps;
  const now = deps.now ?? new Date();

  const existing = await supabase
    .from(TABLE)
    .select('id,email,category,chargeability,priority_date,confirmed_at,confirmation_sent_at,last_bulletin_sent')
    .eq('email', input.email);
  if (existing.error) throw new Error(`Alert lookup failed: ${existing.error.code ?? 'unknown'}`);
  const rows = (existing.data ?? []) as Subscription[];
  let row = rows.find((r) => r.category === input.category && r.chargeability === input.chargeability);

  if (row?.confirmed_at) return 'already_confirmed';
  if (row?.confirmation_sent_at && now.getTime() - Date.parse(row.confirmation_sent_at) < CONFIRMATION_RESEND_MS) {
    return 'recently_sent';
  }

  if (row) {
    const updated = await supabase
      .from(TABLE)
      .update({ priority_date: input.priorityDate ?? null, source_page: input.sourcePage ?? null })
      .eq('id', row.id)
      .is('confirmed_at', null);
    if (updated.error) throw new Error(`Alert update failed: ${updated.error.code ?? 'unknown'}`);
    row = { ...row, priority_date: input.priorityDate ?? null };
  } else {
    if (rows.length >= MAX_ALERTS_PER_EMAIL) return 'limit';
    const inserted = await supabase
      .from(TABLE)
      .insert({
        email: input.email,
        category: input.category,
        chargeability: input.chargeability,
        priority_date: input.priorityDate ?? null,
        source_page: input.sourcePage ?? null,
      })
      .select('id,email,category,chargeability,priority_date,confirmed_at,confirmation_sent_at,last_bulletin_sent')
      .single();
    // A concurrent submit created the same row; treat it as already handled.
    if (inserted.error?.code === '23505') return 'recently_sent';
    if (inserted.error || !inserted.data) throw new Error(`Alert insert failed: ${inserted.error?.code ?? 'unknown'}`);
    row = inserted.data as Subscription;
  }

  const mail = buildConfirmationEmail(row, alertLink(deps.baseUrl, 'confirm', row.id, deps.secret));
  const info = await deps.sendMail({ from: deps.from, to: row.email, ...mail });
  if (!info.accepted?.length) return 'failed';
  await supabase.from(TABLE).update({ confirmation_sent_at: now.toISOString() }).eq('id', row.id);
  return 'sent';
}

export type ConfirmResult = { result: 'ok'; sub: Subscription } | { result: 'missing' };

/** Confirms the alert. The current bulletin counts as already sent; the first email is the next bulletin. */
export async function confirm(supabase: SupabaseClient, id: string, now = new Date()): Promise<ConfirmResult> {
  const current = await supabase
    .from(TABLE)
    .select('id,email,category,chargeability,priority_date,confirmed_at,confirmation_sent_at,last_bulletin_sent')
    .eq('id', id)
    .maybeSingle();
  if (current.error) throw new Error(`Alert lookup failed: ${current.error.code ?? 'unknown'}`);
  const sub = current.data as Subscription | null;
  if (!sub) return { result: 'missing' };
  if (sub.confirmed_at) return { result: 'ok', sub };
  const updated = await supabase
    .from(TABLE)
    .update({ confirmed_at: now.toISOString(), last_bulletin_sent: latestBulletin().month })
    .eq('id', id)
    .is('confirmed_at', null);
  if (updated.error) throw new Error(`Alert confirm failed: ${updated.error.code ?? 'unknown'}`);
  return { result: 'ok', sub: { ...sub, confirmed_at: now.toISOString() } };
}

/** Unsubscribing deletes the row; nothing about the reader is kept. */
export async function unsubscribe(supabase: SupabaseClient, id: string): Promise<'ok'> {
  const deleted = await supabase.from(TABLE).delete().eq('id', id);
  if (deleted.error) throw new Error(`Alert delete failed: ${deleted.error.code ?? 'unknown'}`);
  return 'ok';
}

export interface SendRunResult {
  month: string;
  due: number;
  sent: number;
  failed: number;
  pendingDeleted: number;
}

/**
 * Sends the latest bulletin to every confirmed subscriber who has not had it.
 * Each row is claimed with a conditional update before sending, so two
 * overlapping runs cannot email the same person twice. A failed send releases
 * the claim so the next run retries it.
 */
export async function sendDueAlerts(
  deps: Deps & { batchSize?: number; onError?: (error: unknown) => void }
): Promise<SendRunResult> {
  const { supabase } = deps;
  const now = deps.now ?? new Date();
  const bulletin = latestBulletin();
  const previous = previousBulletin(bulletin.month);
  const result: SendRunResult = { month: bulletin.month, due: 0, sent: 0, failed: 0, pendingDeleted: 0 };

  const cleanup = await supabase
    .from(TABLE)
    .delete()
    .is('confirmed_at', null)
    .lt('created_at', new Date(now.getTime() - PENDING_TTL_MS).toISOString())
    .select('id');
  if (cleanup.error) deps.onError?.(new Error(`Alert cleanup failed: ${cleanup.error.code ?? 'unknown'}`));
  else result.pendingDeleted = cleanup.data?.length ?? 0;

  const due = await supabase
    .from(TABLE)
    .select('id,email,category,chargeability,priority_date,confirmed_at,confirmation_sent_at,last_bulletin_sent')
    .not('confirmed_at', 'is', null)
    .or(`last_bulletin_sent.is.null,last_bulletin_sent.lt.${bulletin.month}`)
    .order('created_at', { ascending: true })
    .limit(deps.batchSize ?? 200);
  if (due.error) throw new Error(`Due alert lookup failed: ${due.error.code ?? 'unknown'}`);
  const rows = (due.data ?? []) as Subscription[];
  result.due = rows.length;

  for (const sub of rows) {
    const claim = await supabase
      .from(TABLE)
      .update({ last_bulletin_sent: bulletin.month })
      .eq('id', sub.id)
      .or(`last_bulletin_sent.is.null,last_bulletin_sent.lt.${bulletin.month}`)
      .select('id');
    if (claim.error) {
      result.failed += 1;
      deps.onError?.(new Error(`Alert claim failed: ${claim.error.code ?? 'unknown'}`));
      continue;
    }
    if (!claim.data?.length) continue; // Another run already took it.

    try {
      const unsubscribeUrl = alertLink(deps.baseUrl, 'unsubscribe', sub.id, deps.secret);
      const mail = buildAlertEmail({ sub, bulletin, previous, baseUrl: deps.baseUrl, unsubscribeUrl });
      const info = await deps.sendMail({
        from: deps.from,
        to: sub.email,
        ...mail,
        headers: { 'List-Unsubscribe': `<${unsubscribeUrl}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
      });
      if (!info.accepted?.length) throw new Error('SMTP did not accept the recipient');
      result.sent += 1;
    } catch (error) {
      result.failed += 1;
      await supabase.from(TABLE).update({ last_bulletin_sent: sub.last_bulletin_sent }).eq('id', sub.id);
      // SMTP errors can quote the recipient address, so only the error class is reported.
      deps.onError?.(new Error(`Visa Bulletin alert send failed (${error instanceof Error ? error.name : 'unknown'})`));
    }
  }
  return result;
}
