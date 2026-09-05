import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import { AuthorBio } from "@/components/blog/AuthorBio";

const CANONICAL = "https://www.trackmyopt.com/blog/laid-off-on-stem-opt";

export const metadata: Metadata = {
  title: "Laid Off on STEM OPT? I-983, Employer Changes & the 150-Day Rule",
  description:
    "A complete STEM OPT layoff guide: final Form I-983 evaluations, SEVIS employer-change reporting deadlines, the 150-day unemployment limit, and how to find a compliant replacement employer.",
  keywords: [
    "laid off on STEM OPT",
    "STEM OPT layoff",
    "STEM OPT job loss",
    "final I-983 evaluation",
    "150 day STEM OPT rule",
    "STEM OPT employer change after layoff",
    "SEVIS STEM OPT reporting",
    "STEM OPT unemployment days",
  ],
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: "Laid Off on STEM OPT? I-983, Employer Changes & the 150-Day Rule",
    description:
      "Step-by-step guide for F-1 STEM OPT students who lost their job: final I-983, SEVIS reporting, 150-day clock, and finding a compliant new employer.",
    url: CANONICAL,
    type: "article",
    images: [{ url: "https://www.trackmyopt.com/og-image.jpg", width: 1200, height: 630, alt: "Laid Off on STEM OPT Guide" }],
  },
    twitter: {
        card: "summary_large_image",
        title: "Laid Off on STEM OPT? I-983, Employer Changes & the 150-Day Rule",
        description: "Step-by-step guide for F-1 STEM OPT students who lost their job: final I-983, SEVIS reporting, 150-day clock, and finding a compliant new employer.",
        images: ["https://www.trackmyopt.com/og-image.jpg"],
    },
};

