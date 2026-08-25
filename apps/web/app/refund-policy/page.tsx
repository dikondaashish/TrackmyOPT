import { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import {
  DEDICATED_MONEY_BACK_DAYS,
  LEGAL_CONTACT,
  PLAN_DISPLAY_PRICES,
  PRO_PAID_INTRO_PRICE,
  PRO_PAID_INTRO_REFUND_DAYS,
  PRO_TRIAL_DAYS,
} from "@/lib/legal/legal-config";

export const metadata: Metadata = {
  title: "Refund Policy | TrackMyOPT",
  description: "Subscription refunds, paid introductory offers, and cancellation for TrackMyOPT.",
  alternates: { canonical: "https://www.trackmyopt.com/refund-policy" },
};

export default function RefundPolicyPage() {
  return (
    <LegalPageShell title="Refund Policy" policyType="refund_policy">
      <h2>1. Overview</h2>
      <p>
        This Refund Policy applies to paid subscriptions for TrackMyOPT (operated by Zyene, Inc.). All payments are processed by <strong>Stripe</strong>. By subscribing, you agree to this policy and our{" "}
        <Link href="/terms">Terms of Service</Link>.
      </p>

      <h2>2. Plans and pricing (USD)</h2>
      <ul>
        <li>
          <strong>Pro</strong> — eligible accounts pay ${PRO_PAID_INTRO_PRICE.toFixed(2)} for the first {PRO_TRIAL_DAYS} days, then auto-renew at ${PLAN_DISPLAY_PRICES.pro.month}/month or ${PLAN_DISPLAY_PRICES.pro.year}/year unless canceled. This is a paid introduction, not a free trial.
        </li>
        <li>
          <strong>Dedicated</strong> — ${PLAN_DISPLAY_PRICES.dedicated.month}/month or ${PLAN_DISPLAY_PRICES.dedicated.year}/year. Includes a {DEDICATED_MONEY_BACK_DAYS}-day money-back guarantee on the first Dedicated subscription charge only. Subscribers may switch to Pro at any time in the dashboard.
        </li>
      </ul>
      <p>Exact amounts and discounts shown at checkout before you pay.</p>

      <h2>3. Pro paid introductory offer and refund window</h2>
      <p>
        The ${PRO_PAID_INTRO_PRICE.toFixed(2)} Pro offer is available once per eligible account. Contact <a href={`mailto:${LEGAL_CONTACT.support}`}>{LEGAL_CONTACT.support}</a> from your account email during the first {PRO_PAID_INTRO_REFUND_DAYS} days to request a refund of that ${PRO_PAID_INTRO_PRICE.toFixed(2)} charge. After the introductory period ends, Pro renews at the price and interval accepted at checkout. Those recurring charges are not refundable for change of mind. Accounts that already used the offer are charged the regular subscription price immediately. Free trials granted before this policy version remain governed by their original checkout terms.
      </p>

      <h2>4. Dedicated money-back guarantee (first subscription charge only)</h2>
      <p>
        Dedicated includes a <strong>{DEDICATED_MONEY_BACK_DAYS}-day money-back guarantee</strong> on your <strong>first Dedicated subscription charge only</strong>, whether you selected monthly or annual billing. Contact{" "}
        <a href={`mailto:${LEGAL_CONTACT.support}`}>{LEGAL_CONTACT.support}</a> within {DEDICATED_MONEY_BACK_DAYS} days of that charge if the product is not right for you.
      </p>

      <h2>5. No refunds after the applicable window</h2>
      <p>
        After the Pro {PRO_PAID_INTRO_REFUND_DAYS}-day paid introductory window, or after the Dedicated {DEDICATED_MONEY_BACK_DAYS}-day first-charge window, we do <strong>not</strong> provide refunds for change of mind, unused time, or partial billing periods (including annual plans), except where required by law or for a confirmed billing error or unauthorized charge.
      </p>

      <h2>6. Cancellation vs. refunds</h2>
      <p>
        <strong>Cancellation</strong> stops future renewal charges. It does not automatically refund past charges. You keep access through the end of your current paid or introductory period unless we state otherwise.
      </p>
      <ol>
        <li>Sign in → Settings → Subscription &amp; Billing</li>
        <li>Click <strong>Cancel subscription</strong> (Stripe Customer Portal)</li>
        <li>Confirm cancellation — we email your access end date when applicable</li>
      </ol>

      <h2>7. How to request a refund</h2>
      <p>
        Email <a href={`mailto:${LEGAL_CONTACT.support}`}>{LEGAL_CONTACT.support}</a> from your account email with:
      </p>
      <ul>
        <li>Reason for the request</li>
        <li>Date and amount of the charge (Stripe receipt helps)</li>
        <li>Whether you qualify under the Pro or Dedicated guarantee, or an exception below</li>
      </ul>

      <h2>8. Processing time</h2>
      <p>
        Approved refunds are submitted to Stripe within 5–10 business days. Your bank may take additional time to post the credit (often 5–10 business days).
      </p>

      <h2>9. Exceptions (at our discretion)</h2>
      <ul>
        <li><strong>Billing errors</strong> — duplicate or incorrect charges after a valid cancellation</li>
        <li><strong>Unauthorized or fraudulent charges</strong> — contact us and your card issuer promptly</li>
      </ul>

      <h2>10. Chargebacks and disputes</h2>
      <p>
        If you dispute a charge with your bank before contacting us, we may provide Stripe and your bank with records of your subscription consent, checkout disclosures, emails, and usage to respond to the dispute. Fraudulent chargebacks may result in account closure.
      </p>

      <h2>11. Failed payments</h2>
      <p>
        If a renewal payment fails, Stripe may retry. We may email you to update your payment method. Access may continue during a grace period; see Terms for termination rules.
      </p>

      <h2>12. Material policy changes</h2>
      <p>
        If we materially change refund, introductory-offer, or billing terms, we will notify active subscribers in advance when required or appropriate.
      </p>

      <p className="text-sm text-muted-foreground">
        Questions: <a href={`mailto:${LEGAL_CONTACT.support}`}>{LEGAL_CONTACT.support}</a>
      </p>
    </LegalPageShell>
  );
}
