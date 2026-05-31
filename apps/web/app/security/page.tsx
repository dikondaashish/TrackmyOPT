import { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { COMPANY, LEGAL_CONTACT } from "@/lib/legal/legal-config";

export const metadata: Metadata = {
  title: "Security | TrackMyOPT",
  description: "Security practices for TrackMyOPT.",
  alternates: { canonical: "https://www.trackmyopt.com/security" },
};

export default function SecurityPage() {
  return (
    <LegalPageShell title="Security" policyType="security_page">
      <p>
        We take reasonable steps to protect information in {COMPANY.productName}. This page summarizes our approach; it is not a guarantee against all risks.
      </p>

      <h2>1. Infrastructure</h2>
      <ul>
        <li>Hosted on modern cloud providers (e.g. Vercel for the web app, Supabase for data and auth)</li>
        <li>HTTPS/TLS for data in transit between your browser and our servers</li>
        <li>Database Row Level Security (RLS) so users can access only their own rows where enabled</li>
      </ul>

      <h2>2. Authentication</h2>
      <ul>
        <li>Passwords hashed with industry-standard algorithms (via Supabase Auth)</li>
        <li>Optional Google OAuth sign-in</li>
        <li>Document vault optional 6-digit passcode (hashed; not full-disk encryption)</li>
      </ul>

      <h2>3. Payments</h2>
      <p>
        Card payments are handled by <strong>Stripe</strong>. Payment card details are entered on Stripe&apos;s secure flows; we do not store full card numbers on our servers.
      </p>

      <h2>4. Sensitive immigration data</h2>
      <p>
        Receipt numbers, OPT dates, and uploaded documents are sensitive. Limit what you upload. Use a strong account password and do not share your vault passcode.
      </p>

      <h2>5. Monitoring and incidents</h2>
      <p>
        We use logging and optional analytics to detect abuse and outages. If we become aware of a breach affecting your personal information, we will notify affected users and authorities as required by law.
      </p>

      <h2>6. Your role</h2>
      <ul>
        <li>Use a unique, strong password</li>
        <li>Sign out on shared devices</li>
        <li>Report suspicious activity to {LEGAL_CONTACT.support}</li>
      </ul>

      <h2>7. Vulnerability reports</h2>
      <p>
        If you believe you found a security issue, email <a href={`mailto:${LEGAL_CONTACT.support}`}>{LEGAL_CONTACT.support}</a> with details. Please do not publicly disclose unresolved critical issues without giving us reasonable time to respond.
      </p>

      <p>
        <Link href="/privacy">Privacy Policy</Link> · <Link href="/terms">Terms of Service</Link>
      </p>
    </LegalPageShell>
  );
}
