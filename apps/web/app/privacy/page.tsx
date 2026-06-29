import { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { COMPANY, LEGAL_CONTACT, THIRD_PARTY_SERVICES } from "@/lib/legal/legal-config";

export const metadata: Metadata = {
  title: "Privacy Policy | TrackMyOPT",
  description: "How TrackMyOPT collects, uses, and protects your information.",
  alternates: { canonical: "https://www.trackmyopt.com/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy" policyType="privacy_policy">
      <h2>1. Who we are</h2>
      <p>
        {COMPANY.productName} is a software product of <strong>{COMPANY.legalName}</strong> ({COMPANY.stateOfIncorporation}), with offices in {COMPANY.headquarters}. This Privacy Policy explains how we handle personal information when you use our website, web app, Chrome extension, and related services (the &quot;Service&quot;).
      </p>
      <p>
        Contact: <a href={`mailto:${LEGAL_CONTACT.support}`}>{LEGAL_CONTACT.support}</a> (general) ·{" "}
        <a href={`mailto:${LEGAL_CONTACT.privacy}`}>{LEGAL_CONTACT.privacy}</a> (privacy requests)
      </p>

      <h2>2. Information we collect</h2>
      <h3>2.1 Account information</h3>
      <ul>
        <li>Email address, name (if provided), and authentication credentials (passwords are hashed; we do not store plain-text passwords)</li>
        <li>Sign-in method (email/password or Google OAuth)</li>
        <li>Account settings and preferences</li>
      </ul>

      <h3>2.2 Immigration and workflow information you provide</h3>
      <p>You may voluntarily enter information to use OPT/STEM OPT tools, for example:</p>
      <ul>
        <li>Program end dates, OPT/STEM OPT start and end dates, DSO recommendation dates</li>
        <li>Employment history, unemployment tracking inputs, and related notes</li>
        <li>USCIS receipt numbers for case status tracking</li>
        <li>
          Case status text, descriptions, and status history returned via USCIS Case Status API access
        </li>
      </ul>
      <p>
        This information can be sensitive. We use it only to provide the features you request (timelines, reminders, dashboards, notifications).
      </p>

      <h3>2.3 Documents and files</h3>
      <p>
        Premium users may upload files to the document vault (e.g. immigration-related PDFs or images). Files are stored using our cloud infrastructure (Supabase Storage). The vault is protected by an optional account passcode (stored as a hash).{" "}
        <strong>The passcode controls access in the product; it is not end-to-end encryption.</strong> If you reset a forgotten passcode, existing vault files may be removed per our recovery policy.
      </p>

      <h3>2.4 Payment and billing</h3>
      <p>
        Paid subscriptions are processed by <strong>Stripe</strong>. We receive subscription status, customer IDs, and transaction metadata from Stripe. We do <strong>not</strong> store full payment card numbers on our servers.
      </p>

      <h3>2.5 Communications</h3>
      <ul>
        <li>Transactional emails (welcome, billing, case status, reminders, support replies)</li>
        <li>Email addresses and message metadata in our email queue logs</li>
        <li>Information you send via contact or support forms</li>
      </ul>

      <h3>2.6 Device, log, and usage data</h3>
      <ul>
        <li>IP address, browser type, device information, and timestamps (security and abuse prevention)</li>
        <li>Authentication session cookies (see <Link href="/cookie-policy">Cookie Policy</Link>)</li>
        <li>
          Optional analytics (PostHog) when enabled in our deployment. PostHog analytics, when enabled, may collect usage events such as feature interactions and page visits to help us improve the product. PostHog does not use this data for advertising targeting. You may contact{" "}
          <a href={`mailto:${LEGAL_CONTACT.privacy}`}>{LEGAL_CONTACT.privacy}</a> to request opt-out.
        </li>
        <li>
          <strong>Google Analytics (GA4)</strong> — when you accept cookies in our banner, we load GA4 to collect aggregated website traffic and usage data (e.g. pages visited, session duration). See{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google&apos;s Privacy Policy</a>.
        </li>
        <li>
          <strong>Google AdSense</strong> — when you accept cookies in our banner, we may display ads via AdSense on free content pages. AdSense may use cookies for ad delivery and measurement. See{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google&apos;s Privacy Policy</a>.
        </li>
        <li>Aggregated performance metrics (Vercel Analytics / Speed Insights) on our website</li>
        <li>Chrome extension: version, timezone, and sync storage for sign-in state (see extension permissions)</li>
      </ul>

      <h3>2.7 AI-assisted features</h3>
      <p>
        If you use resume or document AI features, content you submit may be sent to our AI provider (e.g. Google Gemini) to generate output. Do not submit information you are not comfortable sharing with that provider. AI output is not legal advice.
      </p>

      <h2>3. How we use information</h2>
      <ul>
        <li>Provide, operate, and improve the Service</li>
        <li>Calculate timelines, unemployment tracking, and reminders</li>
        <li>Check USCIS case status when you provide a receipt number</li>
        <li>Process subscriptions and send billing-related communications</li>
        <li>Authenticate users and protect against fraud or abuse</li>
        <li>Respond to support requests and enforce our Terms</li>
        <li>Comply with law and protect our rights</li>
      </ul>

      <h2>4. How we share information</h2>
      <p>
        <strong>We do not sell your personal information.</strong> We share information only with:
      </p>
      <ul>
        {THIRD_PARTY_SERVICES.map((s) => (
          <li key={s.name}>
            <strong>{s.name}</strong> — {s.purpose}
            {s.privacyUrl ? (
              <>
                {" "}
                (<a href={s.privacyUrl} target="_blank" rel="noopener noreferrer">privacy policy</a>)
              </>
            ) : null}
          </li>
        ))}
      </ul>
      <p>We may also disclose information if required by law, court order, or to protect safety and rights.</p>
      <p>
        If TrackMyOPT is involved in a merger, acquisition, financing, reorganization, bankruptcy, or sale of assets, your information may be transferred as part of that transaction. We will provide notice before your personal information becomes subject to a materially different privacy policy, and you will retain any applicable privacy rights.
      </p>

      <h2>5. Legal bases (EEA/UK users)</h2>
      <p>Where GDPR applies, we rely on consent, contract performance, legitimate interests (security, improvement), and legal obligations as applicable.</p>

      <h2>6. Data retention</h2>
      <ul>
        <li>Account data: retained while your account is active</li>
        <li>After account deletion: we delete or anonymize personal data within a reasonable period (typically within 30 days), subject to backups and legal holds</li>
        <li>Billing records: retained as needed for tax, accounting, and dispute resolution</li>
        <li>Consent and checkout audit logs: retained for dispute evidence and compliance</li>
      </ul>
      <p>
        For accounts inactive for 24 months with no subscription activity, we may send notice to the email address on your account. If you do not reactivate or respond within 30 days, we may delete account data, subject to legal, billing, security, fraud-prevention, and audit-retention requirements.
      </p>

      <h2>7. Security</h2>
      <p>
        We use industry-standard measures including TLS in transit, access controls, and Row Level Security on our database where configured. No method of transmission or storage is 100% secure. See our <Link href="/security">Security</Link> page for an overview.
      </p>
      <p>
        If we become aware of a security breach that may have compromised personal information, we will notify affected users by email and notify applicable authorities as required by applicable law.
      </p>

      <h2>8. Your choices and rights</h2>
      <ul>
        <li><strong>Access / correction:</strong> Update profile and OPT data in Settings</li>
        <li><strong>Deletion:</strong> Delete your account in Settings (or email {LEGAL_CONTACT.privacy})</li>
        <li><strong>Email opt-out:</strong> Unsubscribe links in marketing emails; manage notification preferences in Settings</li>
        <li><strong>California (CCPA/CPRA):</strong> Right to know, delete, correct, and opt out of sale/sharing (we do not sell personal information)</li>
        <li><strong>EEA/UK (GDPR):</strong> Rights to access, rectification, erasure, restriction, portability, and objection where applicable</li>
      </ul>
      <p>
        To exercise rights, email <a href={`mailto:${LEGAL_CONTACT.privacy}`}>{LEGAL_CONTACT.privacy}</a>. We may verify your identity before responding.
      </p>

      <h2>9. Children</h2>
      <p>
        The Service is intended for users 18 and older (typical F-1/OPT audience). We do not knowingly collect personal information from children under 13. Contact us if you believe a child has provided data.
      </p>

      <h2>10. International transfers</h2>
      <p>
        We are based in the United States. If you access the Service from outside the U.S., your information may be processed in the U.S. and other countries where our providers operate.
      </p>

      <h2>11. Changes to this policy</h2>
      <p>
        We may update this Privacy Policy. We will update the date and version at the top. For material changes, we will provide notice (e.g. email or in-app) when appropriate. For material changes to this Privacy Policy or our Terms that require consent, we may request active consent before the changes apply to your continued use of TrackMyOPT.
      </p>

      <h2>12. Related policies</h2>
      <p>
        <Link href="/terms">Terms of Service</Link> · <Link href="/disclaimer">Disclaimer</Link> ·{" "}
        <Link href="/cookie-policy">Cookie Policy</Link> · <Link href="/refund-policy">Refund Policy</Link>
      </p>
    </LegalPageShell>
  );
}
