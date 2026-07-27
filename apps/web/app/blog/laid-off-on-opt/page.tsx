import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Briefcase,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import { AuthorBio } from "@/components/blog/AuthorBio";

const CANONICAL = "https://www.trackmyopt.com/blog/laid-off-on-opt";

export const metadata: Metadata = {
  title: "Laid Off on OPT? Reporting Deadlines, Unemployment Days & Next Steps",
  description:
    "Lost your job on OPT? Learn exactly what to report, when unemployment days begin counting, what records to save, and how to build a compliant re-employment plan before the 90-day limit expires.",
  keywords: [
    "laid off on OPT",
    "OPT layoff unemployment days",
    "what to do after OPT job loss",
    "report employment end date OPT",
    "OPT job search after layoff",
    "90 day OPT unemployment rule",
    "DSO reporting layoff",
    "SEVIS employment change",
  ],
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: "Laid Off on OPT? Reporting Deadlines, Unemployment Days & Next Steps",
    description:
      "Step-by-step guide for F-1 students who lost their OPT job: reporting to DSO, counting unemployment days, and finding a compliant new role before the clock runs out.",
    url: CANONICAL,
    type: "article",
    images: [
      {
        url: "https://www.trackmyopt.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Laid Off on OPT — F-1 Student Guide",
      },
    ],
  },
};

