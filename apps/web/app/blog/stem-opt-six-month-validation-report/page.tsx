import type { Metadata } from "next";
import { BlogPostImage } from "@/components/blog/BlogPostImage";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, ExternalLink, ShieldCheck, Calendar } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import { AuthorBio } from "@/components/blog/AuthorBio";

const CANONICAL = "https://www.trackmyopt.com/blog/stem-opt-six-month-validation-report";

export const metadata: Metadata = {
  title: "STEM OPT 6-Month Validation Reports and Self-Evaluations: Complete Calendar",
  description:
    "Master the STEM OPT reporting calendar: when six-month validation reports are due, how to complete the 12-month self-evaluation, what the final evaluation requires, and how to handle employer changes that shift your deadlines.",
  keywords: [
    "STEM OPT six month validation report",
    "STEM OPT self evaluation deadline",
    "STEM OPT reporting calendar",
    "12 month I-983 evaluation",
    "STEM OPT final evaluation",
    "STEM OPT reporting requirements",
    "Form I-983 evaluation schedule",
  ],
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: "STEM OPT 6-Month Validation Reports and Self-Evaluations: Complete Calendar",
    description: "Every STEM OPT reporting deadline on one calendar — six-month validations, 12-month evaluations, final evaluations, and change-triggered reports.",
    url: CANONICAL,
    type: "article",
    images: [{ url: "https://www.trackmyopt.com/og-image.jpg", width: 1200, height: 630, alt: "STEM OPT Reporting Calendar" }],
  },
    twitter: {
        card: "summary_large_image",
        title: "STEM OPT 6-Month Validation Reports and Self-Evaluations: Complete Calendar",
        description: "Every STEM OPT reporting deadline on one calendar — six-month validations, 12-month evaluations, final evaluations, and change-triggered reports.",
        images: ["https://www.trackmyopt.com/og-image.jpg"],
    },
};

