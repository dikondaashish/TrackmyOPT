/**
 * Policy update notice (May 2026) — transactional email content and recipient filtering.
 * Not a marketing campaign; no upsells or promotional CTAs.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { COMPANY, LEGAL_CONTACT, LEGAL_VERSION_ID } from "@/lib/legal/legal-config";
import { getAppBaseUrl } from "@/lib/notifications/transactional-emails";
import {
  EMAIL,
  emailBrandHeaderWithLogo,
  emailCardOpen,
  emailFooter,
  emailOuterClose,
  emailOuterOpen,
  emailPrimaryButton,
  emailTextLead,
  emailTextList,
  emailTextMuted,
  emailTextP,
} from "@/lib/notifications/email-brand";
import { emailInfoCallout } from "@/lib/notifications/email-layout";
import { getSmtpFromHeader, sendMailWithRetry } from "@/lib/notifications/email-smtp";

export const POLICY_UPDATE_NOTICE_TYPE = "policy_update_2026_05_31" as const;
export const POLICY_UPDATE_NOTICE_TEMPLATE = "policy_update_notice_2026_05_31" as const;
export const POLICY_UPDATE_NOTICE_SUBJECT = "TrackMyOPT policy update";

const INVALID_EMAIL_DOMAINS = [
  "example.com",
  "example.org",
  "test",
  "localhost",
  "invalid",
] as const;

const INTERNAL_EMAIL_DOMAINS = ["zyene.com", "trackmyopt.com"] as const;

const TEST_EMAIL_LOCAL_PREFIXES = ["test", "demo", "dev"] as const;

export type PolicyNoticeRecipient = {
  userId: string;
  email: string;
  firstName: string | null;
  /** Pro plan only: include plan price / trial / refund / cancellation unchanged notice. */
  showBillingUnchangedNotice: boolean;
};

const BILLING_UNCHANGED_NOTICE =
  "These updates do not change your current plan price, trial period, refund window, or cancellation rights.";

/** True when recipient is on an active Pro subscription tier (not Free or Dedicated). */
export function recipientShowsBillingUnchangedNotice(planTier: string | null | undefined): boolean {
  return planTier?.toLowerCase() === "pro";
}

export type RecipientExclusionReason =
  | "invalid_email"
  | "invalid_domain"
  | "test_account"
  | "internal_account"
  | "blocked_email"
  | "duplicate_email"
  | "already_sent";

export type PolicyNoticeAuthRow = {
  userId: string;
  email: string;
  hasProfile: boolean;
  firstName: string | null;
  planTier: string | null;
};

export type PolicyNoticeDryRunStats = {
  activeAuthUsers: number;
  usersWithProfiles: number;
  authOnlyUsers: number;
  eligibleProfileBacked: number;
  eligibleAuthOnly: number;
  totalEligible: number;
  excludedTotal: number;
  duplicateEmailsRemoved: number;
  excludedBlocked: number;
  excludedInternalOrTest: number;
  excludedInvalid: number;
  alreadySentSkipped: number;
  withBillingUnchangedNotice: number;
  withoutBillingUnchangedNotice: number;
};

export type RecipientFilterResult = {
  eligible: PolicyNoticeRecipient[];
  excluded: { reason: RecipientExclusionReason; count: number }[];
  stats: PolicyNoticeDryRunStats;
};

