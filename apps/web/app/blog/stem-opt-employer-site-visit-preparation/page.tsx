import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, ExternalLink, ShieldCheck, Building2 } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import { AuthorBio } from "@/components/blog/AuthorBio";

const CANONICAL = "https://www.trackmyopt.com/blog/stem-opt-employer-site-visit-preparation";

export const metadata: Metadata = {
  title: "STEM OPT Employer Site Visits: How Students and Employers Should Prepare",
  description:
    "A complete guide to SEVP/ICE STEM OPT employer site visits: what inspectors verify, how to prepare as a student, what the employer needs to have ready, and how to handle a site visit notice.",
  keywords: [
    "STEM OPT employer site visit",
    "ICE STEM OPT inspection",
    "SEVP site visit preparation",
    "STEM OPT compliance inspection",
    "how to prepare for STEM OPT site visit",
    "STEM OPT employer visit DHS",
    "ICE worksite visit F1 student",
  ],
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: "STEM OPT Employer Site Visits: How Students and Employers Should Prepare",
    description: "What SEVP site visits check, what documents to have ready, and how students and employers should each prepare for a STEM OPT worksite inspection.",
    url: CANONICAL,
    type: "article",
    images: [{ url: "https://www.trackmyopt.com/og-image.png", width: 1200, height: 630, alt: "STEM OPT Employer Site Visit Preparation" }],
  },
};

