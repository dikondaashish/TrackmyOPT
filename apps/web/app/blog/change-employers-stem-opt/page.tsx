import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, ExternalLink, ShieldCheck } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import { AuthorBio } from "@/components/blog/AuthorBio";

const CANONICAL = "https://www.trackmyopt.com/blog/change-employers-stem-opt";

export const metadata: Metadata = {
  title: "How to Change Employers on STEM OPT: New I-983 and SEVIS Deadlines",
  description:
    "The complete employer-change sequence for STEM OPT students: collecting the old I-983 final evaluation, vetting the new employer's E-Verify status, completing the new Form I-983, and meeting SEVIS reporting deadlines.",
  keywords: [
    "change STEM OPT employer",
    "new I-983 employer change",
    "STEM OPT job switch",
    "STEM OPT SEVIS employer change",
    "STEM OPT deadlines employer",
    "how to change jobs on STEM OPT",
    "STEM OPT final evaluation employer",
  ],
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: "How to Change Employers on STEM OPT: New I-983 and SEVIS Deadlines",
    description: "Step-by-step STEM OPT employer change guide: close the old opportunity, vet the new employer, complete a new I-983, and stay within the 10-day reporting window.",
    url: CANONICAL,
    type: "article",
    images: [{ url: "https://www.trackmyopt.com/og-image.png", width: 1200, height: 630, alt: "STEM OPT Employer Change Guide" }],
  },
};