export default function LaidOffOnStemOptPage() {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BlogPostSchema
        title={metadata.title as string}
        description={metadata.description as string}
        publishedDate="2026-07-27"
        modifiedDate="2026-07-27"
        author="TrackMyOPT Immigration Team"
        canonicalUrl={CANONICAL}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://www.trackmyopt.com" },
          { name: "Blog", url: "https://www.trackmyopt.com/blog" },
          { name: "Laid Off on STEM OPT", url: CANONICAL },
        ]}
      />

      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold mb-4">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">STEM OPT Compliance</span>
          <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-3 py-1 rounded-full">Time-Sensitive</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
          Laid Off on STEM OPT? I-983, Employer Changes &amp; the 150-Day Rule
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          A STEM OPT layoff is more complex than a regular OPT layoff. You have two simultaneous
          workstreams: correctly closing the old training opportunity and fully documenting a new
          one before you start. Here is how to handle both.
        </p>
        <div className="mt-6 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 14 min read</span>
          <span>•</span>
          <span>Updated July 27, 2026</span>
        </div>
      </header>

      <div className="relative w-full h-[420px] md:h-[520px] rounded-2xl overflow-hidden mb-12 shadow-xl">
        <img src="/blog/laid-off-on-stem-opt.png" alt="Form I-983 with 150-Day Rule sticky note, termination letter, and STEM OPT dashboard on laptop" className="object-cover w-full h-full" />
      </div>

      {/* Direct Answer */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">Direct Answer</p>
        <p className="text-gray-800 dark:text-gray-100 font-medium leading-relaxed">
          After a STEM OPT layoff: (1) confirm your final work date in writing, (2) request the
          former employer to complete a final Form I-983 Evaluation of Student Progress within
          10 days of the opportunity ending, (3) report the employment loss to your DSO, (4) do
          not simply edit the SEVP Portal without DSO guidance, and (5) complete a new Form I-983
          with a qualifying replacement employer before starting the new opportunity. Your combined
          initial OPT + STEM OPT unemployment limit is <strong>150 cumulative calendar days</strong>—
          STEM OPT does not give you a fresh 60 days after each layoff.
        </p>
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none">

        {/* Quick Facts */}
        <div className="not-prose grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Initial OPT limit", value: "90 days" },
            { label: "STEM OPT adds", value: "+60 days" },
            { label: "Combined total", value: "150 days" },
            { label: "Final evaluation due", value: "Within 10 days" },
          ].map((f) => (
            <div key={f.label} className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-primary mb-1">{f.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{f.label}</p>
            </div>
          ))}
        </div>

        <h2>Why STEM OPT Layoffs Are Different</h2>
        <p>
          When you are on initial post-completion OPT and lose your job, the primary compliance
          task is tracking and reporting the unemployment gap. On STEM OPT, a layoff triggers
          additional obligations that are specific to the STEM training program:
        </p>
        <ol>
          <li>
            <strong>A final Form I-983 Evaluation of Student Progress</strong> is required when
            any STEM training opportunity ends, including early endings caused by a layoff. The
            former employer must review and sign this evaluation.
          </li>
          <li>
            <strong>The DSO must be notified</strong> of the loss of employment, and the SEVIS
            record for STEM OPT employer information generally cannot be updated by a simple
            portal edit without DSO coordination.
          </li>
          <li>
            <strong>A new Form I-983 must be completed</strong> with the new employer before
            starting the new STEM training opportunity. You cannot carry an old I-983 to a
            new employer.
          </li>
        </ol>

        <h2>Step 1: Confirm the Final Day of STEM Training</h2>
        <p>
          The 10-day deadline for the final evaluation starts from the day the STEM training
          opportunity ends. The training opportunity ends on your last qualifying workday—not
          the date the company announced the layoff, not the last date of paid administrative
          leave.
        </p>
        <p>
          Get a written statement from HR or your manager that specifies the date you actually
          stopped performing training-related work. Save this with your STEM OPT records.
        </p>

        <div className="not-prose bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-5 rounded-r-xl my-6">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900 dark:text-amber-300 mb-1">Important: Paid Leave vs. Last Work Day</p>
              <p className="text-amber-800 dark:text-amber-200 text-sm">
                If your employer places you on a "paid leave" or "garden leave" period before
                the official termination date, the training opportunity may have ended earlier
                than your last paid day. Ask your DSO which date to use for the evaluation
                deadline. Using the wrong date can push a timely filing into a late one.
              </p>
            </div>
          </div>
        </div>

        <h2>Step 2: Request the Final Form I-983 Evaluation</h2>
        <p>
          The final Evaluation of Student Progress (Form I-983, Section 6) must be completed
          jointly: you complete the student self-evaluation portion, and the employer&apos;s
          authorized signatory reviews and signs the employer portion.
        </p>

        <h3>How to request it professionally</h3>
        <p>
          Even in an adversarial or rushed layoff situation, the employer is still responsible
          for completing this evaluation under the STEM OPT regulations. Send a written request
          (email is fine) to HR and your manager that:
        </p>
        <ul>
          <li>States you are on STEM OPT and a final I-983 evaluation is federally required</li>
          <li>Provides the evaluation section of the form as an attachment</li>
          <li>States the 10-day deadline from the training end date</li>
          <li>Includes your SEVIS ID and the training start and end dates for their records</li>
          <li>Asks for the name and title of the authorized signatory</li>
        </ul>
        <p>
          If the employer refuses or is unresponsive, document every attempt and immediately
          escalate to your DSO. For a full guide on that scenario, see:{" "}
          <Link href="/blog/employer-refuses-form-i983">
            What If Your Employer Refuses to Sign Form I-983?
          </Link>
        </p>

        <h3>What the evaluation must include</h3>
        <div className="not-prose">
          <ul className="space-y-2 my-4">
            {[
              "Student's name and SEVIS ID",
              "Employer name, address, EIN, and E-Verify company ID",
              "Training start and end dates",
              "Position title, duties, and learning objectives from the original I-983",
              "Student self-evaluation of progress toward learning objectives",
              "Employer assessment of the student's progress",
              "Authorized employer signatory name, title, and signature",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-800 dark:text-gray-200">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <h2>Step 3: Report to Your DSO and Update SEVIS</h2>
        <p>
          Contact your DSO on the same day or the next business day after the layoff, and provide:
        </p>
        <ul>
          <li>Your legal name and SEVIS ID</li>
          <li>Former employer name, address, and EIN</li>
          <li>Exact final date of STEM training</li>
          <li>Whether you have received or requested the final evaluation</li>
          <li>Whether you have a new qualifying employer in mind</li>
        </ul>
        <p>
          Your DSO will manage the SEVIS record update for the employer change. Do not simply
          delete the old employer or add a new one in the SEVP Portal without DSO confirmation—
          STEM OPT employer records involve more than a portal field.
        </p>

        <h2>Understanding the 150-Day Combined Unemployment Limit</h2>
        <p>
          The 150-day figure is the combined maximum unemployment allowance across your entire
          post-completion OPT sequence. It is calculated as:
        </p>
        <div className="not-prose bg-gray-50 dark:bg-zinc-800 rounded-xl p-5 my-6 border border-gray-200 dark:border-zinc-700">
          <p className="font-semibold text-gray-900 dark:text-white mb-3">How the 150-Day Math Works</p>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-zinc-600 pb-2">
              <span className="text-gray-600 dark:text-gray-300">Maximum unemployment during initial OPT</span>
              <span className="font-bold text-gray-900 dark:text-white">90 days</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-zinc-600 pb-2">
              <span className="text-gray-600 dark:text-gray-300">Additional days added by STEM OPT</span>
              <span className="font-bold text-gray-900 dark:text-white">60 days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-300 font-semibold">Combined maximum across both periods</span>
              <span className="font-bold text-primary text-lg">150 days</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-red-800 dark:text-red-300 text-xs font-medium">
              ⚠️ The 60 days from STEM OPT is NOT a fresh counter after each layoff. If you used
              50 days during initial OPT and you are now laid off on STEM OPT, you have 100 days
              total remaining—not 60 new days.
            </p>
          </div>
        </div>

        <h3>A real example: Arjun&apos;s timeline</h3>
        <div className="not-prose bg-gray-50 dark:bg-zinc-800 rounded-xl p-5 my-6 border border-gray-200 dark:border-zinc-700">
          <p className="font-semibold text-gray-900 dark:text-white mb-3">
            Arjun — Computer Science MS graduate
          </p>
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            {[
              ["Oct 1", "Initial OPT begins"],
              ["Oct 15", "Job 1 starts — 14 days unemployment used"],
              ["Dec 1", "OPT to STEM OPT transition, continues with same employer"],
              ["March 10", "Laid off — clock resumes at day 15"],
              ["May 14", "Day 90 (initial OPT exhausted) — now using STEM OPT's 60 extra days"],
              ["June 20", "Day 120 total — 30 days of STEM buffer remain"],
              ["July 13", "Day 150 — last day before status issue if no new qualifying job"],
            ].map(([date, desc]) => (
              <div key={date} className="flex gap-3">
                <span className="w-20 flex-shrink-0 font-medium text-primary">{date}</span>
                <span>{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <p>
          Use the <Link href="/dashboard/opt-tools/opt-clock">TrackMyOPT unemployment clock</Link>{" "}
          to maintain a running total across both OPT periods in one view.
        </p>

        <h2>Step 4: Find a Compliant Replacement STEM OPT Employer</h2>
        <p>
          The replacement employer must meet all STEM OPT requirements. Many students accept an
          offer under time pressure and discover later that the employer cannot complete the
          I-983 or is not E-Verify enrolled. Vet the employer before accepting.
        </p>

        <h3>STEM OPT employer requirements checklist</h3>
        <div className="not-prose">
          <ul className="space-y-3 my-4">
            {[
              "Enrolled and active in E-Verify (you can confirm at e-verify.uscis.gov)",
              "Has a real employer-employee relationship with you (W-2, not 1099 contractor)",
              "Pays you compensation commensurate with similarly situated US workers",
              "Can provide at least 20 hours of qualifying work per week",
              "Has a legitimate worksite that matches what you will report",
              "Has an authorized signatory who can complete and sign Form I-983",
              "Can provide a genuine training plan aligned with your STEM degree",
              "Is not a staffing agency acting as the sole employer of record without a real worksite client",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-800 dark:text-gray-200">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <p>
          See the detailed employer verification guide:{" "}
          <Link href="/blog/stem-opt-employer-requirements">STEM OPT Employer Requirements</Link>.
        </p>

        <h2>Step 5: Complete the New Form I-983 Before Starting</h2>
        <p>
          Do not start working for a new STEM OPT employer without completing and submitting
          a new Form I-983 through your DSO. The process is:
        </p>
        <ol>
          <li>Download the current Form I-983 from the DHS Study in the States website</li>
          <li>
            Complete Section 1 (student information) and Section 2 (employer information
            and training plan) with the new employer&apos;s authorized signatory
          </li>
          <li>
            Both you and the employer signatory sign the form
          </li>
          <li>Submit the completed I-983 to your DSO through your school&apos;s process</li>
          <li>
            Wait for DSO confirmation and a new I-20 (if required) before beginning
          </li>
          <li>
            Once authorized, report your new start date and confirm your SEVIS record
          </li>
        </ol>

        <div className="not-prose bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl p-6 my-10">
          <div className="flex items-start gap-4">
            <Calendar className="w-8 h-8 text-primary flex-shrink-0" />
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-lg mb-2">
                STEM OPT Planner in TrackMyOPT
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Track your unemployment day total, employer changes, I-983 deadlines, and
                six-month validation dates in one dashboard. Never miss a STEM OPT deadline
                again.
              </p>
              <Link
                href="/dashboard/opt-tools/stem-opt"
                className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm"
              >
                Open STEM OPT Planner <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        <h2>Special Situations</h2>

        <h3>Company acquired or merged — are you still on STEM OPT?</h3>
        <p>
          If your employer is acquired or merges into another company, the STEM OPT authorization
          may or may not transfer automatically. The new entity&apos;s E-Verify status, name,
          EIN, and worksite may all change. Contact your DSO immediately when any corporate
          transaction affects your employer and do not assume your I-983 automatically applies
          to the new entity.
        </p>

        <h3>Your employer wants you to become a contractor</h3>
        <p>
          If the company changes your status from W-2 employee to 1099 independent contractor,
          your STEM OPT authorization likely does not cover the new arrangement. STEM OPT requires
          a qualifying employer-employee relationship. A contractor relationship generally
          disqualifies the engagement. Discuss this with your DSO before accepting any change
          in employment type.
        </p>

        <h3>You are laid off during a six-month validation period</h3>
        <p>
          If the layoff happens close to a six-month validation date, the validation obligation
          still exists—but the details change. Ask your DSO how to handle a validation report
          for a training opportunity that ended before the scheduled date. See also:{" "}
          <Link href="/blog/stem-opt-six-month-validation-report">
            STEM OPT Six-Month Validation Reports and Self-Evaluations: Complete Calendar
          </Link>
          .
        </p>

        <h2>Complete Action Checklist</h2>
        <div className="not-prose bg-gray-50 dark:bg-zinc-800 rounded-2xl p-6 border border-gray-200 dark:border-zinc-700">
          <p className="font-bold text-gray-900 dark:text-white mb-4">Complete in order — do not skip steps:</p>
          <ul className="space-y-3">
            {[
              "Get written confirmation of the final STEM training date from HR",
              "Calculate the 10-day deadline for the final I-983 evaluation",
              "Send a written request to HR for the final evaluation",
              "Complete your self-evaluation section of Form I-983",
              "Email your DSO with: name, SEVIS ID, employer, final date, evaluation status",
              "Do not edit SEVP Portal employer fields without DSO guidance",
              "Update the TrackMyOPT unemployment clock with the gap start date",
              "Vet replacement employers for E-Verify status and I-983 capability",
              "Complete a new Form I-983 with the new employer",
              "Submit the new I-983 to your DSO and wait for authorization before starting",
              "Confirm the new employment start date and update the unemployment clock",
              "Save all documentation: both evaluations, DSO correspondence, portal screenshots",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-800 dark:text-gray-200">
                <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* FAQ */}
        <h2>Frequently Asked Questions</h2>
        <div itemScope itemType="https://schema.org/FAQPage" className="not-prose space-y-4">
          {[
            {
              q: "Does a STEM OPT layoff give me 60 new unemployment days?",
              a: "No. STEM OPT adds 60 days to the overall unemployment allowance — for a combined total of 150 days across initial OPT and STEM OPT. It does not create a fresh 60-day counter after each layoff. If you used 40 days during initial OPT and 10 days during STEM OPT, you have 100 days remaining total.",
            },
            {
              q: "When is the final Form I-983 evaluation due after a layoff?",
              a: "Generally within 10 days of when the STEM training opportunity ends. The 'end' date is your last qualifying work date, not the date the company announced the layoff or your last paid day. Confirm the exact date with your DSO.",
            },
            {
              q: "Can I start the new STEM job while waiting for DSO to process my new I-983?",
              a: "No. You must complete the new Form I-983 and receive DSO authorization (and a new I-20 if required) before beginning the new STEM training opportunity. Starting before authorization can create an unauthorized employment issue.",
            },
            {
              q: "What if the former employer refuses to complete the final I-983 evaluation?",
              a: "Document every request in writing and immediately escalate to your DSO. Do not sign the employer section yourself. Your DSO will advise on how the school's records will reflect the situation. See our dedicated guide on this topic for a step-by-step response plan.",
            },
            {
              q: "Can I go back to initial OPT employment rules if I cannot find a STEM employer?",
              a: "Once you begin STEM OPT, you are under STEM OPT rules for the duration of that extension. You cannot revert to initial OPT employer rules while on the STEM OPT EAD. If you cannot find a qualifying STEM employer, discuss your options with your DSO — including whether you can enroll in a new academic program.",
            },
            {
              q: "My new employer is not yet in E-Verify. Can I start while they complete enrollment?",
              a: "Generally, no. E-Verify enrollment is a prerequisite for STEM OPT employment — not something that can be completed after you start. Do not begin work until the employer is actively enrolled and has a company ID number. Confirm with your DSO.",
            },
            {
              q: "Does a company acquisition require a new I-983?",
              a: "Possibly yes, especially if the acquiring entity has a different legal name, EIN, or E-Verify enrollment. Contact your DSO as soon as you learn of the acquisition and do not assume your current I-983 applies to the successor company.",
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
            { label: "SEVP Portal Student User Guide", href: "https://studyinthestates.dhs.gov/assets/SEVP%20Portal%20Student%20User%20Guide.pdf" },
            { label: "ICE Practical Training Guidance", href: "https://www.ice.gov/sevis/practical-training" },
          ].map((s) => (
            <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:text-primary hover:border-primary/30 transition-colors">
              <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
              {s.label}
            </a>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="not-prose mt-10 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl p-5">
          <div className="flex gap-3">
            <ShieldCheck className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <strong className="text-gray-700 dark:text-gray-300">Immigration Disclaimer:</strong>{" "}
              This article is for general informational purposes only and does not constitute legal
              advice. Immigration rules change frequently and individual circumstances vary. Always
              consult your Designated School Official (DSO) and, when necessary, a licensed
              immigration attorney before making decisions about your F-1 or STEM OPT status.
            </p>
          </div>
        </div>

        {/* Related */}
        <div className="not-prose mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Guides</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { href: "/blog/laid-off-on-opt", title: "Laid Off on OPT (Initial)", desc: "The initial OPT version of this guide — 90-day limit, reporting steps, and job search strategy." },
              { href: "/blog/change-employers-stem-opt", title: "How to Change Employers on STEM OPT", desc: "Voluntary employer changes — I-983 sequence, final evaluations, and SEVIS deadlines." },
              { href: "/blog/employer-refuses-form-i983", title: "Employer Refuses to Sign Form I-983", desc: "Step-by-step guide for when your employer won't complete or sign the required form." },
              { href: "/blog/stem-opt-six-month-validation-report", title: "STEM OPT Validation Report Calendar", desc: "Six-month validations, 12-month evaluations, and final evaluations — all deadlines in one place." },
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