/** Redact email for optional debug output only. */
export function redactEmail(email: string): string {
  const normalized = normalizeEmail(email);
  const [local, domain] = normalized.split("@");
  if (!local || !domain) return "***";
  const visible = local.length <= 1 ? "*" : `${local[0]}***`;
  return `${visible}@${domain}`;
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmailFormat(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function getRecipientExclusionReason(email: string): RecipientExclusionReason | null {
  const normalized = normalizeEmail(email);
  if (!normalized || !isValidEmailFormat(normalized)) {
    return "invalid_email";
  }

  const [local, domain] = normalized.split("@");
  if (!local || !domain) return "invalid_email";

  if (INVALID_EMAIL_DOMAINS.some((d) => domain === d || domain.endsWith(`.${d}`))) {
    return "invalid_domain";
  }

  if (INTERNAL_EMAIL_DOMAINS.includes(domain as (typeof INTERNAL_EMAIL_DOMAINS)[number])) {
    return "internal_account";
  }

  const localBase = local.split("+")[0]?.split(".")[0] ?? local;
  if (
    TEST_EMAIL_LOCAL_PREFIXES.some(
      (p) => localBase === p || local.startsWith(`${p}+`) || local.startsWith(`${p}.`)
    )
  ) {
    return "test_account";
  }

  return null;
}

export function buildPolicyUpdateNoticeEmailContent(
  firstName: string | null,
  options?: { showBillingUnchangedNotice?: boolean }
): {
  subject: string;
  html: string;
  text: string;
} {
  const showBillingUnchangedNotice = options?.showBillingUnchangedNotice === true;
  const base = getAppBaseUrl();
  const greeting = firstName?.trim() ? `Hi ${escapeHtml(firstName.trim())},` : "Hi,";

  const links = [
    { label: "Privacy Policy", href: `${base}/privacy` },
    { label: "Terms", href: `${base}/terms` },
    { label: "Refund Policy", href: `${base}/refund-policy` },
    { label: "Cookie Policy", href: `${base}/cookie-policy` },
    { label: "Disclaimer", href: `${base}/disclaimer` },
    { label: "Security", href: `${base}/security` },
  ];

  const linkListHtml = links
    .map(
      (l) =>
        `<li class="tmo-force-light-text" style="margin:0 0 8px 0;"><a href="${l.href}" class="tmo-force-link" style="color:${EMAIL.link} !important;font-weight:500;">${escapeHtml(l.label)}</a></li>`
    )
    .join("");

  const linkListText = links.map((l) => `${l.label}: ${l.href}`).join("\n");

  const privacyUrl = `${base}/privacy`;

  const html = `${emailOuterOpen()}
    ${emailCardOpen({
      headerHtml: emailBrandHeaderWithLogo({
        title: "Policy update",
      }),
    })}
      <div class="tmo-force-card" style="padding:28px 24px;font-family:${EMAIL.fontStack};background:${EMAIL.bgCard};">
        ${emailTextLead("Privacy, Terms, and related legal notices")}
        ${emailTextP(greeting)}
        ${emailTextP(
          `We updated ${escapeHtml(COMPANY.productName)}&rsquo;s Privacy Policy, Terms, Cookie Policy, Disclaimer, Security notices, and related legal notices.`
        )}
        ${emailTextP("The updates clarify:")}
        ${emailTextList([
          "how TrackMyOPT describes USCIS Case Status API access;",
          "that TrackMyOPT is independent software and is not affiliated with, endorsed by, or operated by USCIS, DHS, SEVP, ICE, or any U.S. government agency;",
          "dormant account handling;",
          "business transfer language;",
          "breach notification language;",
          "analytics opt-out options; and",
          "payment/security wording.",
        ])}
        ${
          showBillingUnchangedNotice
            ? emailInfoCallout(
                `<p class="tmo-force-info-text" style="margin:0;color:${EMAIL.infoText} !important;font-size:14px;line-height:1.55;">${BILLING_UNCHANGED_NOTICE}</p>`
              )
            : ""
        }
        ${emailTextLead("You can review the updated policies here:")}
        <ul class="tmo-force-light-text" style="margin:0 0 8px 0;padding-left:20px;list-style:none;">${linkListHtml}</ul>
        ${emailPrimaryButton(privacyUrl, "Review policies")}
        ${emailTextP(
          `If you have questions, contact <a href="mailto:${LEGAL_CONTACT.support}" class="tmo-force-link" style="color:${EMAIL.link} !important;font-weight:500;">${LEGAL_CONTACT.support}</a>.`
        )}
        ${emailTextMuted(`&mdash; ${escapeHtml(COMPANY.productName)} Team`)}
      </div>
      ${emailFooter()}
    </div>
  ${emailOuterClose()}`;

  const text = `${greeting}

We updated TrackMyOPT's Privacy Policy, Terms, Cookie Policy, Disclaimer, Security notices, and related legal notices.

The updates clarify:
- how TrackMyOPT describes USCIS Case Status API access;
- that TrackMyOPT is independent software and is not affiliated with, endorsed by, or operated by USCIS, DHS, SEVP, ICE, or any U.S. government agency;
- dormant account handling;
- business transfer language;
- breach notification language;
- analytics opt-out options; and
- payment/security wording.
${
  showBillingUnchangedNotice
    ? `

${BILLING_UNCHANGED_NOTICE}`
    : ""
}

You can review the updated policies here:
${linkListText}

If you have questions, contact ${LEGAL_CONTACT.support}.

— TrackMyOPT Team`;

  return { subject: POLICY_UPDATE_NOTICE_SUBJECT, html, text };
}

/**
 * Filter active auth-backed rows into eligible policy notice recipients.
 * Profile is optional; auth.users email is the account identifier for legal notice.
 */
export function filterPolicyNoticeRecipients(
  rows: PolicyNoticeAuthRow[],
  options: { blockedEmails: Set<string>; alreadySentEmails: Set<string> }
): RecipientFilterResult {
  const { blockedEmails, alreadySentEmails } = options;

  const exclusionCounts: Record<RecipientExclusionReason, number> = {
    invalid_email: 0,
    invalid_domain: 0,
    test_account: 0,
    internal_account: 0,
    blocked_email: 0,
    duplicate_email: 0,
    already_sent: 0,
  };

  const activeAuthUsers = rows.length;
  const usersWithProfiles = rows.filter((r) => r.hasProfile).length;
  const authOnlyUsers = activeAuthUsers - usersWithProfiles;

  const seenEmails = new Map<string, PolicyNoticeRecipient>();
  const eligible: PolicyNoticeRecipient[] = [];

  for (const row of rows) {
    const emailRaw = normalizeEmail(row.email);
    if (!emailRaw) {
      exclusionCounts.invalid_email += 1;
      continue;
    }

    const exclusion = getRecipientExclusionReason(emailRaw);
    if (exclusion) {
      exclusionCounts[exclusion] += 1;
      continue;
    }

    if (blockedEmails.has(emailRaw)) {
      exclusionCounts.blocked_email += 1;
      continue;
    }

    if (alreadySentEmails.has(emailRaw)) {
      exclusionCounts.already_sent += 1;
      continue;
    }

    const recipient: PolicyNoticeRecipient = {
      userId: row.userId,
      email: emailRaw,
      firstName: row.firstName,
      showBillingUnchangedNotice: recipientShowsBillingUnchangedNotice(row.planTier),
    };

    const existing = seenEmails.get(emailRaw);
    if (existing) {
      exclusionCounts.duplicate_email += 1;
      const existingRow = rows.find((r) => r.userId === existing.userId);
      const currentHasProfile = row.hasProfile;
      const existingHasProfile = existingRow?.hasProfile ?? false;
      if (currentHasProfile && !existingHasProfile) {
        seenEmails.set(emailRaw, recipient);
        const idx = eligible.findIndex((e) => e.email === emailRaw);
        if (idx >= 0) eligible[idx] = recipient;
      }
      continue;
    }

    seenEmails.set(emailRaw, recipient);
    eligible.push(recipient);
  }

  const eligibleProfileBacked = eligible.filter((r) => {
    const row = rows.find((x) => x.userId === r.userId);
    return row?.hasProfile;
  }).length;
  const eligibleAuthOnly = eligible.length - eligibleProfileBacked;
  const withBillingUnchangedNotice = eligible.filter((r) => r.showBillingUnchangedNotice).length;
  const withoutBillingUnchangedNotice = eligible.length - withBillingUnchangedNotice;

  const excludedInternalOrTest =
    exclusionCounts.test_account +
    exclusionCounts.internal_account +
    exclusionCounts.invalid_domain;

  const excludedTotal = Object.values(exclusionCounts).reduce((a, b) => a + b, 0);

  return {
    eligible,
    excluded: (Object.entries(exclusionCounts) as [RecipientExclusionReason, number][])
      .filter(([, count]) => count > 0)
      .map(([reason, count]) => ({ reason, count })),
    stats: {
      activeAuthUsers,
      usersWithProfiles,
      authOnlyUsers,
      eligibleProfileBacked,
      eligibleAuthOnly,
      totalEligible: eligible.length,
      excludedTotal,
      duplicateEmailsRemoved: exclusionCounts.duplicate_email,
      excludedBlocked: exclusionCounts.blocked_email,
      excludedInternalOrTest,
      excludedInvalid: exclusionCounts.invalid_email,
      alreadySentSkipped: exclusionCounts.already_sent,
      withBillingUnchangedNotice,
      withoutBillingUnchangedNotice,
    },
  };
}

async function fetchAllProfiles(
  supabase: SupabaseClient
): Promise<
  Array<{
    user_id: string;
    email: string | null;
    first_name: string | null;
    plan_tier: string | null;
  }>
> {
  const pageSize = 1000;
  let from = 0;
  const all: Array<{
    user_id: string;
    email: string | null;
    first_name: string | null;
    plan_tier: string | null;
  }> = [];

  while (true) {
    const { data, error } = await supabase
      .from("profiles")
      .select("user_id, email, first_name, plan_tier")
      .range(from, from + pageSize - 1);

    if (error) throw new Error(`Failed to fetch profiles: ${error.message}`);
    if (!data?.length) break;
    all.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return all;
}

async function fetchAuthUsersById(
  supabase: SupabaseClient
): Promise<Map<string, { email: string | null; deleted: boolean }>> {
  const map = new Map<string, { email: string | null; deleted: boolean }>();
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(`Failed to fetch auth users: ${error.message}`);

    const users = data.users ?? [];
    for (const u of users) {
      map.set(u.id, {
        email: u.email ?? null,
        deleted: Boolean(u.deleted_at),
      });
    }

    if (users.length < perPage) break;
    page += 1;
  }

  return map;
}

/**
 * All active auth.users with valid email; profile optional (first name only).
 * Legal notice uses auth account email as source of truth.
 */
export async function fetchActiveAuthUsersForPolicyNotice(
  supabase: SupabaseClient
): Promise<PolicyNoticeAuthRow[]> {
  const [profiles, authById] = await Promise.all([
    fetchAllProfiles(supabase),
    fetchAuthUsersById(supabase),
  ]);

  const profileByUserId = new Map(
    profiles.map((p) => [p.user_id, p] as const)
  );

  const rows: PolicyNoticeAuthRow[] = [];

  for (const [userId, auth] of authById) {
    if (auth.deleted) continue;
    const authEmail = auth.email?.trim();
    if (!authEmail) continue;

    const profile = profileByUserId.get(userId);

    rows.push({
      userId,
      email: authEmail,
      hasProfile: Boolean(profile),
      firstName: profile?.first_name?.trim() || null,
      planTier: profile?.plan_tier ?? null,
    });
  }

  return rows;
}

export async function loadPolicyNoticeRecipients(
  supabase: SupabaseClient,
  options?: { alreadySentEmails?: Set<string>; blockedEmails?: Set<string> }
): Promise<RecipientFilterResult> {
  const alreadySent = options?.alreadySentEmails ?? new Set<string>();
  const blocked = options?.blockedEmails ?? new Set<string>();

  const authRows = await fetchActiveAuthUsersForPolicyNotice(supabase);
  return filterPolicyNoticeRecipients(authRows, {
    blockedEmails: blocked,
    alreadySentEmails: alreadySent,
  });
}

export async function loadBlockedEmails(supabase: SupabaseClient): Promise<Set<string>> {
  const blocked = new Set<string>();
  const pageSize = 500;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("blocked_emails")
      .select("email")
      .range(from, from + pageSize - 1);

    if (error) {
      console.warn("blocked_emails fetch failed:", error.message);
      break;
    }

    for (const row of data ?? []) {
      if (row.email) blocked.add(normalizeEmail(row.email));
    }

    if (!data || data.length < pageSize) break;
    from += pageSize;
  }

  return blocked;
}

export async function loadAlreadySentNoticeEmails(
  supabase: SupabaseClient,
  noticeType: string = POLICY_UPDATE_NOTICE_TYPE
): Promise<Set<string>> {
  const sent = new Set<string>();
  const pageSize = 500;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("policy_notice_email_events")
      .select("email")
      .eq("notice_type", noticeType)
      .eq("status", "sent")
      .range(from, from + pageSize - 1);

    if (error) {
      if (error.message.includes("does not exist")) return sent;
      throw new Error(`Failed to load policy notice events: ${error.message}`);
    }

    for (const row of data ?? []) {
      if (row.email) sent.add(normalizeEmail(row.email));
    }

    if (!data || data.length < pageSize) break;
    from += pageSize;
  }

  return sent;
}