export default function LaidOffOnOPTPage() {
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
          {
            name: "Laid Off on OPT",
            url: CANONICAL,
          },
        ]}
      />

      {/* Header */}
      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold mb-4">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">OPT Compliance</span>
          <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-3 py-1 rounded-full">Urgent</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
          Laid Off on OPT? Reporting Deadlines, Unemployment Days &amp; Next Steps
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          A layoff does not automatically mean you lose your F-1 status. But what you do in the
          next 48–72 hours determines whether you stay compliant or fall out of status. This guide
          walks through every step.
        </p>
        <div className="mt-6 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" /> 12 min read
          </span>
          <span>•</span>
          <span>Updated July 27, 2026</span>
        </div>
      </header>

      <div className="relative w-full h-[420px] md:h-[520px] rounded-2xl overflow-hidden mb-12 shadow-xl">
        <img src="/blog/laid-off-on-opt.png" alt="Termination letter, Indian passport, EAD card and job search on laptop" className="object-cover w-full h-full" />
      </div>

      {/* Direct AI-Friendly Answer Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
          Direct Answer
        </p>
        <p className="text-gray-800 dark:text-gray-100 font-medium leading-relaxed">
          If you are laid off on initial post-completion OPT, your unemployment clock begins the
          day after your last qualifying workday. You have up to <strong>90 cumulative calendar
          days</strong> of unemployment across your entire OPT period. Your immediate actions are:
          (1) confirm your last day worked in writing, (2) report the employment change to your
          DSO, (3) start tracking days, and (4) begin a compliant job search. Do not assume the
          clock starts later—it does not wait for paperwork.
        </p>
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none">

        {/* Quick Facts */}
        <div className="not-prose grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { label: "Unemployment limit", value: "90 days (initial OPT)" },
            { label: "First action", value: "Confirm last day in writing" },
            { label: "Report to", value: "Your DSO (same day if possible)" },
          ].map((f) => (
            <div
              key={f.label}
              className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl p-4 text-center"
            >
              <p className="text-2xl font-bold text-primary mb-1">{f.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{f.label}</p>
            </div>
          ))}
        </div>

        <h2>The Moment You Are Laid Off: The First 24 Hours</h2>
        <p>
          A layoff creates an urgent compliance task list that many students overlook in the shock
          of the moment. Before you update your LinkedIn headline, do these three things:
        </p>
        <ol>
          <li>
            <strong>Get the last-day-of-employment in writing.</strong> Ask HR for a written
            separation notice, termination letter, or email that states your final work date. If
            they offer severance, the severance agreement will usually include this date—read it
            carefully before signing anything.
          </li>
          <li>
            <strong>Note the date—not tomorrow, not Monday—the actual last day you performed
            qualifying work.</strong> If today is a paid administrative leave day but you stopped
            performing services a week ago, the clock likely started earlier. Ask your DSO to
            clarify.
          </li>
          <li>
            <strong>Email your DSO today.</strong> You do not need a perfect explanation. A brief
            email stating your name, SEVIS ID, last employer, and last day worked is enough to
            start the conversation. Your DSO will guide the next steps.
          </li>
        </ol>

        <div className="not-prose bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-5 rounded-r-xl my-8">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900 dark:text-amber-300 mb-1">Common mistake</p>
              <p className="text-amber-800 dark:text-amber-200 text-sm">
                Many students wait until they find a new job to report the old one ended. This can
                create a gap in your SEVIS record that is very difficult to explain later—especially
                on H-1B petitions or future visa applications where USCIS will review your OPT
                employment history chronologically.
              </p>
            </div>
          </div>
        </div>

        <h2>How the 90-Day Unemployment Clock Works</h2>
        <p>
          The 90-day limit is one of the most misunderstood rules in F-1 immigration. Here is
          exactly how it operates:
        </p>

        <h3>What counts as an unemployment day</h3>
        <p>
          Any calendar day—including weekends and federal holidays—during which you do not have
          qualifying employment in your authorized period counts as an unemployment day. It is
          cumulative: if you used 20 days of unemployment before being laid off and you now have
          a gap, you start from day 21, not day 1.
        </p>

        <h3>What stops the clock</h3>
        <p>
          Qualifying employment stops the clock. For initial OPT, this means work that is:
        </p>
        <ul>
          <li>Authorized under your EAD and within the authorization dates</li>
          <li>Directly related to your major or degree program</li>
          <li>At least 20 hours per week</li>
          <li>Reported to your DSO</li>
        </ul>
        <p>
          The clock does not stop on the day you sign an offer letter. It stops on the day you
          actually begin performing qualifying work.
        </p>

        <h3>A practical example</h3>
        <div className="not-prose bg-gray-50 dark:bg-zinc-800 rounded-xl p-5 my-6 border border-gray-200 dark:border-zinc-700">
          <p className="font-semibold text-gray-900 dark:text-white mb-3">Scenario: Priya&apos;s Timeline</p>
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex gap-3">
              <span className="w-28 flex-shrink-0 font-medium">Jan 15</span>
              <span>OPT authorized start date (EAD begins)</span>
            </div>
            <div className="flex gap-3">
              <span className="w-28 flex-shrink-0 font-medium">Jan 29</span>
              <span>Priya starts her first job (14 days of unemployment accumulated)</span>
            </div>
            <div className="flex gap-3">
              <span className="w-28 flex-shrink-0 font-medium">June 10</span>
              <span>Priya is laid off (clock resumes from day 15)</span>
            </div>
            <div className="flex gap-3">
              <span className="w-28 flex-shrink-0 font-medium">Aug 20</span>
              <span>Day 76 of total unemployment — Priya has ~14 days left. Urgent!</span>
            </div>
            <div className="flex gap-3">
              <span className="w-28 flex-shrink-0 font-medium">Sept 3</span>
              <span>Day 90 — deadline to have qualifying employment or OPT period ends</span>
            </div>
          </div>
        </div>

        <p>
          Priya&apos;s example shows why tracking from day one matters. Use the{" "}
          <Link href="/dashboard/opt-tools/opt-clock">TrackMyOPT unemployment clock</Link> to
          enter your original start date, each employment period, and each gap, so you always
          know exactly how many days remain.
        </p>

        <h2>What to Report—and How</h2>
        <p>
          When you report a layoff to your DSO, include all of the following information:
        </p>

        <div className="not-prose">
          <ul className="space-y-3 my-6">
            {[
              "Your full legal name and SEVIS ID",
              "Your employer's legal name and address",
              "Your exact last day of qualifying employment",
              "Whether you have already received a written separation notice",
              "Whether you have any other qualifying employment currently active",
              "Any upcoming offer letters or job prospects you want to mention",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-800 dark:text-gray-200">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <p>
          Your DSO may update your SEVIS record directly, or may direct you to update certain
          information in the SEVP Portal. Keep a screenshot or email confirmation of every
          reporting step. These records matter for future immigration filings.
        </p>

        <h2>Documents to Save Immediately After a Layoff</h2>
        <p>
          The documents you collect in the days after a layoff form the foundation of your
          OPT employment record. Many students wait too long and then cannot recover these files.
          Save the following immediately:
        </p>

        <h3>From the employer</h3>
        <ul>
          <li>Written termination or separation notice with your last day of work</li>
          <li>Any severance agreement (read carefully before signing)</li>
          <li>Final pay stub or W-2 confirming compensation dates</li>
          <li>Offer letter and job description from when you were hired</li>
          <li>Performance reviews, project summaries, or any written record of duties</li>
          <li>Supervisor&apos;s name, title, and contact information</li>
        </ul>

        <h3>Your own records</h3>
        <ul>
          <li>Copy of your EAD (front and back)</li>
          <li>Copy of the I-20 that recommended this OPT period</li>
          <li>Screenshot of USCIS approval notice</li>
          <li>DSO correspondence confirming the employment was reported</li>
          <li>
            Short written explanation of how the job related to your degree (if not obvious
            from the title)
          </li>
        </ul>

        <p>
          Store everything in a secure digital location. The{" "}
          <Link href="/features/compliance">TrackMyOPT Document Vault</Link> organizes these by
          employer and authorization period, which is exactly how future visa petitions will
          ask about your work history.
        </p>

        <h2>Building Your Re-Employment Plan</h2>
        <p>
          With 90 days maximum and some days already used, your job search needs to be
          structured. Here is how to think about it:
        </p>

        <h3>Prioritize roles where the degree relationship is clear</h3>
        <p>
          A computer science graduate applying to software engineering roles has a clear
          relationship story. A business administration graduate applying to a project
          management role may need to write a more detailed explanation. Start with
          applications where the connection between your degree and the duties is obvious—
          you need a fast hire, not a compliance conversation.
        </p>

        <h3>Verify the employer before you accept</h3>
        <p>
          Before accepting an offer, confirm:
        </p>
        <ul>
          <li>The employer is a real company with a verifiable EIN and address</li>
          <li>For STEM OPT: the employer is E-Verify enrolled</li>
          <li>The worksite matches what you will report to your DSO</li>
          <li>The role description connects to your degree</li>
          <li>The offer is for at least 20 hours per week</li>
        </ul>

        <p>
          Use the <Link href="/blog/opt-stem-opt-job-offer-verification-checklist">OPT job offer
          verification checklist</Link> before accepting any role under time pressure.
        </p>

        <h3>Use every legal networking tool</h3>
        <p>
          OPT job searching allows you to attend networking events, apply through platforms, work
          with recruiters, and participate in career fairs. You cannot, however, begin performing
          work without authorization. Attending an interview or signing an offer letter is fine.
          Starting work without a valid EAD covering the start date is not.
        </p>

        <div className="not-prose bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl p-6 my-10">
          <div className="flex items-start gap-4">
            <Briefcase className="w-8 h-8 text-primary flex-shrink-0" />
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-lg mb-2">
                TrackMyOPT Job Tracker
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Log every application, interview stage, and offer status in one dashboard. Set
                alerts before day 60, 75, and 85 so you always know how much time remains. The
                tracker is built for exactly this situation.
              </p>
              <Link
                href="/features/job-tracker"
                className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm"
              >
                Open Job Tracker <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        <h2>What About Volunteer Work or Unpaid Internships?</h2>
        <p>
          During initial OPT, unpaid positions can qualify in limited circumstances—specifically
          when the work is directly related to your degree and meets the applicable hours and
          authorization requirements. However, relying on volunteer work as your strategy while
          running out of unemployment days is risky. Some schools and DSOs are skeptical of
          unpaid arrangements that arise only after a layoff.
        </p>
        <p>
          If you are considering a volunteer or unpaid position, ask your DSO in writing whether
          it counts before you rely on it to stop the clock.
        </p>

        <h2>Special Situations</h2>

        <h3>You are on STEM OPT and got laid off</h3>
        <p>
          STEM OPT has its own employer-change and reporting requirements, including final Form
          I-983 evaluations and a combined 150-day unemployment limit. See the dedicated guide:{" "}
          <Link href="/blog/laid-off-on-stem-opt">
            Laid Off on STEM OPT: I-983, Employer Changes &amp; the 150-Day Rule
          </Link>
          .
        </p>

        <h3>You are in the cap-gap period</h3>
        <p>
          If an H-1B petition was filed on your behalf and you are in cap-gap status, a layoff
          during the cap-gap period creates unique risks. See:{" "}
          <Link href="/blog/h1b-cap-gap-extension">
            H-1B Cap-Gap Extension: What Happens If You Lose Your Job
          </Link>
          .
        </p>

        <h3>You had multiple jobs and one ended</h3>
        <p>
          If you held two qualifying jobs and one was eliminated, your remaining qualifying
          employment may still stop the clock—provided it is at least 20 hours per week and
          properly reported. Confirm with your DSO that the record reflects the correct
          current employment.
        </p>

        <h2>Step-by-Step Checklist</h2>
        <div className="not-prose">
          <div className="bg-gray-50 dark:bg-zinc-800 rounded-2xl p-6 border border-gray-200 dark:border-zinc-700">
            <p className="font-bold text-gray-900 dark:text-white mb-4">Complete this within 48 hours of your layoff:</p>
            <ul className="space-y-3">
              {[
                "Get written confirmation of your last day of qualifying employment",
                "Email your DSO with your name, SEVIS ID, employer, and final work date",
                "Calculate remaining unemployment days using the TrackMyOPT clock",
                "Set calendar alerts at day 60, 75, and 85",
                "Collect and back up all employer documents listed above",
                "Begin a compliant job search focused on roles clearly related to your degree",
                "Verify any new offer for degree relevance, hours, employer legitimacy, and E-Verify (STEM only)",
                "Report the new job to your DSO before or on the start date",
                "Confirm SEVIS record is updated and save the confirmation",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-800 dark:text-gray-200">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* FAQ Section with Schema */}
        <h2>Frequently Asked Questions</h2>

        <div
          itemScope
          itemType="https://schema.org/FAQPage"
          className="not-prose space-y-4"
        >
          {[
            {
              q: "How many unemployment days do I have after a layoff on OPT?",
              a: "Initial post-completion OPT allows up to 90 cumulative calendar days of unemployment across the entire OPT period. This counter does not reset. If you used 20 days before the layoff, you have 70 remaining. STEM OPT adds 60 more days for a combined 150-day limit.",
            },
            {
              q: "Do I have to report a layoff to my DSO?",
              a: "Yes. Employment changes—including a layoff—must be reported through your DSO. The exact method depends on your school's process. Some schools use the SEVP Portal; others require direct DSO notification. Always keep confirmation of every report.",
            },
            {
              q: "Does the unemployment clock start the day of the layoff or the next day?",
              a: "It generally starts the day after your last qualifying employment day. If your last qualifying workday is June 10, day 1 of unemployment is June 11. Confirm the specific date treatment with your DSO.",
            },
            {
              q: "Can I work a part-time job while searching for a full-time role after a layoff?",
              a: "Yes, if the part-time job is related to your degree and at least 20 hours per week. It must be reported to your DSO, and it will stop the unemployment clock while you continue your full-time search. Make sure you report both positions accurately.",
            },
            {
              q: "Can I accept a new job offer before the EAD for the new employer arrives?",
              a: "You can accept an offer and plan a start date, but you cannot begin performing work until you have valid work authorization for that start date. Your existing OPT EAD covers authorized employment during the OPT period—no new EAD is needed if you stay on the same OPT authorization.",
            },
            {
              q: "What if I cannot find a job before the 90-day limit?",
              a: "If you exhaust your unemployment days without new qualifying employment, your OPT authorization effectively ends even if the EAD shows a future date. Contact your DSO as early as possible—there may be options such as enrolling in a new academic program, applying for Severe Economic Hardship authorization, or other pathways. Do not wait until day 89 to have this conversation.",
            },
            {
              q: "Can TrackMyOPT extend my unemployment limit?",
              a: "No. TrackMyOPT is a tracking and compliance tool. It calculates deadlines, sends alerts, and helps you organize documents—but it cannot change your immigration authorization or SEVIS record. Only USCIS and your DSO can affect those.",
            },
          ].map((item, i) => (
            <div
              key={i}
              itemScope
              itemProp="mainEntity"
              itemType="https://schema.org/Question"
              className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl p-5"
            >
              <p
                itemProp="name"
                className="font-bold text-gray-900 dark:text-white mb-2"
              >
                {item.q}
              </p>
              <div
                itemScope
                itemProp="acceptedAnswer"
                itemType="https://schema.org/Answer"
              >
                <p itemProp="text" className="text-gray-600 dark:text-gray-300 text-sm">
                  {item.a}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Official Sources */}
        <h2>Official Sources</h2>
        <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              label: "ICE Practical Training Guidance",
              href: "https://www.ice.gov/sevis/practical-training",
            },
            {
              label: "ICE OPT Employment Guidance",
              href: "https://www.ice.gov/sevis/employment",
            },
            {
              label: "DHS Study in the States — OPT",
              href: "https://studyinthestates.dhs.gov/students/opt",
            },
            {
              label: "USCIS OPT Information",
              href: "https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-opt-for-f-1-students",
            },
          ].map((s) => (
            <a
              key={s.href}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:text-primary hover:border-primary/30 transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
              {s.label}
            </a>
          ))}
        </div>

        {/* Immigration Disclaimer */}
        <div className="not-prose mt-10 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl p-5">
          <div className="flex gap-3">
            <ShieldCheck className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <strong className="text-gray-700 dark:text-gray-300">Immigration Disclaimer:</strong>{" "}
              This article is for general informational purposes only and does not constitute legal
              advice. Immigration rules change frequently and individual circumstances vary. Always
              consult your Designated School Official (DSO) and, when necessary, a licensed
              immigration attorney before making decisions about your F-1 status or OPT
              authorization.
            </p>
          </div>
        </div>

        {/* Related Articles */}
        <div className="not-prose mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Related Guides
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                href: "/blog/laid-off-on-stem-opt",
                title: "Laid Off on STEM OPT: I-983 & the 150-Day Rule",
                desc: "STEM OPT has different rules for layoffs — final evaluations, employer changes, and a 150-day combined limit.",
              },
              {
                href: "/blog/90-day-unemployment-rule-opt",
                title: "The 90-Day OPT Unemployment Rule Explained",
                desc: "How the 90-day counter works, what counts, what doesn't, and how to avoid running out of days.",
              },
              {
                href: "/blog/opt-employment-evidence-checklist",
                title: "OPT Employment Evidence Checklist",
                desc: "Every document to save from every employer — for your DSO, USCIS, and future H-1B petitions.",
              },
              {
                href: "/blog/what-counts-as-20-hours-on-opt",
                title: "What Counts as 20 Hours Per Week on OPT?",
                desc: "Part-time, multiple jobs, variable schedules — the 20-hour threshold explained.",
              },
            ].map((r) => (
              <Link key={r.href} href={r.href} className="group block">
                <div className="border border-gray-200 dark:border-zinc-800 rounded-xl p-5 h-full hover:border-primary/50 hover:shadow-lg transition-all bg-white dark:bg-zinc-900">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors text-base">
                    {r.title}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">{r.desc}</p>
                  <span className="text-primary font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read Guide <ArrowRight className="w-4 h-4" />
                  </span>
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
