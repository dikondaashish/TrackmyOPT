import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck2,
  ShieldAlert,
  Timer,
} from 'lucide-react';
import { BlogPostSchema } from '@/components/blog/BlogPostSchema';
import { AuthorBio } from '@/components/blog/AuthorBio';
import { BreadcrumbSchema } from '@/components/BreadcrumbSchema';

const CANONICAL =
  'https://www.trackmyopt.com/blog/uscis-deny-without-rfe-policy-2026';
const USCIS_ALERT =
  'https://www.uscis.gov/newsroom/alerts/uscis-to-reduce-frivolous-immigration-benefits-requests-by-reinforcing-evidence-standards';
const USCIS_POLICY_ALERT =
  'https://www.uscis.gov/sites/default/files/document/policy-manual-updates/20260805-EvidentiaryStandards.pdf';
const USCIS_EVIDENCE_GUIDANCE =
  'https://www.uscis.gov/policy-manual/volume-1-part-e-chapter-6';
const ECFR_EVIDENCE_RULE =
  'https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-103/section-103.2';

export const metadata: Metadata = {
  title: 'USCIS Can Deny Without an RFE: August 2026',
  description:
    'USCIS may deny cases without an RFE under its August 5, 2026 policy. Learn who is affected, the response rules, and how to prepare a complete filing now.',
  keywords: [
    'USCIS deny without RFE 2026',
    'USCIS RFE policy August 2026',
    'USCIS Request for Evidence rule',
    'USCIS RFE deadline',
    'OPT application denied without RFE',
    'Form I-765 required evidence',
    'USCIS PA-2026-05',
  ],
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: 'USCIS Can Deny Without an RFE: What Changed August 5, 2026',
    description:
      "USCIS restored officers' discretion to deny incomplete cases without first sending an RFE or NOID. See the verified rule and filing checklist.",
    url: CANONICAL,
    type: 'article',
    images: [
      {
        url: 'https://www.trackmyopt.com/blog/uscis-deny-without-rfe-policy-2026.png',
        width: 1200,
        height: 630,
        alt: 'Immigration application evidence packet beside a completed checklist and deadline warning',
      },
    ],
  },
};

const faqItems = [
  {
    question: 'Did USCIS eliminate Requests for Evidence on August 5, 2026?',
    answer:
      'No. USCIS can still issue an RFE or Notice of Intent to Deny when an officer decides more evidence is appropriate. The change restores broader discretion to deny a benefit request without first issuing either notice when required initial evidence is missing or the filing does not establish eligibility.',
  },
  {
    question: 'Does the new USCIS RFE policy apply to cases already pending?',
    answer:
      'Yes. USCIS states that the guidance took effect immediately and applies to benefit requests pending on August 5, 2026, as well as requests filed on or after that date, unless a regulation or separate USCIS policy provides otherwise.',
  },
  {
    question: 'Will every RFE still provide 12 weeks to respond?',
    answer:
      'No. Twelve weeks is the maximum response period for an RFE, not a guaranteed period. USCIS may set a shorter deadline. A NOID response period cannot exceed 30 days, and the exact deadline printed on the notice controls.',
  },
  {
    question: 'Can USCIS extend an RFE deadline?',
    answer:
      'The governing regulation says additional time to respond to an RFE or NOID may not be granted. Treat the date on the notice as final, organize a complete response early, and seek qualified legal help immediately if the deadline is close or the issue is complex.',
  },
  {
    question: 'What does this policy mean for OPT and STEM OPT applicants?',
    answer:
      'Form I-765 applicants should submit every item required by the current form instructions and their eligibility category, including a timely OPT-endorsed Form I-20 and identity, status, prior-EAD, and category-specific evidence. Do not plan to use an RFE to add a document that should have accompanied the filing.',
  },
];