export default function StemOptValidationReportPage() {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BlogPostSchema title={metadata.title as string} description={metadata.description as string} publishedDate="2026-07-27" modifiedDate="2026-07-27" author="TrackMyOPT Immigration Team" canonicalUrl={CANONICAL} />
      <BreadcrumbSchema items={[{ name: "Home", url: "https://www.trackmyopt.com" }, { name: "Blog", url: "https://www.trackmyopt.com/blog" }, { name: "STEM OPT Validation Report Calendar", url: CANONICAL }]} />

      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold mb-4">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">STEM OPT Reporting</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
          STEM OPT 6-Month Validation Reports and Self-Evaluations: Complete Calendar
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          STEM OPT has four types of reporting obligations — each with different deadlines,
          different purposes, and different consequences for missing them. This guide puts
          every deadline on one calendar so nothing slips.
        </p>
        <div className="mt-6 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 11 min read</span>
          <span>•</span>
          <span>Updated July 27, 2026</span>
        </div>
      </header>

      <div className="relative w-full h-[420px] md:h-[520px] rounded-2xl overflow-hidden mb-12 shadow-xl">
        <BlogPostImage src="/blog/stem-opt-six-month-validation-report.png" alt="STEM OPT reporting calendar with validation deadlines, SEVIS confirmation, and Form I-983" className="object-cover w-full h-full" sizes="(max-width: 768px) 100vw, 768px" priority />
      </div>

      {/* Direct Answer */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">Direct Answer</p>
        <p className="text-gray-800 dark:text-gray-100 font-medium leading-relaxed">
          STEM OPT students must validate required personal and employment information with their DSO
          every six months. In addition, they must submit a student self-evaluation at the 12-month
          mark, and a final evaluation when the STEM training opportunity ends. An employer change,
          address change, or material I-983 change can create additional deadlines outside the regular
          cycle. Put all four types of deadlines on your calendar starting from your STEM OPT EAD
          start date.
        </p>
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none">

        {/* Four types overview */}
        <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {[
            { title: "Six-Month Validation", freq: "Every 6 months", desc: "Confirms personal and employment information is still accurate in SEVIS.", color: "border-blue-400" },
            { title: "12-Month Self-Evaluation", freq: "At month 12", desc: "Student and employer describe training progress against I-983 learning objectives.", color: "border-green-400" },
            { title: "Final Evaluation", freq: "When opportunity ends", desc: "Required when the STEM training period ends — even if it ends early due to a layoff.", color: "border-orange-400" },
            { title: "Change-Triggered Reports", freq: "Within 10 days", desc: "Employer change, address change, material I-983 updates, or loss of employment.", color: "border-red-400" },
          ].map((item) => (
            <div key={item.title} className={`bg-white dark:bg-zinc-900 border-l-4 ${item.color} border border-gray-200 dark:border-zinc-700 rounded-xl p-4`}>
              <p className="font-bold text-gray-900 dark:text-white mb-1">{item.title}</p>
              <p className="text-xs text-primary font-semibold mb-2">{item.freq}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{item.desc}</p>
            </div>
          ))}
        </div>

        <h2>Type 1: Six-Month Validation Reports</h2>
        <p>
          The six-month validation is the most routine STEM OPT obligation. Every six months
          from your STEM OPT EAD start date, you must validate that your SEVIS record accurately
          reflects your current status. Think of it as a check-in with your DSO that says:
          "Everything in my record is still correct."
        </p>

        <h3>What the validation covers</h3>
        <p>The validation generally confirms that the following are still accurate:</p>
        <ul>
          <li>Your legal name and contact information</li>
          <li>Your U.S. address</li>
          <li>Your employer name, address, and EIN</li>
          <li>Your worksite address (if different from employer address)</li>
          <li>Your position title and employment start date</li>
          <li>Your supervisor&apos;s name and contact information</li>
          <li>Your current STEM OPT authorization period</li>
        </ul>

        <h3>How to calculate your validation dates</h3>
        <p>
          Start with the STEM OPT authorization start date printed on your EAD (not your
          initial OPT start date). Count six calendar months forward for the first validation,
          12 months for the second, 18 months for the third, and 24 months for the fourth.
        </p>

        <div className="not-prose bg-gray-50 dark:bg-zinc-800 rounded-xl p-5 my-6 border border-gray-200 dark:border-zinc-700">
          <p className="font-semibold text-gray-900 dark:text-white mb-3">Example: STEM OPT starts October 1</p>
          <div className="space-y-2 text-sm">
            {[
              ["Month 6", "April 1", "1st six-month validation due"],
              ["Month 12", "October 1", "2nd validation + 1st self-evaluation due"],
              ["Month 18", "April 1 (Year 2)", "3rd six-month validation due"],
              ["Month 24", "October 1 (Year 2)", "4th validation — STEM OPT ends"],
              ["End of training", "Whenever it ends", "Final evaluation due within 10 days"],
            ].map(([month, date, desc]) => (
              <div key={month} className="flex gap-3 items-start">
                <span className="w-20 flex-shrink-0 font-medium text-primary text-xs pt-0.5">{month}</span>
                <span className="w-36 flex-shrink-0 text-gray-500 dark:text-gray-400 text-xs pt-0.5">{date}</span>
                <span className="text-gray-800 dark:text-gray-200 text-xs">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        <h3>Your DSO&apos;s role in validations</h3>
        <p>
          Your DSO is responsible for confirming the validation in SEVIS. Your job is to
          contact your DSO before the deadline, provide accurate information, and keep proof
          of the validation—an email confirmation or DSO statement. Do not assume the
          validation happened automatically if you did not actively contact your DSO.
        </p>

        <div className="not-prose bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-5 rounded-r-xl my-6">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900 dark:text-amber-300 mb-1">Do not let a validation lapse</p>
              <p className="text-amber-800 dark:text-amber-200 text-sm">
                A missed six-month validation is a SEVIS record compliance problem that your DSO
                must address. Contact your DSO as soon as you realize a deadline is approaching or
                was missed. The longer you wait, the more complicated the correction.
              </p>
            </div>
          </div>
        </div>

        <h2>Type 2: The 12-Month Self-Evaluation</h2>
        <p>
          At the 12-month point of your STEM OPT authorization, you must complete a formal
          self-evaluation of your training progress. This is one of the most substantive
          compliance obligations because it requires real reflection on how the training
          opportunity is helping you develop skills from your STEM degree.
        </p>

        <h3>What the self-evaluation must include</h3>
        <p>
          The 12-month evaluation uses Form I-983 Section 6 — Evaluation of Student Progress.
          The student portion should describe:
        </p>
        <ul>
          <li>Which learning objectives from your original I-983 training plan you have worked toward</li>
          <li>Specific skills, tools, technologies, or methodologies you have applied or developed</li>
          <li>Projects, products, or outcomes that demonstrate progress</li>
          <li>Any challenges and how you addressed them</li>
          <li>Areas where you plan to develop further in the remaining training period</li>
        </ul>
        <p>
          The employer&apos;s authorized signatory must review and sign the employer portion,
          which generally includes their assessment of your progress and whether the training
          plan remains appropriate. This is not a generic performance review—it must connect
          to the I-983 training plan.
        </p>

        <h3>Preparing a strong 12-month evaluation</h3>
        <p>
          Start drafting your self-evaluation two to three weeks before the deadline. Pull
          out your original Form I-983 and compare each learning objective against what you
          have actually done. If you have detailed project records or performance feedback,
          use them to write specific, accurate descriptions rather than generic phrases like
          "I improved my technical skills."
        </p>

        <h2>Type 3: The Final Evaluation</h2>
        <p>
          The final Evaluation of Student Progress is due when the STEM training opportunity
          ends—regardless of the reason. Whether you complete the full 24 months, voluntarily
          resign, or are laid off, the final evaluation must be submitted within 10 days of
          the training end date.
        </p>

        <h3>Who must sign</h3>
        <p>
          The employer&apos;s authorized signatory must complete and sign the employer portion.
          If the employer is unresponsive or refuses, document your attempts and contact your
          DSO immediately. See:{" "}
          <Link href="/blog/employer-refuses-form-i983">
            What If Your Employer Refuses to Sign Form I-983?
          </Link>
        </p>

        <h2>Type 4: Change-Triggered Reports (Within 10 Days)</h2>
        <p>
          Outside the regular calendar, the following changes require prompt reporting to your
          DSO—generally within 10 days of the change:
        </p>
        <div className="not-prose overflow-x-auto my-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-primary/10">
                <th className="text-left p-3 font-semibold border border-gray-200 dark:border-zinc-700">Change Type</th>
                <th className="text-left p-3 font-semibold border border-gray-200 dark:border-zinc-700">Report Required</th>
                <th className="text-left p-3 font-semibold border border-gray-200 dark:border-zinc-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Employer change", "New employer + new I-983", "Submit to DSO before starting new employer"],
                ["Loss of employment", "Employment end date + unemployment tracking", "Notify DSO; do not delay"],
                ["U.S. address change", "Updated address in SEVIS", "Notify DSO and update SEVP Portal if applicable"],
                ["Material I-983 change", "Updated training plan details", "Submit amendment through DSO"],
                ["Change in worksite", "Updated worksite on I-983", "Notify DSO; may require I-983 amendment"],
              ].map(([type, report, action], i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-gray-50 dark:bg-zinc-800"}>
                  <td className="p-3 border border-gray-200 dark:border-zinc-700 font-medium text-gray-900 dark:text-white">{type}</td>
                  <td className="p-3 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300">{report}</td>
                  <td className="p-3 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-400 text-xs">{action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>Building Your Personal STEM OPT Calendar</h2>
        <p>
          Create a calendar on the day your STEM OPT EAD start date is confirmed. Enter:
        </p>
        <div className="not-prose">
          <ul className="space-y-3 my-4">
            {[
              "STEM OPT authorization start date (from EAD)",
              "Six-month validation dates (6, 12, 18, 24 months from start)",
              "12-month self-evaluation deadline",
              "Anticipated training end date (for final evaluation planning)",
              "30-day pre-deadline reminders for each validation",
              "14-day and 3-day reminders for each validation",
              "Any known change events (planned employer change, upcoming move)",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-800 dark:text-gray-200">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="not-prose bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl p-6 my-10">
          <div className="flex items-start gap-4">
            <Calendar className="w-8 h-8 text-primary flex-shrink-0" />
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-lg mb-2">STEM OPT Planner in TrackMyOPT</p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Enter your STEM OPT start date once and get automatic reminders for every
                validation date, evaluation deadline, and employer-change report window.
                Never lose track of where you are in the 24-month calendar.
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
              q: "How often are STEM OPT validation reports due?",
              a: "Every six months from your STEM OPT authorization start date. For a 24-month STEM extension, that means four validation deadlines: at months 6, 12, 18, and 24. Confirm the exact dates with your DSO based on your EAD start date.",
            },
            {
              q: "When is the first STEM OPT self-evaluation due?",
              a: "At the 12-month mark of your STEM OPT period. It coincides with the second six-month validation. A final evaluation is due within 10 days of when the training opportunity ends.",
            },
            {
              q: "What if I miss a six-month validation report?",
              a: "Contact your DSO immediately, explain what happened, and ask how to correct the record. A missed validation is a compliance issue that needs DSO attention — do not assume a late submission is harmless or that it self-corrects.",
            },
            {
              q: "Does an employer change reset my six-month validation calendar?",
              a: "No — the six-month calendar runs from the original STEM OPT start date. An employer change does not create new six-month validation dates. However, it does create a separate 10-day reporting obligation for the change itself.",
            },
            {
              q: "Can my employer write my self-evaluation for me?",
              a: "No. The student writes the self-evaluation section; the employer reviews and signs the employer section. The content of your self-evaluation should accurately describe your experience and progress against the learning objectives in your Form I-983 training plan.",
            },
            {
              q: "What if I change employers right before a six-month validation date?",
              a: "You still need to complete the validation on schedule with your DSO. The validation will reflect your new employer's information. If the employer change happens very close to the validation date, contact your DSO immediately to coordinate both the employer change report and the validation report at the same time.",
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
            { label: "SEVP Portal Student Guide", href: "https://studyinthestates.dhs.gov/assets/SEVP%20Portal%20Student%20User%20Guide.pdf" },
            { label: "ICE Practical Training Guidance", href: "https://www.ice.gov/sevis/practical-training" },
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
              advice. Consult your DSO and a licensed immigration attorney for advice specific to
              your STEM OPT situation.
            </p>
          </div>
        </div>

        <div className="not-prose mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Guides</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { href: "/blog/change-employers-stem-opt", title: "How to Change Employers on STEM OPT", desc: "The full employer-change sequence including I-983 and SEVIS reporting deadlines." },
              { href: "/blog/employer-refuses-form-i983", title: "Employer Refuses to Sign Form I-983", desc: "What to do when an employer won't complete or sign the required evaluation." },
              { href: "/blog/laid-off-on-stem-opt", title: "Laid Off on STEM OPT", desc: "Final evaluations, the 150-day combined limit, and finding a replacement employer." },
              { href: "/blog/i-983-training-plan-guide", title: "Form I-983 Training Plan Guide", desc: "How to write a strong training plan with genuine learning objectives." },
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