export type SendPolicyNoticeResult =
  | { status: "sent"; providerMessageId: string }
  | { status: "skipped"; reason: string }
  | { status: "failed"; error: string };

export async function sendPolicyUpdateNoticeToRecipient(args: {
  supabase: SupabaseClient;
  recipient: PolicyNoticeRecipient;
  dryRun: boolean;
}): Promise<SendPolicyNoticeResult> {
  const { supabase, recipient, dryRun } = args;
  const { subject, html, text } = buildPolicyUpdateNoticeEmailContent(recipient.firstName, {
    showBillingUnchangedNotice: recipient.showBillingUnchangedNotice,
  });

  if (dryRun) {
    return { status: "skipped", reason: "dry_run" };
  }

  const { data: existing } = await supabase
    .from("policy_notice_email_events")
    .select("id, status")
    .eq("email", recipient.email)
    .eq("notice_type", POLICY_UPDATE_NOTICE_TYPE)
    .maybeSingle();

  if (existing?.status === "sent") {
    return { status: "skipped", reason: "already_sent" };
  }

  const userIdForAudit =
    recipient.userId === "00000000-0000-0000-0000-000000000000"
      ? null
      : recipient.userId;

  const eventRow = {
    user_id: userIdForAudit,
    email: recipient.email,
    notice_type: POLICY_UPDATE_NOTICE_TYPE,
    policy_version: LEGAL_VERSION_ID,
    status: "pending" as const,
    metadata: { template: POLICY_UPDATE_NOTICE_TEMPLATE },
  };

  const { data: inserted, error: insErr } = await supabase
    .from("policy_notice_email_events")
    .upsert(eventRow, { onConflict: "email,notice_type" })
    .select("id")
    .single();

  if (insErr || !inserted?.id) {
    return { status: "failed", error: insErr?.message || "audit_insert_failed" };
  }

  try {
    const info = await sendMailWithRetry({
      from: getSmtpFromHeader(),
      to: recipient.email,
      subject,
      html,
      text,
    });

    const providerMessageId =
      typeof info.messageId === "string" && info.messageId.length > 0
        ? info.messageId
        : `smtp-${inserted.id}`;

    await supabase
      .from("policy_notice_email_events")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        provider_message_id: providerMessageId,
        error: null,
      })
      .eq("id", inserted.id);

    await supabase.from("email_queue").insert({
      user_id: userIdForAudit,
      email_address: recipient.email,
      email_type: POLICY_UPDATE_NOTICE_TYPE,
      email_subject: subject,
      email_data: {
        policy_version: LEGAL_VERSION_ID,
        notice_type: POLICY_UPDATE_NOTICE_TYPE,
        template: POLICY_UPDATE_NOTICE_TEMPLATE,
      },
      status: "sent",
      sent_at: new Date().toISOString(),
      provider_message_id: providerMessageId,
      body_html: html,
      body_text: text,
      retry_count: 0,
    });

    return { status: "sent", providerMessageId };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await supabase
      .from("policy_notice_email_events")
      .update({ status: "failed", error: message })
      .eq("id", inserted.id);
    return { status: "failed", error: message };
  }
}