export default function USCISDenyWithoutRFEPolicyPage() {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://www.trackmyopt.com' },
          { name: 'Blog', url: 'https://www.trackmyopt.com/blog' },
          { name: 'USCIS Denials Without an RFE', url: CANONICAL },
        ]}
      />
      <BlogPostSchema
        title={metadata.title as string}
        description={metadata.description as string}
        publishedDate="2026-08-11"
        modifiedDate="2026-08-11"
        author="TrackMyOPT Immigration Team"
        canonicalUrl={CANONICAL}
        faqItems={faqItems}
      />

      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold mb-4">
          <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-3 py-1 rounded-full">
            Critical USCIS Update
          </span>
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">
            August 2026
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
          USCIS Can Deny Your Case Without an RFE: What Changed August 5, 2026
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
          USCIS restored officers&apos; discretion to deny incomplete
          immigration benefit requests without first giving applicants a chance
          to fix the filing. Here is the verified policy, what online summaries
          get wrong, and how to submit a complete case.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" /> 10 min read
          </span>
          <span>•</span>
          <span>Published August 11, 2026</span>
          <span>•</span>
          <span>Source-checked against USCIS PA-2026-05</span>
        </div>
      </header>

      <figure className="mb-12">
        <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-xl">
          <Image
            src="/blog/uscis-deny-without-rfe-policy-2026.png"
            alt="Immigration application evidence packet beside a completed checklist and deadline warning"
            fill
            sizes="(min-width: 768px) 896px, 100vw"
            className="object-cover"
            priority
          />
        </div>
        <figcaption className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
          Under the August 5 policy, the initial filing must establish
          eligibility without assuming an RFE will cure missing evidence.
        </figcaption>
      </figure>

      <div className="bg-gradient-to-r from-red-50 to-amber-50 dark:from-red-900/20 dark:to-amber-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 mb-10">
        <p className="text-xs font-semibold text-red-700 dark:text-red-300 uppercase tracking-wider mb-2">
          Direct Answer
        </p>
        <p className="text-lg text-gray-800 dark:text-gray-100 font-medium leading-relaxed mb-0">
          Effective August 5, 2026, USCIS officers may deny a pending or newly
          filed benefit request without first issuing a Request for Evidence
          (RFE) or Notice of Intent to Deny (NOID) when required initial
          evidence is missing or the filing does not establish eligibility. RFEs
          still exist, but applicants should no longer treat one as a guaranteed
          second chance.
        </p>
      </div>

      <nav
        className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 mb-12"
        aria-label="Table of contents"
      >
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          In This Guide
        </h2>
        <ol className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-blue-600 dark:text-blue-400">
          <li>
            <a href="#what-changed" className="hover:underline">
              1. What changed on August 5
            </a>
          </li>
          <li>
            <a href="#what-did-not-change" className="hover:underline">
              2. What did not change
            </a>
          </li>
          <li>
            <a href="#before-after" className="hover:underline">
              3. Before-and-after comparison
            </a>
          </li>
          <li>
            <a href="#who-is-affected" className="hover:underline">
              4. Who is affected
            </a>
          </li>
          <li>
            <a href="#filing-checklist" className="hover:underline">
              5. Complete-filing checklist
            </a>
          </li>
          <li>
            <a href="#pending-case" className="hover:underline">
              6. What to do with a pending case
            </a>
          </li>
          <li>
            <a href="#rfe-response" className="hover:underline">
              7. How to respond to an RFE
            </a>
          </li>
          <li>
            <a href="#faq" className="hover:underline">
              8. Frequently asked questions
            </a>
          </li>
        </ol>
      </nav>

      <div className="prose prose-lg prose-longform dark:prose-invert max-w-none prose-a:text-blue-600 dark:prose-a:text-blue-400">
        <section id="what-changed" className="scroll-mt-24">
          <h2>What Changed in the August 5, 2026 USCIS RFE Policy?</h2>
          <p>
            On August 5, 2026, U.S. Citizenship and Immigration Services
            published
            <a href={USCIS_ALERT} target="_blank" rel="noopener noreferrer">
              an official alert explaining its new evidence standards
              <ExternalLink
                className="inline w-4 h-4 ml-1"
                aria-hidden="true"
              />
            </a>
            . The controlling document is
            <a
              href={USCIS_POLICY_ALERT}
              target="_blank"
              rel="noopener noreferrer"
            >
              Policy Alert PA-2026-05
              <ExternalLink
                className="inline w-4 h-4 ml-1"
                aria-hidden="true"
              />
            </a>
            , titled{' '}
            <em>
              Evidence, Requests for Evidence, and Notices of Intent to Deny
            </em>
            .
          </p>
          <p>The policy makes four changes that matter in practice:</p>
          <ol>
            <li>
              <strong>Denial without an RFE or NOID:</strong> If a request does
              not include all required initial evidence, USCIS may issue an
              RFE—or deny for missing evidence or ineligibility without first
              sending one.
            </li>
            <li>
              <strong>Shorter response periods are possible:</strong> An RFE may
              provide less than 12 weeks. Twelve weeks remains the legal
              maximum, not a guaranteed response period. A NOID response period
              cannot exceed 30 days.
            </li>
            <li>
              <strong>International mailing time is reduced:</strong> USCIS no
              longer adds 14 days for notices mailed outside the United States.
              A mailed notice receives the same 3-day addition regardless of
              location.
            </li>
            <li>
              <strong>A partial response can trigger a decision:</strong> Once
              USCIS receives any requested evidence—even an incomplete
              response—it treats the submission as a request to decide the case
              on the record then available.
            </li>
          </ol>

          <div className="not-prose bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-6 rounded-r-xl my-8">
            <div className="flex gap-3">
              <ShieldAlert className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-900 dark:text-red-200 mb-1">
                  The practical safety net is smaller—not completely gone
                </p>
                <p className="text-red-800 dark:text-red-200/80 text-sm mb-0">
                  USCIS may still send an RFE or NOID. The risk is that an
                  officer no longer has to provide that opportunity in the
                  situations covered by the new guidance. Prepare the filing as
                  though no follow-up request will arrive.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="what-did-not-change" className="scroll-mt-24">
          <h2>What Did Not Change?</h2>
          <p>
            The headline “USCIS removed RFEs” is inaccurate. The agency still
            has authority to issue RFEs and NOIDs, and form-specific regulations
            may still require a particular notice or procedure. The policy alert
            also notes that refugee and asylum applications operate under
            different regulations and procedures.
          </p>
          <p>
            The legal authority to deny for missing initial evidence is not new
            either. The
            <a
              href={ECFR_EVIDENCE_RULE}
              target="_blank"
              rel="noopener noreferrer"
            >
              regulation at 8 CFR 103.2(b)(8)
              <ExternalLink
                className="inline w-4 h-4 ml-1"
                aria-hidden="true"
              />
            </a>
            already allowed USCIS to deny, request missing evidence, or issue a
            NOID in specified circumstances. What changed is the agency&apos;s
            instruction to officers: the prior policy generally favored giving a
            curable filing another chance; PA-2026-05 restores broader
            discretion to deny immediately.
          </p>
          <p>
            The no-extension rule is also not new. The regulation already states
            that USCIS cannot grant additional time beyond the deadline in an
            RFE or NOID. The August policy makes the shorter-deadline risk more
            visible because officers are no longer expected to default to the
            maximum 12-week RFE period.
          </p>
        </section>

        <section id="before-after" className="scroll-mt-24">
          <h2>USCIS RFE Policy Before and After August 5, 2026</h2>
          <div className="not-prose overflow-x-auto my-6">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-zinc-800">
                  <th className="text-left p-4 border border-gray-200 dark:border-zinc-700">
                    Issue
                  </th>
                  <th className="text-left p-4 border border-gray-200 dark:border-zinc-700">
                    Prior USCIS policy
                  </th>
                  <th className="text-left p-4 border border-gray-200 dark:border-zinc-700">
                    Policy from August 5, 2026
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-4 border border-gray-200 dark:border-zinc-700 font-semibold">
                    Missing required initial evidence
                  </td>
                  <td className="p-4 border border-gray-200 dark:border-zinc-700">
                    Officers were generally instructed to issue an RFE or NOID
                    when the deficiency might be addressed.
                  </td>
                  <td className="p-4 border border-gray-200 dark:border-zinc-700">
                    An officer may issue an RFE or deny without one.
                  </td>
                </tr>
                <tr className="bg-gray-50/60 dark:bg-zinc-900/50">
                  <td className="p-4 border border-gray-200 dark:border-zinc-700 font-semibold">
                    RFE response time
                  </td>
                  <td className="p-4 border border-gray-200 dark:border-zinc-700">
                    USCIS generally provided the maximum 12-week period.
                  </td>
                  <td className="p-4 border border-gray-200 dark:border-zinc-700">
                    The notice may set a shorter period; 12 weeks is the
                    maximum.
                  </td>
                </tr>
                <tr>
                  <td className="p-4 border border-gray-200 dark:border-zinc-700 font-semibold">
                    Mail sent outside the U.S.
                  </td>
                  <td className="p-4 border border-gray-200 dark:border-zinc-700">
                    USCIS policy added 14 days for international correspondence.
                  </td>
                  <td className="p-4 border border-gray-200 dark:border-zinc-700">
                    Only 3 days are added when the notice is served by mail.
                  </td>
                </tr>
                <tr className="bg-gray-50/60 dark:bg-zinc-900/50">
                  <td className="p-4 border border-gray-200 dark:border-zinc-700 font-semibold">
                    Partial RFE or NOID response
                  </td>
                  <td className="p-4 border border-gray-200 dark:border-zinc-700">
                    Some filers assumed they could supplement the response
                    later.
                  </td>
                  <td className="p-4 border border-gray-200 dark:border-zinc-700">
                    Any response is treated as a request for a decision on the
                    available record.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section id="who-is-affected" className="scroll-mt-24">
          <h2>Who Is Affected by the USCIS Deny-Without-RFE Policy?</h2>
          <p>
            The policy applies broadly to USCIS benefit requests that were
            pending on August 5, 2026, or filed on or after that date, unless
            another regulation or USCIS policy says otherwise. That can include
            employment authorization applications, nonimmigrant worker
            petitions, immigrant petitions, family petitions, adjustment
            applications, and naturalization requests.
          </p>
          <p>
            It does not mean every missing document will automatically cause a
            denial. Officers retain discretion, and the correct procedure
            depends on the benefit, the evidence, and any controlling
            form-specific rule. But applicants and petitioners should assume the
            original submission must independently prove eligibility.
          </p>

          <h3>What This Means for OPT and STEM OPT Applicants</h3>
          <p>
            For F-1 students, the immediate concern is a Form I-765 filed for
            pre-completion OPT, post-completion OPT, or the 24-month STEM OPT
            extension. USCIS&apos;
            <a
              href="https://www.uscis.gov/sites/default/files/document/forms/i-765instr.pdf"
              target="_blank"
              rel="noopener noreferrer"
            >
              current Form I-765 instructions
              <ExternalLink
                className="inline w-4 h-4 ml-1"
                aria-hidden="true"
              />
            </a>
            list general and category-specific evidence. The filing should
            include every applicable item, not merely enough information to open
            a case.
          </p>
          <p>
            Before submitting an OPT or STEM OPT Form I-765, verify at minimum:
          </p>
          <ul>
            <li>
              The correct eligibility category: (c)(3)(A), (c)(3)(B), or
              (c)(3)(C).
            </li>
            <li>
              A properly completed and signed Form I-765 using the edition USCIS
              currently accepts.
            </li>
            <li>
              A DSO-endorsed Form I-20 signed by both the DSO and student.
            </li>
            <li>
              Timely filing after the DSO enters the recommendation in SEVIS.
            </li>
            <li>
              Identity and status evidence required by the current instructions.
            </li>
            <li>
              Copies of prior EADs and applicable prior CPT or OPT records.
            </li>
            <li>
              For STEM OPT, degree, employer, E-Verify, and other
              category-specific evidence.
            </li>
            <li>The correct filing fee, filing method, and filing location.</li>
          </ul>
          <p>
            Use our
            <Link href="/blog/opt-application-checklist-2026">
              complete OPT application checklist
            </Link>
            and
            <Link href="/blog/form-i765-ead-application-guide">
              Form I-765 guide
            </Link>
            as organizational aids, then confirm every item against the live
            USCIS form page and instructions on the day you file.
          </p>
        </section>

        <section id="filing-checklist" className="scroll-mt-24">
          <h2>The Complete-Filing Audit: 8 Checks Before You Submit</h2>
          <p>
            A checklist is only useful if it tests both document presence and
            legal eligibility. Complete this audit for every form, supplement,
            and supporting exhibit in the package.
          </p>

          <div className="not-prose grid gap-4 my-8">
            {[
              [
                '1. Confirm eligibility at filing',
                'Verify that every legal requirement is satisfied on the filing date. Evidence created later may document an existing fact, but it generally cannot manufacture eligibility that did not yet exist.',
              ],
              [
                '2. Use the current form and instructions',
                'Download the form, instructions, fee schedule, and filing-address information directly from USCIS on the day of filing. Do not rely on an old saved PDF or third-party checklist.',
              ],
              [
                '3. Map one exhibit to every requirement',
                'Create an evidence index. For each statutory, regulatory, or form-instruction requirement, identify the exact document and page that proves it.',
              ],
              [
                '4. Resolve missing primary evidence',
                "If primary evidence is unavailable, follow the form's rules for proving unavailability and supplying acceptable secondary evidence or affidavits. An affidavit alone does not automatically replace a required official record.",
              ],
              [
                '5. Reconcile names, dates, and addresses',
                'Compare the form against passports, I-94 records, I-20s, EADs, employment letters, civil documents, and prior filings. Explain material inconsistencies instead of leaving the officer to guess.',
              ],
              [
                '6. Check signatures, translations, and fees',
                'Confirm every required signature and date, include complete certified English translations where needed, and verify the exact payment amount and method.',
              ],
              [
                '7. Perform a cold-file review',
                'Ask a qualified second reviewer to examine only the final packet and current instructions. They should be able to understand eligibility without relying on facts that exist only in your head.',
              ],
              [
                '8. Preserve the filed record',
                'Save the complete final submission, payment proof, delivery confirmation, USCIS receipt, and every source document in one secure folder. You will need the exact record if USCIS later questions the case.',
              ],
            ].map(([title, description]) => (
              <div
                key={title}
                className="flex gap-3 p-5 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl"
              >
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                    {title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="pending-case" className="scroll-mt-24">
          <h2>What Should You Do If Your Case Is Already Pending?</h2>
          <p>
            Do not panic and do not upload a random stack of documents merely
            because the policy changed. The guidance applies to pending cases,
            but an unnecessary or inconsistent submission can create new
            questions.
          </p>
          <ol>
            <li>Retrieve the exact copy of what USCIS received.</li>
            <li>
              Identify the form edition and instructions that governed when you
              filed.
            </li>
            <li>
              Check whether every item listed as required initial evidence was
              included.
            </li>
            <li>
              Separate a truly missing required item from optional strengthening
              evidence.
            </li>
            <li>
              Ask your attorney or an experienced immigration lawyer how to
              address a material gap in your specific case.
            </li>
            <li>
              Monitor your USCIS account and physical mail, and keep your
              address current.
            </li>
          </ol>
          <div className="not-prose bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5 my-6">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-900 dark:text-amber-200 mb-0">
                <strong>Pending does not mean defective.</strong> If your filing
                included the required initial evidence and established
                eligibility, the new policy does not itself create a missing
                document. The correct response depends on the record already
                submitted.
              </p>
            </div>
          </div>
        </section>

        <section id="rfe-response" className="scroll-mt-24">
          <h2>If USCIS Sends an RFE: Follow the Deadline on the Notice</h2>
          <p>
            If USCIS exercises discretion to send an RFE or NOID, treat it as
            the one response opportunity you have. The
            <a
              href={USCIS_EVIDENCE_GUIDANCE}
              target="_blank"
              rel="noopener noreferrer"
            >
              USCIS Policy Manual evidence chapter
              <ExternalLink
                className="inline w-4 h-4 ml-1"
                aria-hidden="true"
              />
            </a>
            and the notice itself control the process.
          </p>

          <div className="not-prose grid sm:grid-cols-3 gap-4 my-8">
            <div className="p-5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
              <Timer className="w-7 h-7 text-blue-600 mb-3" />
              <p className="font-bold text-blue-900 dark:text-blue-200 mb-1">
                Up to 12 weeks
              </p>
              <p className="text-xs text-blue-800 dark:text-blue-300 mb-0">
                Maximum for an RFE, not a guaranteed response period.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20">
              <Clock className="w-7 h-7 text-purple-600 mb-3" />
              <p className="font-bold text-purple-900 dark:text-purple-200 mb-1">
                Up to 30 days
              </p>
              <p className="text-xs text-purple-800 dark:text-purple-300 mb-0">
                Maximum response time for a Notice of Intent to Deny.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
              <ShieldAlert className="w-7 h-7 text-red-600 mb-3" />
              <p className="font-bold text-red-900 dark:text-red-200 mb-1">
                No extension
              </p>
              <p className="text-xs text-red-800 dark:text-red-300 mb-0">
                Additional response time may not be granted.
              </p>
            </div>
          </div>

          <h3>Build One Complete Response</h3>
          <ol>
            <li>
              Read the entire notice, including every numbered request and the
              response address or upload instructions.
            </li>
            <li>
              Calendar the printed deadline immediately. Do not calculate from
              the day you opened the envelope.
            </li>
            <li>
              Create a response matrix matching each USCIS question to evidence
              and a written explanation.
            </li>
            <li>
              Answer every point, including incorrect assumptions in the notice,
              with organized supporting documents.
            </li>
            <li>
              Submit one complete response. Do not send a placeholder or partial
              packet expecting to add more later.
            </li>
            <li>
              Keep proof that USCIS received the response on time and retain an
              exact copy.
            </li>
          </ol>

          <p>
            For a deeper response workflow, read our guide on
            <Link href="/blog/opt-application-denied">
              what to do after an OPT denial
            </Link>
            and preserve your
            <Link href="/blog/opt-employment-evidence-checklist">
              OPT employment evidence
            </Link>
            before a future filing creates a document emergency.
          </p>
        </section>

        <section>
          <h2>What If USCIS Denies the Case Without an RFE?</h2>
          <p>
            Read the denial notice carefully. It should identify the factual and
            legal basis for the decision and state whether a motion, appeal, or
            another review process is available. In some cases, refiling a
            complete request may be possible; in others, a filing deadline,
            status issue, underlying eligibility problem, or removal consequence
            can make the next step time-sensitive.
          </p>
          <p>
            Do not assume that uploading new evidence on appeal will cure a
            filing that failed to establish eligibility when submitted. Get
            case-specific advice from a licensed U.S. immigration attorney or
            Department of Justice-accredited representative before choosing
            between a motion, appeal, or new filing.
          </p>
        </section>

        <section id="faq" className="scroll-mt-24 mb-12">
          <h2>Frequently Asked Questions</h2>
          <div className="not-prose space-y-4">
            {faqItems.map((faq) => (
              <div
                key={faq.question}
                className="p-5 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800"
                itemScope
                itemType="https://schema.org/Question"
              >
                <h3
                  className="font-bold text-gray-900 dark:text-white mb-2"
                  itemProp="name"
                >
                  {faq.question}
                </h3>
                <div
                  itemScope
                  itemType="https://schema.org/Answer"
                  itemProp="acceptedAnswer"
                >
                  <p
                    className="text-sm text-gray-600 dark:text-gray-400 mb-0"
                    itemProp="text"
                  >
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2>The Bottom Line</h2>
          <p>
            The August 2026 USCIS RFE policy does not eliminate RFEs, but it
            eliminates the safe assumption that an officer will send one before
            denying a curable-looking filing. Your best protection is a
            submission that is complete, internally consistent, and supported by
            the evidence required on the filing date.
          </p>
          <p>
            For OPT and STEM OPT students, that means coordinating with your DSO
            early, checking the current Form I-765 instructions, and preserving
            the complete filing record. A fast application is not safer than a
            correct one.
          </p>
        </section>

        <section className="not-prose bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white my-12 shadow-xl">
          <div className="flex items-start gap-4">
            <FileCheck2 className="w-9 h-9 text-blue-100 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold text-white mb-3 mt-0">
                Keep Every USCIS Deadline in One Place
              </h2>
              <p className="text-blue-100 mb-6 text-lg">
                TrackMyOPT helps F-1 students monitor OPT milestones, employment
                changes, and immigration-document deadlines without relying on
                memory or scattered spreadsheets.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors"
              >
                Create Your Free Account <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        <section className="text-sm">
          <h2>Official Sources</h2>
          <ul>
            <li>
              <a href={USCIS_ALERT} target="_blank" rel="noopener noreferrer">
                USCIS newsroom alert, August 5, 2026
              </a>
            </li>
            <li>
              <a
                href={USCIS_POLICY_ALERT}
                target="_blank"
                rel="noopener noreferrer"
              >
                USCIS Policy Alert PA-2026-05
              </a>
            </li>
            <li>
              <a
                href={USCIS_EVIDENCE_GUIDANCE}
                target="_blank"
                rel="noopener noreferrer"
              >
                USCIS Policy Manual, Volume 1, Part E, Chapter 6
              </a>
            </li>
            <li>
              <a
                href={ECFR_EVIDENCE_RULE}
                target="_blank"
                rel="noopener noreferrer"
              >
                8 CFR 103.2, Submission and Adjudication of Benefit Requests
              </a>
            </li>
          </ul>
          <p className="text-gray-500 dark:text-gray-400">
            This article provides general educational information, not legal
            advice. Immigration outcomes depend on the benefit requested, the
            governing law, and the facts in the record.
          </p>
        </section>

        <AuthorBio />
      </div>
    </article>
  );
}
