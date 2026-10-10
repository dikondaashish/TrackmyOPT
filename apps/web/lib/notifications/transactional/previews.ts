/** QA fixtures call the production builders; rendering never sends mail. */
import {
  buildPaymentFailedEmailBodies,
  buildRefundProcessedEmailBodies,
  buildSubscriptionEndedEmailBodies,
  buildCancellationConfirmedEmailBodies,
  buildSubscriptionReceiptEmailBodies,
  buildUnusedCancelWinbackEmailBodies,
} from './billing';
import {
  buildTrialEndingEmailBodies,
  buildTrialStartedEmailBodies,
} from './trials';
import {
  buildPremiumWelcomeEmailBodies,
  buildWelcomeFreeEmailBodies,
} from './onboarding';
import {
  buildMaterialPolicyChangeEmailBodies,
  buildContactReceivedEmailBodies,
  buildDedicatedConsultationReceivedEmailBodies,
  buildInternalContactFormEmailBodies,
  buildInternalPartnershipEmailBodies,
  buildInternalDedicatedConsultationEmailBodies,
} from './internal';
import { buildStemOptWindowEmailBodies } from './alerts';
import {
  buildCheckoutRecoveryEmailBodies,
  buildFreeReceiptReengagementEmailBodies,
  buildAtRiskReengagementEmailBodies,
  buildD1ActivationNudgeEmailBodies,
} from './reengagement';

export type EmailPreviewItem = {
  id: string;
  category: string;
  subject: string;
  html: string;
  text?: string;
};

export function getTransactionalEmailPreviews(
  firstName = 'Alex'
): EmailPreviewItem[] {
  const item = (
    id: string,
    category: string,
    bodies: { subject: string; html: string; text?: string }
  ) => ({ id, category, ...bodies });
  const sample = {
    submissionId: 'preview-0001',
    name: firstName,
    email: 'student@example.com',
    message: 'Please help me review my saved reminders.',
    createdAtIso: '2026-10-10T12:00:00Z',
  };
  return [
    item(
      'payment_failed',
      'Billing',
      buildPaymentFailedEmailBodies({
        firstName,
        planLabel: 'TrackMyOPT Pro',
        amountCents: 1900,
        currency: 'usd',
      })
    ),
    item(
      'subscription_ended',
      'Billing',
      buildSubscriptionEndedEmailBodies({
        firstName,
        accessEndedDate: 'October 31, 2026',
      })
    ),
    item('welcome_free', 'Onboarding', buildWelcomeFreeEmailBodies(firstName)),
    item(
      'refund_processed',
      'Billing',
      buildRefundProcessedEmailBodies({
        firstName,
        amountCents: 1900,
        currency: 'usd',
      })
    ),
    item(
      'premium_welcome',
      'Onboarding',
      buildPremiumWelcomeEmailBodies(firstName)
    ),
    item(
      'trial_ending',
      'Billing',
      buildTrialEndingEmailBodies({
        firstName,
        trialEndDate: 'October 17, 2026',
      })
    ),
    item(
      'trial_started',
      'Billing',
      buildTrialStartedEmailBodies({
        firstName,
        trialEndDate: 'October 17, 2026',
      })
    ),
    item(
      'subscription_cancel_confirmed',
      'Billing',
      buildCancellationConfirmedEmailBodies({
        firstName,
        accessThroughDate: 'October 31, 2026',
        nextChargeDate: null,
      })
    ),
    item(
      'subscription_cancel_scheduled_charge',
      'Billing',
      buildCancellationConfirmedEmailBodies({
        firstName,
        accessThroughDate: 'October 31, 2026',
        nextChargeDate: 'October 17, 2026',
      })
    ),
    item(
      'subscription_receipt',
      'Billing',
      buildSubscriptionReceiptEmailBodies({
        firstName,
        planLabel: 'TrackMyOPT Pro',
        amountFormatted: '$19.00',
        billingInterval: 'monthly',
        periodEndDate: 'October 31, 2026',
      })
    ),
    item(
      'unused_cancel_winback',
      'Reengagement',
      buildUnusedCancelWinbackEmailBodies({ firstName })
    ),
    item(
      'checkout_recovery_fresh',
      'Reengagement',
      buildCheckoutRecoveryEmailBodies(firstName)
    ),
    item(
      'checkout_recovery_open',
      'Reengagement',
      buildCheckoutRecoveryEmailBodies(firstName, {
        checkoutUrl: 'https://checkout.stripe.com/c/pay/preview',
        resumeKind: 'open_session',
      })
    ),
    item(
      'free_receipt_reengagement',
      'Reengagement',
      buildFreeReceiptReengagementEmailBodies(firstName)
    ),
    item(
      'at_risk_reengagement',
      'Reengagement',
      buildAtRiskReengagementEmailBodies(firstName)
    ),
    ...[false, true].map((hasCaseStatus) =>
      item(
        `d1_activation_${hasCaseStatus ? 'case' : 'no_case'}`,
        'Reengagement',
        buildD1ActivationNudgeEmailBodies({
          firstName,
          hasCaseStatus,
          caseStatusText: hasCaseStatus ? 'Case Was Received' : null,
          optHeadline: null,
        })
      )
    ),
    item(
      'd1_activation_opt',
      'Reengagement',
      buildD1ActivationNudgeEmailBodies({
        firstName,
        hasCaseStatus: false,
        caseStatusText: null,
        optHeadline: 'Your OPT filing window is approaching',
      })
    ),
    item(
      'material_policy_change',
      'Compliance',
      buildMaterialPolicyChangeEmailBodies({
        firstName,
        effectiveDate: 'November 1, 2026',
        changeSummary: 'Sample summary: renewal and refund terms clarified.',
        policyVersion: 'sample-preview',
      })
    ),
    item(
      'contact_received',
      'Support',
      buildContactReceivedEmailBodies({ name: firstName })
    ),
    item(
      'dedicated_consultation_received',
      'Support',
      buildDedicatedConsultationReceivedEmailBodies({
        topic: 'Review a saved case notice',
      })
    ),
    item(
      'stem_opt_window_open',
      'Cron',
      buildStemOptWindowEmailBodies({
        firstName,
        optEadEndDate: '2026-11-30',
        stemDsoRecommendationDate: '2026-10-01',
      })
    ),
    item(
      'internal_contact_form',
      'Internal (to support)',
      buildInternalContactFormEmailBodies({
        ...sample,
        subject: 'Saved reminder question',
        userId: null,
      })
    ),
    item(
      'internal_partnership',
      'Internal (to support)',
      buildInternalPartnershipEmailBodies({
        ...sample,
        university: 'Sample University',
        role: 'Student services',
      })
    ),
    item(
      'internal_dedicated_consultation',
      'Internal (to support)',
      buildInternalDedicatedConsultationEmailBodies({
        requestId: 'preview-0001',
        userId: 'preview-user',
        email: sample.email,
        topic: 'Saved case notice',
        summary: sample.message,
        availability: 'Weekdays, Eastern Time',
        caseId: null,
        caseCategory: null,
        createdAtIso: sample.createdAtIso,
      })
    ),
  ];
}
