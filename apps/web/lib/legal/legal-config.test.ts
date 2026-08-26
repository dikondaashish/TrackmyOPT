import { describe, expect, it } from 'vitest';
import {
  buildCheckoutDisclosures,
  CASE_STATUS_DISCLAIMER,
  DEDICATED_MONEY_BACK_DAYS,
  DEDICATED_CONSULTATION_MINUTES,
  EXTENSION_AUTOFILL_PRIVACY_DISCLOSURE,
  EXTENSION_AUTOFILL_SUPPORT_NOTICE,
  getPricingModalDedicatedConsentLabel,
  getPricingModalProConsentLabel,
  LEGAL_FOOTER_LINKS,
  LEGAL_POLICY_VERSIONS,
  PLAN_DISPLAY_PRICES,
  PRIVACY_CHOICES_VERSION_ID,
  PRO_PAID_INTRO_PRICE,
  PRO_PAID_INTRO_REFUND_DAYS,
  PRO_TRIAL_DAYS,
  USCIS_API_DISCLOSURE,
  formatPolicyVersionLabel,
} from './legal-config';

describe('legal-config', () => {
  it('uses consistent policy version ids', () => {
    expect(LEGAL_POLICY_VERSIONS.refund_policy).toBe(
      LEGAL_POLICY_VERSIONS.terms_of_service
    );
  });

  it('dates the attorney-reviewed privacy choices disclosures independently', () => {
    expect(LEGAL_POLICY_VERSIONS.privacy_policy).toBe(
      PRIVACY_CHOICES_VERSION_ID
    );
    expect(LEGAL_POLICY_VERSIONS.cookie_policy).toBe(
      PRIVACY_CHOICES_VERSION_ID
    );
    expect(formatPolicyVersionLabel('cookie_policy')).toContain(
      'July 26, 2026'
    );
  });

  it('builds Pro paid introductory disclosures', () => {
    const d = buildCheckoutDisclosures({
      planId: 'pro',
      interval: 'year',
      includeProIntro: true,
    });
    expect(d.headline).toContain('auto-renewing');
    expect(d.introLine).toContain(String(PRO_TRIAL_DAYS));
    expect(d.introLine).toContain(PRO_PAID_INTRO_PRICE.toFixed(2));
    expect(d.introLine).toContain('not a free trial');
    expect(d.proRefundLine).toContain(String(PRO_PAID_INTRO_REFUND_DAYS));
    expect(d.consentLabel).toContain('Privacy Policy');
  });

  it('builds dedicated disclosures with money-back note', () => {
    const d = buildCheckoutDisclosures({
      planId: 'dedicated',
      interval: 'month',
      includeProIntro: false,
    });
    expect(d.dedicatedRefundLine).toContain(String(DEDICATED_MONEY_BACK_DAYS));
    expect(d.dedicatedConsultationLine).toContain(
      String(DEDICATED_CONSULTATION_MINUTES)
    );
    expect(d.introLine).toBeNull();
    expect(d.consentLabel).toContain('Refund Policy');
    expect(d.consentLabel).toContain('Privacy Policy');
  });

  it('exposes USCIS API disclosure without authorized-access or endorsement wording', () => {
    const lower = USCIS_API_DISCLOSURE.toLowerCase();
    expect(lower).not.toContain('authorized access');
    expect(lower).not.toMatch(/uscis approved/);
    expect(lower).toContain('uscis case status api access');
    expect(lower).toContain('not affiliated');
  });

  it('case-status disclaimer matches attorney-approved wording', () => {
    expect(CASE_STATUS_DISCLAIMER).toContain(
      'Case status information is provided for convenience'
    );
    expect(CASE_STATUS_DISCLAIMER).toContain('licensed immigration attorney');
  });

  it('footer includes security and contact', () => {
    const labels = LEGAL_FOOTER_LINKS.map((l) => l.href);
    expect(labels).toContain('/security');
    expect(labels).toContain('/contact');
  });

  it('discloses the shared default portal login and its safety boundaries', () => {
    expect(EXTENSION_AUTOFILL_PRIVACY_DISCLOSURE).toContain(
      'one default job-portal login'
    );
    expect(EXTENSION_AUTOFILL_PRIVACY_DISCLOSURE).toContain(
      'regardless of hostname'
    );
    expect(EXTENSION_AUTOFILL_PRIVACY_DISCLOSURE).toContain(
      'if any one portal is compromised'
    );
    expect(EXTENSION_AUTOFILL_PRIVACY_DISCLOSURE).toContain(
      'never uses this credential on TrackMyOPT pages'
    );
    expect(EXTENSION_AUTOFILL_SUPPORT_NOTICE).toContain(
      'requires approval in the extension for every application'
    );
    expect(EXTENSION_AUTOFILL_SUPPORT_NOTICE).toContain(
      'never clicks Login, Continue, Next, Create Account, or Submit'
    );
  });

  it('pricing modal Pro consent explains the once-per-account paid introduction', () => {
    const label = getPricingModalProConsentLabel({
      interval: 'month',
      monthlyPrice: PLAN_DISPLAY_PRICES.pro.month,
      yearlyPrice: PLAN_DISPLAY_PRICES.pro.year,
      includeIntro: true,
    });
    expect(label).toContain(`$${PRO_PAID_INTRO_PRICE.toFixed(2)} today`);
    expect(label).toContain('renews');
    expect(label).toContain('refundable only during');
    expect(label).not.toContain('auto-converts');
  });

  it('pricing modal Pro annual consent uses yearly price', () => {
    const label = getPricingModalProConsentLabel({
      interval: 'year',
      monthlyPrice: PLAN_DISPLAY_PRICES.pro.month,
      yearlyPrice: PLAN_DISPLAY_PRICES.pro.year,
      includeIntro: false,
    });
    expect(label).toContain('/year');
    expect(label).toContain('$49.99/year');
  });

  it('pricing modal Dedicated consent discloses charge and consultation benefit', () => {
    const monthly = getPricingModalDedicatedConsentLabel({
      interval: 'month',
      monthlyPrice: PLAN_DISPLAY_PRICES.dedicated.month,
      yearlyPrice: PLAN_DISPLAY_PRICES.dedicated.year,
    });
    expect(monthly).toContain('charged today');
    expect(monthly).toContain('renews monthly');
    expect(monthly).toContain(
      `${DEDICATED_MONEY_BACK_DAYS}-day money-back guarantee`
    );
    expect(monthly).toContain(`${DEDICATED_CONSULTATION_MINUTES}-minute`);
    expect(monthly).toContain('per account');
    expect(monthly).not.toContain('then $');

    const annual = getPricingModalDedicatedConsentLabel({
      interval: 'year',
      monthlyPrice: PLAN_DISPLAY_PRICES.dedicated.month,
      yearlyPrice: PLAN_DISPLAY_PRICES.dedicated.year,
    });
    expect(annual).toContain('charged today');
    expect(annual).toContain('renews annually');
    expect(annual).toContain(
      `${DEDICATED_MONEY_BACK_DAYS}-day money-back guarantee`
    );
    expect(annual).toContain(`${DEDICATED_CONSULTATION_MINUTES}-minute`);
  });
});
