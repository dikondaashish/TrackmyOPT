/**
 * Deadline alerts driven by the user's immigration timeline rather than by
 * product engagement.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { formatStemDate, getStemFilingEmailDetails, renderStemFilingTimeline } from "../stem-filing-email";
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

export function buildStemOptWindowEmailBodies(args: {
  firstName: string | null;
  optEadEndDate: string;
  stemDsoRecommendationDate?: string | null;
}) {
  const details = getStemFilingEmailDetails(args.optEadEndDate, args.stemDsoRecommendationDate);
  const dashUrl = `${getStemOptDashboardBaseUrl()}/dashboard`;
  const subject = details.deadlinePassed
    ? "Your STEM OPT filing deadline has passed — contact your DSO"
    : details.notYetOpen
      ? "Your STEM OPT filing window is approaching"
      : "Your STEM OPT filing dates — review your deadline";
  const requirements = [
    "Complete Form I-983 with your employer and submit it to your DSO before requesting the STEM recommendation.",
    "Confirm your employer participates in E-Verify.",
    "File Form I-765 up to 90 days before your OPT EAD expires and within 60 days of your DSO entering the STEM recommendation in SEVIS. The earlier deadline controls.",
    "A timely and properly filed STEM OPT application may extend work authorization for up to 180 days while pending, ending sooner if USCIS decides the application.",
  ];
  const html = buildTransactionalEmail({
    headerTitle: "STEM OPT extension window",
    bodyHtml: `
${emailBodySectionOpen()}
${emailTextLead(escapeHtml(subject))}
${emailTextP(args.firstName ? `Hi ${escapeHtml(args.firstName)},` : "Hi,")}
${renderStemFilingTimeline(details)}
${emailTextLead("STEM OPT filing requirements")}
${emailTextList(requirements.map(escapeHtml), { ordered: true })}
${emailPrimaryButton(dashUrl, "Open my dashboard")}
${emailTextMuted(`Questions? Contact <a href="mailto:${LEGAL_CONTACT.support}" style="color:${EMAIL.link};">${LEGAL_CONTACT.support}</a>`)}
${emailBodySectionClose()}`,
  });
  const text = `${args.firstName ? `Hi ${args.firstName},` : "Hi,"}

${subject}

Earliest filing date: ${formatStemDate(details.earliestFile)}
OPT EAD expiration: ${formatStemDate(details.eadExpirationDate)}
STEM DSO recommendation date: ${details.recommendationDate ? formatStemDate(details.recommendationDate) : "Not saved"}
DSO recommendation deadline (60 days): ${details.recommendationDeadline ? formatStemDate(details.recommendationDeadline) : "Unknown"}
${details.deadlineIsEstimate ? "Estimated filing deadline (EAD only)" : "Effective filing deadline"}: ${formatStemDate(details.hardDeadline)}

${details.message}

${requirements.map((item, index) => `${index + 1}. ${item}`).join("\n\n")}

Track your STEM OPT timeline: ${dashUrl}

Questions? Contact ${LEGAL_CONTACT.support}`;
  return { subject, html, text };
}

/** The original queue/dedup policy also applies to DSO-limited window alerts. */
export async function sendStemOptWindowEmail(args: {
  supabase: SupabaseClient;
  userId: string;
  toEmail: string;
  firstName: string | null;
  optEadEndDate: string;
  stemDsoRecommendationDate?: string | null;
}): Promise<QueueTransactionalResult> {
  const bodies = buildStemOptWindowEmailBodies(args);
  return queueTransactionalEmailSend({
    supabase: args.supabase,
    userId: args.userId,
    emailAddress: args.toEmail,
    emailType: "stem_opt_window_open",
    ...bodies,
    emailData: {
      opt_ead_end_date: args.optEadEndDate,
      stem_dso_recommendation_date: args.stemDsoRecommendationDate ?? null,
    },
    dedupe: { kind: "stem_opt_window" },
  });
}