export default function ChangeStemOptEmployerPage() {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BlogPostSchema title={metadata.title as string} description={metadata.description as string} publishedDate="2026-07-27" modifiedDate="2026-07-27" author="TrackMyOPT Immigration Team" canonicalUrl={CANONICAL} />
      <BreadcrumbSchema items={[{ name: "Home", url: "https://www.trackmyopt.com" }, { name: "Blog", url: "https://www.trackmyopt.com/blog" }, { name: "Change Employers on STEM OPT", url: CANONICAL }]} />

      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold mb-4">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">STEM OPT Compliance</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
          How to Change Employers on STEM OPT: New I-983 and SEVIS Deadlines
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Changing jobs on STEM OPT is not like changing jobs on initial OPT. There are two
          simultaneous compliance tracks—closing the old opportunity and opening the new one—
          with a strict 10-day reporting window. Here is how to navigate both without creating
          a gap in your authorization.
        </p>
        <div className="mt-6 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 13 min read</span>
          <span>•</span>
          <span>Updated July 27, 2026</span>
        </div>
      </header>

      <div className="relative w-full h-[420px] md:h-[520px] rounded-2xl overflow-hidden mb-12 shadow-xl">
        <img src="/blog/change-employers-stem-opt.png" alt="Two business cards, new Form I-983, employer change checklist in notebook and laptop with email to HR" className="object-cover w-full h-full" />
      </div>

      {/* Direct Answer */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">Direct Answer</p>
        <p className="text-gray-800 dark:text-gray-100 font-medium leading-relaxed">
          To change STEM OPT employers: (1) confirm the old training end date in writing, (2) complete
          the final Form I-983 evaluation with the old employer within 10 days of the training ending,
          (3) notify your DSO of the employer change within the applicable reporting window, (4) vet the
          new employer for E-Verify enrollment and I-983 capability, (5) complete a new Form I-983 with
          the new employer, and (6) receive DSO authorization before starting. Do not start with the new
          employer before the new I-983 is submitted and your DSO has confirmed the authorization.
        </p>
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none">

        {/* Key deadlines table */}
        <div className="not-prose overflow-x-auto mb-10">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-primary/10">
                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-zinc-700">Action</th>
                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-zinc-700">Deadline</th>
                <th className="text-left p-3 font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-zinc-700">Who Does It</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Final I-983 evaluation (old employer)", "Within 10 days of training end", "Student + old employer"],
                ["Report employer change to DSO", "Within 10 days of change", "Student → DSO"],
                ["New Form I-983 (new employer)", "Before new training begins", "Student + new employer → DSO"],
                ["Six-month validation reports", "Every 6 months from STEM start", "Student + DSO"],
                ["12-month self-evaluation", "At 12 months of STEM training", "Student + employer → DSO"],
              ].map(([action, deadline, who], i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-gray-50 dark:bg-zinc-800"}>
                  <td className="p-3 border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-gray-200">{action}</td>
                  <td className="p-3 border border-gray-200 dark:border-zinc-700 font-medium text-red-700 dark:text-red-400">{deadline}</td>
                  <td className="p-3 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400">{who}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>Before You Give Notice: Due Diligence on the New Employer</h2>
        <p>
          The most common mistake students make is accepting a new offer under excitement or time
          pressure, giving notice at the old job, and then discovering the new employer is not
          E-Verify enrolled or cannot complete Form I-983. That sequence creates a gap that is
          both an unemployment problem and a compliance problem.
        </p>
        <p>Before you give notice or accept a final offer, verify:</p>

        <h3>1. E-Verify enrollment</h3>
        <p>
          Visit <a href="https://www.e-verify.uscis.gov/emp" target="_blank" rel="noopener noreferrer">e-verify.uscis.gov/emp</a> and
          search for the employer by name and state. Confirm the employer has an active
          E-Verify company ID and a corresponding memorandum of understanding with DHS.
          If you cannot find the employer, ask HR for the E-Verify company ID directly.
        </p>

        <h3>2. Authorized signatory</h3>
        <p>
          Ask who will sign Form I-983 on the employer&apos;s behalf. It must be an individual
          with actual signing authority—not a recruiter, hiring manager, or HR coordinator
          who will need to escalate for approval. A form that cannot be signed in time
          is a form that delays your authorization.
        </p>

        <h3>3. Training plan feasibility</h3>
        <p>
          Form I-983 requires a genuine training plan with specific learning objectives tied to
          your STEM degree. Ask the employer what the role&apos;s core technical duties are and
          whether they can articulate learning objectives. If the employer is vague or unfamiliar
          with I-983, budget extra time for the process.
        </p>

        <h3>4. Worksite and supervision</h3>
        <p>
          STEM OPT requires supervision and a real worksite. If the role is fully remote or
          involves working at a client site, confirm how the employer-employee relationship and
          supervision will be documented in the I-983.
        </p>

        <h2>Phase 1: Closing the Old STEM OPT Opportunity</h2>

        <h3>Confirm your last day in writing</h3>
        <p>
          Get a written end-of-employment statement from HR that specifies the exact date you
          stopped performing STEM training duties. This is the date from which the 10-day
          final evaluation deadline runs.
        </p>

        <h3>Request the final I-983 evaluation</h3>
        <p>
          Send a written request to HR and your supervisor with the form attached, the
          10-day deadline stated clearly, and a note that this is a federal obligation under
          the STEM OPT regulations. Keep a copy of every request and response.
        </p>
        <p>
          Complete your own student self-evaluation section at the same time. You do not
          have to wait for the employer to complete their portion before you write yours.
        </p>

        <h3>Notify your DSO</h3>
        <p>
          Contact your DSO within the applicable reporting window (generally 10 days of
          the employer change or training end). Provide: old employer name, last day, new
          employer name and start date (if known), and your SEVIS ID.
        </p>

        <div className="not-prose bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-5 rounded-r-xl my-6">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900 dark:text-amber-300 mb-1">Do not edit the SEVP Portal yourself</p>
              <p className="text-amber-800 dark:text-amber-200 text-sm">
                Unlike initial OPT, STEM OPT employer records involve Form I-983 and DSO coordination.
                Simply editing employer fields in the SEVP Portal does not complete the employer
                change process. Your DSO must coordinate the record update with your I-983 submission.
              </p>
            </div>
          </div>
        </div>

        <h2>Phase 2: Opening the New STEM OPT Opportunity</h2>

        <h3>Collect the new employer information needed for I-983</h3>
        <div className="not-prose">
          <ul className="space-y-2 my-4">
            {[
              "Employer legal name (exactly as in E-Verify)",
              "Employer EIN (Federal Tax ID Number)",
              "E-Verify company ID number",
              "Worksite address (may differ from headquarters)",
              "Supervisor name, title, phone, and email",
              "Authorized signatory name, title, and contact",
              "Position title and primary STEM-related duties",
              "Learning objectives aligned with your qualifying degree",
              "Compensation rate and payment type (must be W-2)",
              "Minimum weekly hours (must be at least 20)",
              "Supervision and mentoring structure",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-800 dark:text-gray-200">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <h3>Complete and submit the new Form I-983</h3>
        <p>
          Work through the form with the employer&apos;s HR team and the authorized signatory.
          Both the student and employer must sign. Submit the completed form to your DSO
          through the school&apos;s required process—email, portal upload, or in-person
          submission depending on your school.
        </p>
        <p>
          Allow your DSO adequate processing time. Some DSOs can update records within a
          day or two; others may need a week. Factor this into your planned start date.
        </p>

        <h3>Wait for authorization before starting</h3>
        <p>
          Do not start work until your DSO has confirmed the new I-983 is on file, the
          SEVIS record reflects the new employer, and your authorization to begin the new
          training opportunity has been confirmed. Starting before this point risks creating
          an unauthorized employment period.
        </p>

        <h2>Managing the Gap Between Employers</h2>
        <p>
          Every calendar day between your last qualifying day with the old employer and your first
          qualifying day with the new employer counts toward your 150-day unemployment total
          (unless you have other concurrent qualifying employment). The goal is to minimize this
          gap through careful planning.
        </p>

        <h3>Practical ways to reduce the gap</h3>
        <ul>
          <li>Start the new employer&apos;s I-983 process 2–3 weeks before your intended resignation</li>
          <li>Use your notice period at the old employer to complete the new I-983 in parallel</li>
          <li>Ask your DSO to review a draft I-983 before the final submission to catch errors</li>
          <li>Confirm the new employer&apos;s authorized signatory before giving notice at the old job</li>
        </ul>

        <p>
          Track the exact days in the{" "}
          <Link href="/dashboard/opt-tools/opt-clock">TrackMyOPT unemployment clock</Link>{" "}
          so you always know how many days remain.
        </p>

        <h2>Concurrent STEM OPT Employment</h2>
        <p>
          It is possible to hold more than one STEM OPT position at a time, but each position
          must independently qualify: E-Verify enrolled employer, qualifying training relationship,
          at least 20 combined hours (the regulations are nuanced on how hours are counted across
          concurrent positions), and a separate Form I-983 for each employer.
        </p>
        <p>
          If you are considering adding a second STEM employer without leaving the first, discuss
          this with your DSO before accepting the second offer. Do not assume multiple employers
          work the same way they do under initial OPT.
        </p>

        {/* FAQ */}
        <h2>Frequently Asked Questions</h2>
        <div itemScope itemType="https://schema.org/FAQPage" className="not-prose space-y-4">
          {[
            {
              q: "How quickly must I report a STEM OPT employer change?",
              a: "DHS STEM OPT reporting requirements generally state that students must notify the DSO and submit a new Form I-983 within 10 days of an employer change. Confirm the exact process and deadline with your DSO, as school procedures may vary.",
            },
            {
              q: "Do I need a final evaluation when I voluntarily change employers?",
              a: "Yes. A final Evaluation of Student Progress is required whenever a STEM training opportunity ends — including voluntary resignations, not just layoffs. The 10-day deadline applies regardless of why the opportunity ended.",
            },
            {
              q: "Can I change employers if the new company is not in E-Verify yet?",
              a: "No. E-Verify enrollment is a STEM OPT employer requirement, not something the employer can complete after you start. Do not begin the new STEM training until the employer is enrolled and has an active company ID.",
            },
            {
              q: "Can I keep working for both employers during the transition?",
              a: "If both roles are qualifying concurrent STEM OPT positions, it may be possible — but each needs its own I-983 and the arrangement must be disclosed to and approved by your DSO. Do not assume the transition period counts as qualifying employment under the old I-983.",
            },
            {
              q: "Does changing from a W-2 role to a contract (1099) role count as a STEM OPT employer change?",
              a: "No — a 1099 contractor arrangement generally does not qualify for STEM OPT at all. STEM OPT requires an employer-employee (W-2) relationship. If your employment type changes, contact your DSO immediately; it may be treated as a loss of qualifying employment rather than an employer change.",
            },
            {
              q: "My new employer has a different office address than where I will actually work. Which address goes on the I-983?",
              a: "The worksite address where you will actually perform the training duties should be entered on the I-983. If you work remotely from home, discuss with your DSO how to document the supervision and training relationship accurately.",
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
            { label: "DHS Form I-983 Overview", href: "https://studyinthestates.dhs.gov/form-i-983-overview" },
            { label: "DHS STEM OPT Reporting Requirements (PDF)", href: "https://studyinthestates.dhs.gov/assets/sevpstemoptreportingrequirementsfinal.pdf" },
            { label: "E-Verify Employer Search", href: "https://www.e-verify.uscis.gov/emp" },
            { label: "SEVP Portal Student Guide", href: "https://studyinthestates.dhs.gov/assets/SEVP%20Portal%20Student%20User%20Guide.pdf" },
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
              advice. Always consult your DSO and, when necessary, a licensed immigration attorney
              before making employment decisions that affect your STEM OPT authorization.
            </p>
          </div>
        </div>

        <div className="not-prose mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Guides</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { href: "/blog/laid-off-on-stem-opt", title: "Laid Off on STEM OPT", desc: "Involuntary employer change — final evaluations, 150-day limit, and replacement employer search." },
              { href: "/blog/employer-refuses-form-i983", title: "Employer Refuses to Sign Form I-983", desc: "What to do when the old or new employer won't complete the required documentation." },
              { href: "/blog/stem-opt-employer-requirements", title: "STEM OPT Employer Requirements", desc: "Full checklist of E-Verify, training plan, and compensation requirements." },
              { href: "/blog/stem-opt-six-month-validation-report", title: "STEM OPT Validation Report Calendar", desc: "All reporting deadlines — six-month validations, evaluations, and change reports." },
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
