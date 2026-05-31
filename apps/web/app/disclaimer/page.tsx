import { Metadata } from "next";
import Link from "next/link";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { COMPANY, LEGAL_CONTACT } from "@/lib/legal/legal-config";

export const metadata: Metadata = {
  title: "Legal Disclaimer | TrackMyOPT",
  description: "Important limitations of TrackMyOPT — not legal advice, not government-affiliated.",
  alternates: { canonical: "https://www.trackmyopt.com/disclaimer" },
};

export default function DisclaimerPage() {
  return (
    <LegalPageShell title="Legal Disclaimer" policyType="disclaimer">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-5 rounded-xl not-prose mb-8">
        <p className="text-yellow-900 dark:text-yellow-100 font-semibold m-0">
          TrackMyOPT is software only. It is not legal advice, not immigration advice, and not affiliated with USCIS, DHS, SEVP, ICE, any university, any DSO, or any government agency.
        </p>
      </div>

      <h2>1. Not a law firm; no attorney-client relationship</h2>
      <p>
        {COMPANY.legalName} operates {COMPANY.productName} as a technology platform. We are <strong>not</strong> a law firm and do not provide legal or immigration advice. Using the Service does not create an attorney-client relationship with us or any attorney unless you separately engage a licensed professional.
      </p>

      <h2>2. No government affiliation or endorsement</h2>
      <p>
        {COMPANY.productName} is an independent product. We are <strong>not</strong> affiliated with, endorsed by, or operated by USCIS, DHS, SEVP, ICE, the U.S. Department of State, any school, any Designated School Official (DSO), or any employer unless we explicitly state otherwise in writing.
      </p>

      <h2>3. Information may be incomplete or outdated</h2>
      <p>
        Immigration rules, forms, processing times, and USCIS case statuses change frequently. Data from public sources, third parties, or user input may be delayed, incomplete, or inaccurate. <strong>Always verify</strong> deadlines, eligibility, and case information with official sources (e.g.{" "}
        <a href="https://www.uscis.gov" target="_blank" rel="noopener noreferrer">uscis.gov</a>, SEVP, your DSO, and your employer).
      </p>

      <h2>4. No guarantee of outcome</h2>
      <p>We do not guarantee any immigration result, including:</p>
      <ul>
        <li>OPT/STEM OPT approval or timely processing</li>
        <li>Accuracy of deadlines, unemployment day counts, or reminders</li>
        <li>Employment authorization, visa status, or H-1B outcomes</li>
        <li>Success of any filing, travel, or employment decision</li>
      </ul>

      <h2>5. Your responsibility</h2>
      <p>You are solely responsible for:</p>
      <ul>
        <li>Verifying all dates, forms, and requirements before acting</li>
        <li>Timely filings and communications with USCIS, your DSO, and your employer</li>
        <li>Decisions you make based on the Service, emails, or reminders</li>
        <li>Documents you upload, store, or share</li>
      </ul>

      <h2>6. Software tools and reminders only</h2>
      <p>
        Calculators, timelines, case status displays, and notifications are organizational aids. They can fail due to bugs, outages, or incorrect input. Do not rely on them as your only source for compliance decisions.
      </p>

      <h2>7. AI-generated content</h2>
      <p>
        Some features may use artificial intelligence (e.g. resume suggestions). AI output can be wrong, incomplete, or inappropriate. <strong>Review all AI output yourself.</strong> It is not legal, immigration, or professional advice.
      </p>

      <h2>8. Dedicated plan attorney benefit</h2>
      <p>
        If your plan includes access to an independent immigration attorney, that attorney is not our employee. Session terms, scope, and fees beyond included benefits are between you and the attorney. See <Link href="/terms">Terms of Service</Link> and <Link href="/refund-policy">Refund Policy</Link>.
      </p>

      <h2>9. Urgent matters</h2>
      <p>
        For urgent immigration issues (e.g. status violations, denials, removal risk), contact a <strong>licensed immigration attorney</strong>, your <strong>DSO</strong>, your <strong>employer</strong>, or the relevant <strong>government agency</strong> promptly. Do not delay seeking professional help because of information in this product.
      </p>

      <h2>10. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, {COMPANY.legalName} is not liable for indirect, incidental, or consequential damages arising from use of the Service, including missed deadlines or immigration harm. See <Link href="/terms">Terms of Service</Link> for full warranty and liability terms.
      </p>

      <p className="text-sm">
        Questions: <a href={`mailto:${LEGAL_CONTACT.support}`}>{LEGAL_CONTACT.support}</a>
      </p>
    </LegalPageShell>
  );
}
