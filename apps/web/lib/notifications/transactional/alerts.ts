/**
 * Deadline alerts driven by the user's immigration timeline rather than by
 * product engagement.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { EMAIL } from "../email-brand";
import {
  buildTransactionalEmail,
  emailBodySectionClose,
  emailBodySectionOpen,
  emailPrimaryButton,
  emailTextLead,
  emailTextList,
  emailTextMuted,
  emailTextP,
  emailTextStrong,
} from "../email-layout";
import { LEGAL_CONTACT } from "@/lib/legal/legal-config";
import { escapeHtml } from "./formatting";
import {
  queueTransactionalEmailSend,
  type QueueTransactionalResult,
} from "./queue";

function getStemOptDashboardBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://www.trackmyopt.com"
  ).replace(/\/$/, "");
}

/**
 * STEM OPT extension filing window opened (90 days before current OPT EAD end).
 * Queues stem_opt_window_open, sends via SMTP, updates email_queue.
 */
export async function sendStemOptWindowEmail(args: {
  supabase: SupabaseClient;
  userId: string;
  toEmail: string;
  firstName: string | null;
  optEadEndDate: string;
}): Promise<QueueTransactionalResult> {
  const { supabase, userId, toEmail, firstName, optEadEndDate } = args;
  const dashUrl = `${getStemOptDashboardBaseUrl()}/dashboard`;
  const greeting = firstName ? `Hi ${escapeHtml(firstName)},` : "Hi,";

  let eadDisplay = optEadEndDate;
  try {
    const d = new Date(optEadEndDate + (optEadEndDate.includes("T") ? "" : "T12:00:00Z"));
    if (!Number.isNaN(d.getTime())) {
      eadDisplay = d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      });
    }
  } catch {
    // keep raw string
  }

  const html = buildTransactionalEmail({
    headerTitle: "STEM OPT extension window",
    bodyHtml: `
${emailBodySectionOpen()}
${emailTextLead("Your 90-day filing window is open")}
${emailTextP(greeting)}
${emailTextP(emailTextStrong("Your STEM OPT extension window is now open."))}
${emailTextP(
  `Your current OPT EAD expires on ${emailTextStrong(escapeHtml(eadDisplay))}. You are within the 90-day window to apply for a 24-month STEM OPT extension &mdash; act before your EAD expires.`
)}
${emailTextLead("Here&rsquo;s what to do right now:")}
${emailTextList(
  [
    "<strong>Talk to your DSO</strong> &mdash; request a STEM OPT recommendation in SEVIS before you file.",
    "<strong>Confirm E-Verify enrollment</strong> &mdash; your employer must participate in E-Verify.",
    "<strong>File Form I-765 with USCIS</strong> &mdash; file before your EAD expires for cap-gap protection.",
    "<strong>Complete Form I-983</strong> &mdash; training plan with your employer (due within 10 days of starting).",
  ],
  { ordered: true }
)}
${emailTextP("Track your STEM OPT timeline in your dashboard.")}
${emailPrimaryButton(dashUrl, "Open my dashboard")}
${emailTextMuted(
  `Questions? Reply to this email or contact <a href="mailto:${LEGAL_CONTACT.support}" class="tmo-force-link" style="color:${EMAIL.link} !important;">${LEGAL_CONTACT.support}</a>`
)}
${emailBodySectionClose()}`,
  });

  const text = `${firstName ? `Hi ${firstName},` : "Hi,"}

Your STEM OPT extension window is now open.

Your current OPT EAD expires on ${eadDisplay}. You are now within the 90-day window to apply for a 24-month STEM OPT extension — but you must act before your EAD expires.

Here's what to do right now:

1. Talk to your DSO — request a STEM OPT recommendation in your school's system (SEVIS). This is required before you can file.

2. Confirm your employer is E-Verify enrolled — your employer must be actively participating in E-Verify. Check with your HR team.

3. File Form I-765 with USCIS — file before your current EAD expires. If filed on time, you get an automatic 180-day cap-gap extension.

4. Complete Form I-983 with your employer — training plan required for STEM OPT. Due within 10 days of starting.

Track your STEM OPT application timeline in your TrackMyOPT dashboard:
${dashUrl}

Questions? Reply to this email or contact support@trackmyopt.com

© ${new Date().getFullYear()} Zyene, Inc.`;

  return queueTransactionalEmailSend({
    supabase,
    userId,
    emailAddress: toEmail,
    emailType: "stem_opt_window_open",
    subject: "Your STEM OPT extension window is now open — here's what to do",
    html,
    text,
    emailData: { opt_ead_end_date: optEadEndDate },
    dedupe: { kind: "stem_opt_window" },
  });
}