export default function StemOptEmployerSiteVisitPage() {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BlogPostSchema title={metadata.title as string} description={metadata.description as string} publishedDate="2026-07-27" modifiedDate="2026-07-27" author="TrackMyOPT Immigration Team" canonicalUrl={CANONICAL} />
      <BreadcrumbSchema items={[{ name: "Home", url: "https://www.trackmyopt.com" }, { name: "Blog", url: "https://www.trackmyopt.com/blog" }, { name: "STEM OPT Site Visit Preparation", url: CANONICAL }]} />

      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold mb-4">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">STEM OPT Compliance</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
          STEM OPT Employer Site Visits: How Students and Employers Should Prepare
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          ICE and SEVP have the authority to conduct worksite visits to verify STEM OPT compliance.
          These visits are not random nuisances—they are a structured verification of whether
          the training relationship is real. This guide prepares both students and employers.
        </p>
        <div className="mt-6 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 13 min read</span>
          <span>•</span>
          <span>Updated July 27, 2026</span>
        </div>
      </header>

      <div className="relative w-full h-[420px] md:h-[520px] rounded-2xl overflow-hidden mb-12 shadow-xl">
        <img src="/blog/stem-opt-employer-site-visit-preparation.png" alt="DHS officer with SEVP site visit checklist reviewing documents with a professional at an office desk" className="object-cover w-full h-full" />
      </div>

      {/* Direct Answer */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">Direct Answer</p>
        <p className="text-gray-800 dark:text-gray-100 font-medium leading-relaxed">
          SEVP site visits verify that the STEM OPT training relationship is genuine: the
          student actually works at the reported location, the training plan is being implemented,
          supervision exists, the student is being paid, and the employer is enrolled in E-Verify.
          The best preparation is a clean, accurate Form I-983 with consistent records — not
          cramming for an inspection. If you receive a site-visit notice, contact your DSO and
          the employer immediately to confirm records are accurate and accessible.
        </p>
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none">

        <h2>What Are SEVP/ICE Site Visits?</h2>
        <p>
          The Student and Exchange Visitor Program (SEVP) within ICE has the authority under
          federal regulations to inspect the employers of STEM OPT students. The purpose is
          to verify that the STEM training program is genuine — not a paper arrangement.
        </p>
        <p>
          Site visits have increased in frequency in recent years as part of broader DHS
          enforcement of the STEM OPT program. The HSI (Homeland Security Investigations)
          unit has publicized crackdowns on fraudulent STEM OPT arrangements, particularly
          those where students pay fees for fake training or work at unstaffed locations.
        </p>
        <p>
          A site visit for a legitimate employer with accurate I-983 documentation is generally
          straightforward. A site visit revealing inconsistencies between the I-983 and reality
          can have serious consequences for both the student and the employer.
        </p>

        <h2>What Inspectors Verify During a Site Visit</h2>
        <p>
          Based on published SEVP guidance and enforcement actions, site visit inspectors
          typically verify:
        </p>

        <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {[
            {
              category: "Student Presence",
              items: [
                "Student actually works at the reported worksite address",
                "Student is physically present or verifiably working remotely from a reported location",
                "Student can describe their actual duties in their own words",
              ],
            },
            {
              category: "Employer Authenticity",
              items: [
                "Employer's physical presence at the stated address",
                "Employer is enrolled and active in E-Verify",
                "Employer has a genuine business operation at the location",
              ],
            },
            {
              category: "Training Plan Reality",
              items: [
                "The duties described in Form I-983 match what the student actually does",
                "A named supervisor exists and actually supervises the student",
                "The student can identify the learning objectives from their I-983",
              ],
            },
            {
              category: "Compensation and Hours",
              items: [
                "Student is being paid as indicated in the I-983",
                "Student is working at least 20 hours per week",
                "Pay stubs or payroll records confirm the compensation",
              ],
            },
          ].map((section) => (
            <div key={section.category} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl p-4">
              <p className="font-bold text-gray-900 dark:text-white mb-3 text-sm">{section.category}</p>
              <ul className="space-y-1">
                {section.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <h2>Red Flags That Trigger Site Visits</h2>
        <p>
          While any STEM OPT employer can receive a site visit, certain situations increase
          the likelihood:
        </p>
        <ul>
          <li><strong>Third-party placement arrangements</strong> — when a staffing company places students at client sites without a direct training relationship</li>
          <li><strong>Employer registered in one state with students working in another</strong> — especially when the worksite address on the I-983 differs from the employer&apos;s headquarters</li>
          <li><strong>High number of STEM OPT students per employer</strong> — disproportionate ratios relative to the employer&apos;s size</li>
          <li><strong>Reported worksites in residential or commercial mailbox addresses</strong></li>
          <li><strong>Students who have changed employers multiple times</strong> in a short period</li>
          <li><strong>Tips or complaints</strong> from employees, competitors, or students</li>
          <li><strong>Discrepancies between I-983 data and SEVIS records</strong></li>
        </ul>

        <div className="not-prose bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-5 rounded-r-xl my-6">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900 dark:text-amber-300 mb-1">The HSI STEM OPT Fraud Crackdown</p>
              <p className="text-amber-800 dark:text-amber-200 text-sm">
                HSI has arrested and prosecuted employers and students involved in fraudulent STEM
                OPT arrangements where students paid fees for fake training letters or worked
                for companies that had no real operations. Legitimate students at real employers
                should not be deterred — but these enforcement actions highlight why accurate
                I-983 documentation is critical from day one.
              </p>
            </div>
          </div>
        </div>

        <h2>Student Preparation Checklist</h2>
        <p>
          The best preparation for a site visit is maintaining accurate documentation throughout
          your STEM OPT period — not rushing to prepare when a visit is announced.
        </p>

        <h3>Documents you should have accessible at all times</h3>
        <div className="not-prose">
          <ul className="space-y-3 my-4">
            {[
              { item: "Your current Form I-983 (all pages, signed)", note: "Know the learning objectives and training plan details by heart — not just as paper in a folder." },
              { item: "Your EAD card and most recent I-20", note: "Physical copies or secure digital access." },
              { item: "Your supervisor's name, title, and direct contact", note: "Know who supervises you and be able to describe the supervision relationship." },
              { item: "Your employer's E-Verify company ID", note: "Confirm your employer is still actively enrolled." },
              { item: "Recent pay stubs (last 2–3 months)", note: "Evidence of compensation consistent with the I-983." },
              { item: "A brief written description of your actual daily duties", note: "In your own words — this should match the I-983 training plan." },
              { item: "Six-month validation confirmations from your DSO", note: "Showing that validations have been completed on schedule." },
            ].map((row, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-800 dark:text-gray-200">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">{row.item}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{row.note}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <h3>Knowing your own I-983</h3>
        <p>
          The most effective preparation is to be able to explain your training plan in your own
          words without reading from the document. An inspector may ask:
        </p>
        <ul>
          <li>"What are you learning at this company?"</li>
          <li>"How does this job relate to your degree?"</li>
          <li>"Who supervises you and how often do you meet?"</li>
          <li>"What projects are you currently working on?"</li>
          <li>"Where do you work — at this address or somewhere else?"</li>
        </ul>
        <p>
          If your honest answers to these questions match your I-983, you are prepared. If they
          do not, update the I-983 through your DSO before a site visit arrives.
        </p>

        <h2>Employer Preparation Checklist</h2>
        <p>
          Employers receive site visits with varying amounts of notice. Some visits are announced
          in advance; others are unannounced. Employers should maintain the following at all times:
        </p>
        <div className="not-prose">
          <ul className="space-y-3 my-4">
            {[
              { item: "Complete signed I-983 for each STEM OPT employee", note: "All pages, including the training plan with specific learning objectives." },
              { item: "E-Verify company ID and participation confirmation", note: "The inspector will verify active E-Verify enrollment." },
              { item: "I-9 forms for each STEM OPT employee", note: "Completed correctly with the EAD card information." },
              { item: "Payroll records showing compensation", note: "Confirming payment consistent with the I-983 and prevailing wage." },
              { item: "Employee schedule or time records", note: "Evidence of at least 20 hours per week of training activity." },
              { item: "Supervisor's name and availability", note: "The named supervisor should be able to confirm they supervise the student." },
              { item: "Description of the training program and how it is implemented", note: "Not just the I-983 form — actual operational details." },
            ].map((row, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-800 dark:text-gray-200">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">{row.item}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{row.note}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <h2>What to Do When You Receive a Site Visit Notice</h2>

        <h3>For students</h3>
        <ol>
          <li>Contact your DSO immediately with the notice details (date, time, inspector name if given)</li>
          <li>Review your I-983 and confirm your actual duties, supervisor, worksite, and hours match exactly</li>
          <li>Notify your employer&apos;s HR department and manager so they are not caught off-guard</li>
          <li>Locate and organize all documents listed in the student preparation checklist above</li>
          <li>Do not alter or update the I-983 to match reality only because of the site visit — corrections require DSO coordination and should reflect the truth as of when they are made</li>
        </ol>

        <h3>For employers</h3>
        <ol>
          <li>Designate a single point of contact (typically HR) to receive and coordinate the visit</li>
          <li>Locate all I-983 forms and I-9 records for the relevant STEM OPT employees</li>
          <li>Ensure the named supervisors are available and aware of the visit</li>
          <li>Confirm E-Verify enrollment is active</li>
          <li>Consider consulting immigration counsel before the visit if there are any known discrepancies</li>
          <li>Be cooperative and factual — attempting to obstruct or mislead inspectors creates its own legal exposure</li>
        </ol>

        <h2>What Happens If Discrepancies Are Found</h2>
        <p>
          If inspectors find discrepancies between the I-983 and the actual training arrangement,
          the consequences can include:
        </p>
        <ul>
          <li><strong>For the student:</strong> SEVIS record termination, possible out-of-status finding, bars to future immigration benefits</li>
          <li><strong>For the employer:</strong> Debarment from the STEM OPT program, potential civil or criminal referral for knowing employment of unauthorized workers</li>
          <li><strong>For the school:</strong> SEVP may request records and potentially review the school&apos;s SEVP certification</li>
        </ul>
        <p>
          Minor discrepancies (e.g., a worksite address that was not updated after an office move)
          are typically resolved through the DSO record correction process. Material discrepancies
          (no real training relationship, student not actually working at the site, fake employer)
          are treated as program violations.
        </p>

        <h2>Prevention: Building a Site-Visit-Ready Program from Day One</h2>
        <p>
          The students and employers who are most prepared for site visits are those who treated
          the I-983 as a real training plan rather than a compliance checkbox. Practical steps:
        </p>
        <div className="not-prose">
          <ul className="space-y-3 my-4">
            {[
              "Write learning objectives that are specific and tied to real projects at the company",
              "Meet with your supervisor at least monthly and document those meetings",
              "Keep timesheets or a simple weekly log of hours and activities",
              "Complete six-month validations on time and save DSO confirmations",
              "Update the I-983 through your DSO when duties or the worksite changes",
              "Store all documents in the TrackMyOPT Document Vault for organized, accessible records",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-800 dark:text-gray-200">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="not-prose bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl p-6 my-10">
          <div className="flex items-start gap-4">
            <Building2 className="w-8 h-8 text-primary flex-shrink-0" />
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-lg mb-2">STEM OPT Planner — Stay Audit-Ready</p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Track your validation dates, evaluation deadlines, employer change reports,
                and document storage in one dashboard. Students with organized records are
                significantly better prepared for any site visit or DSO review.
              </p>
              <Link href="/dashboard/opt-tools/stem-opt"
                className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm">
                Open STEM OPT Planner <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <h2>Frequently Asked Questions</h2>
        <div itemScope itemType="https://schema.org/FAQPage" className="not-prose space-y-4">
          {[
            {
              q: "Do all STEM OPT employers receive site visits?",
              a: "No — site visits are not universal. However, any STEM OPT employer can receive a visit at any time. The frequency is influenced by risk factors such as high student-to-employee ratios, third-party placement arrangements, discrepant records, and tips. Legitimate employers with accurate I-983 documentation should not be concerned.",
            },
            {
              q: "Are site visits announced in advance?",
              a: "Visits can be announced or unannounced. ICE has the authority to conduct unannounced worksite visits. Announced visits typically give the employer a short notice period. Both types verify the same things.",
            },
            {
              q: "Can a student decline to speak with an inspector?",
              a: "Individuals have constitutional rights during federal inspections. However, attempting to avoid or obstruct a lawful SEVP site visit can create additional problems. The best approach for students with a legitimate training arrangement is cooperation with accurate, factual information. Consult an immigration attorney before any visit if you have concerns.",
            },
            {
              q: "What if my actual duties have changed since I signed the I-983?",
              a: "If your duties have materially changed, update the I-983 through your DSO before a site visit. Do not update it only because a visit was announced and only to match what you are actually doing — but if there is a genuine material change that should have been reported, correct it properly and promptly.",
            },
            {
              q: "My employer works at multiple client sites. Which address should be on the I-983?",
              a: "The I-983 should reflect where you actually perform your training work. If you work at a client site rather than the employer's headquarters, the client site's address is typically the correct worksite. Consult your DSO if you rotate between multiple locations.",
            },
            {
              q: "Can a third-party staffing company be a STEM OPT employer?",
              a: "This is a highly scrutinized area. STEM OPT requires a genuine employer-employee relationship with the entity that will supervise and implement the training plan. If a staffing company places you at a client site without a direct training relationship at the staffing company, the arrangement may not qualify. Consult your DSO before accepting any third-party placement for STEM OPT.",
            },
          ].map((item, i) => (
            <div key={i} itemScope itemProp="mainEntity" itemType="https://schema.org/Question"
              className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl p-5">
              <p itemProp="name" className="font-bold text-gray-900 dark:text-white mb-2">{item.q}</p>
              <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <p itemProp="text" className="text-gray-600 dark:text-gray-300 text-sm">{item.a}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Official Sources */}
        <h2>Official Sources</h2>
        <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "DHS STEM OPT Reporting Requirements (PDF)", href: "https://studyinthestates.dhs.gov/assets/sevpstemoptreportingrequirementsfinal.pdf" },
            { label: "DHS Form I-983 Overview", href: "https://studyinthestates.dhs.gov/form-i-983-overview" },
            { label: "ICE Practical Training Guidance", href: "https://www.ice.gov/sevis/practical-training" },
            { label: "HSI OPT Fraud Information", href: "https://www.trackmyopt.com/blog/hsi-opt-fraud-crackdown-legitimate-students-guide" },
          ].map((s) => (
            <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:text-primary hover:border-primary/30 transition-colors">
              <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
              {s.label}
            </a>
          ))}
        </div>

        <div className="not-prose mt-10 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl p-5">
          <div className="flex gap-3">
            <ShieldCheck className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <strong className="text-gray-700 dark:text-gray-300">Immigration Disclaimer:</strong>{" "}
              This article is for general informational purposes only and does not constitute legal
              advice. If you receive a site visit notice or have concerns about your STEM OPT
              arrangement, consult your DSO and a licensed immigration attorney promptly.
            </p>
          </div>
        </div>

        <div className="not-prose mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Guides</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { href: "/blog/employer-refuses-form-i983", title: "Employer Refuses to Sign Form I-983", desc: "What to do when your employer won't complete the required STEM OPT documentation." },
              { href: "/blog/stem-opt-six-month-validation-report", title: "STEM OPT Validation Report Calendar", desc: "All reporting deadlines — six-month validations, 12-month evaluations, and final evaluations." },
              { href: "/blog/hsi-opt-fraud-crackdown-legitimate-students-guide", title: "HSI OPT Fraud Crackdown — Legitimate Students Guide", desc: "What legitimate students need to know about the ongoing enforcement environment." },
              { href: "/blog/opt-employment-evidence-checklist", title: "OPT Employment Evidence Checklist", desc: "Every document to keep — the same records an inspector will want to see." },
            ].map((r) => (
              <Link key={r.href} href={r.href} className="group block">
                <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-5 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors text-base">{r.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">{r.desc}</p>
                  <span className="text-primary font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">Read Guide <ArrowRight className="w-4 h-4" /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <AuthorBio />
    </article>
  );
}
