import type { Metadata } from "next";
import { BlogPostImage } from "@/components/blog/BlogPostImage";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, ExternalLink, ShieldCheck } from "lucide-react";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import { AuthorBio } from "@/components/blog/AuthorBio";

const CANONICAL = "https://www.trackmyopt.com/blog/what-counts-as-20-hours-on-opt";

export const metadata: Metadata = {
  title: "What Counts as 20 Hours per Week on OPT? Multiple Jobs, Gaps and Part-Time Work",
  description:
    "Understand the 20-hour threshold for qualifying OPT employment: what counts, what does not, how multiple jobs and variable schedules work, and what evidence to keep to prove you met the threshold.",
  keywords: [
    "what counts as 20 hours on OPT",
    "OPT part time hours",
    "multiple jobs OPT 20 hours",
    "OPT unemployment 20 hours",
    "STEM OPT hours per week",
    "OPT employment minimum hours",
    "qualifying OPT employment hours",
  ],
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: "What Counts as 20 Hours per Week on OPT? Multiple Jobs, Gaps and Part-Time Work",
    description: "The 20-hour OPT threshold explained: qualifying work, multiple employers, variable schedules, evidence requirements, and STEM OPT differences.",
    url: CANONICAL,
    type: "article",
    images: [{ url: "https://www.trackmyopt.com/og-image.jpg", width: 1200, height: 630, alt: "OPT 20-Hour Rule Explained" }],
  },
    twitter: {
        card: "summary_large_image",
        title: "What Counts as 20 Hours per Week on OPT? Multiple Jobs, Gaps and Part-Time Work",
        description: "The 20-hour OPT threshold explained: qualifying work, multiple employers, variable schedules, evidence requirements, and STEM OPT differences.",
        images: ["https://www.trackmyopt.com/og-image.jpg"],
    },
};

export default function WhatCountsAs20HoursPage() {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BlogPostSchema title={metadata.title as string} description={metadata.description as string} publishedDate="2026-07-27" modifiedDate="2026-07-27" author="TrackMyOPT Immigration Team" canonicalUrl={CANONICAL} />
      <BreadcrumbSchema items={[{ name: "Home", url: "https://www.trackmyopt.com" }, { name: "Blog", url: "https://www.trackmyopt.com/blog" }, { name: "What Counts as 20 Hours on OPT?", url: CANONICAL }]} />

      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold mb-4">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">OPT Employment Rules</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
          What Counts as 20 Hours per Week on OPT? Multiple Jobs, Gaps and Part-Time Work
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Twenty hours per week is not just a number—it is the threshold that separates qualifying
          OPT employment from an unemployment day. Understanding exactly what counts, how multiple
          jobs work, and what happens in short weeks is critical to staying within your 90-day limit.
        </p>
        <div className="mt-6 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 11 min read</span>
          <span>•</span>
          <span>Updated July 27, 2026</span>
        </div>
      </header>

      <div className="relative w-full h-[420px] md:h-[520px] rounded-2xl overflow-hidden mb-12 shadow-xl">
        <BlogPostImage src="/blog/what-counts-as-20-hours-on-opt.png" alt="Weekly timesheet with hours tracked, two employee badges, and notebook showing combined hours calculation" className="object-cover w-full h-full" sizes="(max-width: 768px) 100vw, 768px" priority />
      </div>

      {/* Direct Answer */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">Direct Answer</p>
        <p className="text-gray-800 dark:text-gray-100 font-medium leading-relaxed">
          For initial OPT, a position generally counts as qualifying employment if it: (1) is
          directly related to your degree, (2) involves at least 20 hours of work per week, and
          (3) is properly reported to your DSO. Hours from multiple qualifying positions can be
          combined. An unrelated job&apos;s hours cannot be added. For STEM OPT, the requirements are
          stricter: the position must be paid, with an E-Verify enrolled employer, a signed I-983,
          and a genuine training relationship—not just 20 hours of any work.
        </p>
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none">

        <h2>Why 20 Hours Is the Threshold</h2>
        <p>
          The 20-hour-per-week minimum comes from ICE guidance on what constitutes qualifying
          OPT employment. The logic is that OPT is practical training—it must be substantive
          enough to constitute a real training experience related to the student&apos;s degree.
          A job that provides less than 20 hours of actual work per week may not represent
          sufficient ongoing engagement.
        </p>
        <p>
          The 20-hour figure is a minimum, not a maximum. Full-time work (40+ hours) counts.
          The question is whether your weekly actual work hours meet or exceed the threshold
          consistently during the OPT period.
        </p>

        <h2>What Types of Work Count?</h2>

        <h3>Paid employment (W-2 or 1099 contractor)</h3>
        <p>
          Paid employment related to your degree counts for initial OPT whether the arrangement
          is W-2 or 1099 contractor. The relationship to your degree matters; the payment
          structure does not change whether the work is qualifying. For STEM OPT, only W-2
          employment with an E-Verify enrolled employer qualifies.
        </p>

        <h3>Self-employment and freelance work</h3>
        <p>
          During initial OPT, self-employment and freelance work related to your degree can
          qualify if you are working at least 20 hours per week across your clients. You must
          report yourself as self-employed or an independent contractor in the SEVP Portal
          and keep detailed records of clients, projects, hours, and invoices.
        </p>
        <p>
          During STEM OPT, self-employment and independent contracting generally do not
          qualify. The STEM training framework requires a W-2 employer-employee relationship.
        </p>

        <h3>Unpaid or volunteer work</h3>
        <p>
          Unpaid work during initial OPT can qualify in limited circumstances when:
        </p>
        <ul>
          <li>The work is directly related to your degree</li>
          <li>You work at least 20 hours per week</li>
          <li>The position would otherwise satisfy OPT requirements</li>
          <li>Your DSO approves the arrangement</li>
        </ul>
        <p>
          Do not rely on an unpaid position to stop your unemployment clock without first
          confirming with your DSO in writing. STEM OPT requires paid employment.
        </p>

        <h2>The Calendar Week Question</h2>
        <p>
          The 20-hour threshold is measured on a weekly basis. Most students interpret this
          to mean each calendar week (Sunday–Saturday or Monday–Sunday). If you work 25 hours
          one week and 15 hours the next, the 15-hour week is potentially problematic—not the
          25-hour week.
        </p>

        <div className="not-prose overflow-x-auto my-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-primary/10">
                <th className="text-left p-3 font-semibold border border-gray-200 dark:border-zinc-700">Week</th>
                <th className="text-left p-3 font-semibold border border-gray-200 dark:border-zinc-700">Hours Worked</th>
                <th className="text-left p-3 font-semibold border border-gray-200 dark:border-zinc-700">Status</th>
                <th className="text-left p-3 font-semibold border border-gray-200 dark:border-zinc-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Week 1", "40 hrs", "✅ Qualifying", "No action needed"],
                ["Week 2", "20 hrs", "✅ Qualifying", "Confirm with employer in writing"],
                ["Week 3", "19 hrs", "⚠️ Borderline", "Ask DSO before relying on this week"],
                ["Week 4", "10 hrs (sick)", "❌ Not qualifying", "Discuss with DSO — may be an unemployment day"],
                ["Week 5", "0 hrs (vacation)", "❌ Not qualifying", "Unpaid vacation = unemployment days"],
              ].map(([week, hours, status, action], i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-gray-50 dark:bg-zinc-800"}>
                  <td className="p-3 border border-gray-200 dark:border-zinc-700 font-medium">{week}</td>
                  <td className="p-3 border border-gray-200 dark:border-zinc-700">{hours}</td>
                  <td className="p-3 border border-gray-200 dark:border-zinc-700">{status}</td>
                  <td className="p-3 border border-gray-200 dark:border-zinc-700 text-xs text-gray-600 dark:text-gray-400">{action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="not-prose bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-5 rounded-r-xl my-6">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900 dark:text-amber-300 mb-1">The vacation / sick / holiday question</p>
              <p className="text-amber-800 dark:text-amber-200 text-sm">
                Paid vacation and sick days are nuanced under OPT. Some DSOs treat paid
                PTO periods as continuous qualifying employment; others count them as gaps
                if no actual work was performed. Confirm how your DSO records PTO periods
                before relying on them to extend your qualifying employment dates.
              </p>
            </div>
          </div>
        </div>

        <h2>Multiple Jobs and Combining Hours</h2>
        <p>
          During initial OPT, you may hold more than one qualifying position simultaneously.
          If each position independently meets the degree relationship requirement and
          is properly reported, you can combine the hours to meet the 20-hour threshold.
        </p>

        <h3>Example: Two part-time qualifying roles</h3>
        <div className="not-prose bg-gray-50 dark:bg-zinc-800 rounded-xl p-5 my-4 border border-gray-200 dark:border-zinc-700">
          <p className="font-semibold text-gray-900 dark:text-white mb-3">Scenario: Divya — Computer Science graduate</p>
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex gap-3">
              <span className="w-48 flex-shrink-0 font-medium">Job A — Software Contractor</span>
              <span>12 hours/week, related to CS degree ✅</span>
            </div>
            <div className="flex gap-3">
              <span className="w-48 flex-shrink-0 font-medium">Job B — Data Analyst</span>
              <span>12 hours/week, related to CS degree ✅</span>
            </div>
            <div className="flex gap-3">
              <span className="w-48 flex-shrink-0 font-medium">Combined weekly hours</span>
              <span className="font-bold text-green-600 dark:text-green-400">24 hours — above the 20-hour threshold</span>
            </div>
          </div>
          <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-green-800 dark:text-green-300 text-xs">
              Both jobs must be reported to the DSO. Hours from an unrelated job (e.g., retail
              work) cannot be combined.
            </p>
          </div>
        </div>

        <h3>What you cannot combine</h3>
        <ul>
          <li>Hours from an unrelated job (even if paid) — they do not count toward the 20 hours</li>
          <li>Commuting time or preparation time</li>
          <li>Hours from a job that is not yet reported to your DSO</li>
          <li>Volunteer hours from an organization that does not otherwise qualify</li>
        </ul>

        <h2>STEM OPT: Stricter Requirements Than Initial OPT</h2>
        <p>
          On STEM OPT, the 20-hour requirement applies but is paired with additional requirements
          that make it meaningfully different:
        </p>
        <div className="not-prose overflow-x-auto my-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-primary/10">
                <th className="text-left p-3 font-semibold border border-gray-200 dark:border-zinc-700">Requirement</th>
                <th className="text-center p-3 font-semibold border border-gray-200 dark:border-zinc-700">Initial OPT</th>
                <th className="text-center p-3 font-semibold border border-gray-200 dark:border-zinc-700">STEM OPT</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Minimum 20 hours per week", "✅ Required", "✅ Required"],
                ["Related to degree", "✅ Required", "✅ Required (STEM degree)"],
                ["Paid employment only", "❌ Not required (unpaid can qualify)", "✅ Required"],
                ["W-2 employer-employee relationship", "❌ 1099 can qualify", "✅ Required"],
                ["E-Verify enrolled employer", "❌ Not required", "✅ Required"],
                ["Signed Form I-983 training plan", "❌ Not required", "✅ Required"],
                ["Self-employment / freelance", "✅ Permitted (with conditions)", "❌ Not permitted"],
              ].map(([req, initial, stem], i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-gray-50 dark:bg-zinc-800"}>
                  <td className="p-3 border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-gray-200">{req}</td>
                  <td className="p-3 border border-gray-200 dark:border-zinc-700 text-center">{initial}</td>
                  <td className="p-3 border border-gray-200 dark:border-zinc-700 text-center">{stem}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>Evidence That Proves You Met the 20-Hour Threshold</h2>
        <p>
          The best time to collect hours evidence is while you are working, not after you
          are asked to prove it. Keep the following for each employer:
        </p>
        <div className="not-prose">
          <ul className="space-y-3 my-4">
            {[
              { item: "Offer letter or contract stating minimum weekly hours", note: "Establishes the agreed schedule at the time of hiring." },
              { item: "Timesheets, time-tracking software records, or billing records", note: "Best direct evidence of actual hours worked each week." },
              { item: "Pay stubs showing hourly pay or regular salary for consistent periods", note: "Compensation records corroborate your employment dates and approximate hours." },
              { item: "Schedule confirmations from employer", note: "Email or HR system exports showing your assigned work schedule." },
              { item: "Project logs or deliverable records", note: "For freelance or variable roles — invoices, completed deliverables, and client communications." },
              { item: "Supervisor or manager confirmation", note: "A statement that you consistently worked at or above 20 hours per week." },
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

        <div className="not-prose bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl p-6 my-10">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-lg mb-2">Track Hours and Jobs in TrackMyOPT</p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Log each employer, start date, and weekly hours in the TrackMyOPT job tracker.
                The unemployment clock integrates with your employment log to show you exactly
                how many days are qualifying and how many are not.
              </p>
              <Link href="/features/job-tracker"
                className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm">
                Open Job Tracker <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <h2>Frequently Asked Questions</h2>
        <div itemScope itemType="https://schema.org/FAQPage" className="not-prose space-y-4">
          {[
            {
              q: "Does exactly 20 hours per week stop the unemployment clock?",
              a: "It may, if the employment is otherwise qualifying (related to your degree, authorized, and properly reported). Confirm with your DSO how your school records part-time employment and what happens to individual weeks that fall slightly below the threshold.",
            },
            {
              q: "Can I combine two 10-hour-per-week jobs to reach 20 hours?",
              a: "Yes, provided each job independently meets the degree-relationship requirement and each is reported to your DSO. You cannot add hours from an unrelated job to reach the threshold.",
            },
            {
              q: "What if I work 19 hours one week because of a holiday or illness?",
              a: "Do not assume a single short week is harmless. Ask your DSO how the authorization and facts will be treated. The conservative approach is to treat a week under 20 hours as a potential gap and flag it with your DSO.",
            },
            {
              q: "Do volunteer hours count for initial OPT?",
              a: "Unpaid/volunteer hours can count for initial OPT if the work is related to your degree, meets the hours threshold, and satisfies the other qualifying employment criteria. Confirm with your DSO before relying on an unpaid position.",
            },
            {
              q: "Do volunteer hours count for STEM OPT?",
              a: "Generally no. STEM OPT requires paid employment with an E-Verify enrolled employer in a genuine training relationship. Volunteer or unpaid work does not meet these requirements.",
            },
            {
              q: "Can I work 40 hours one week and 0 hours the next and average to 20?",
              a: "The 20-hour threshold is weekly, not an average. A week with 0 hours of qualifying employment may be counted as an unemployment week regardless of the previous week's hours. Consult your DSO before relying on an averaging approach.",
            },
            {
              q: "Does unpaid PTO (vacation days without pay) count as qualifying employment?",
              a: "Unpaid time off generally does not constitute qualifying employment because no actual work is being performed. Paid PTO may be treated differently depending on your DSO's interpretation. Confirm before taking extended unpaid leave.",
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
            { label: "ICE Employment Guidance", href: "https://www.ice.gov/sevis/employment" },
            { label: "ICE Practical Training Guidance", href: "https://www.ice.gov/sevis/practical-training" },
            { label: "DHS Form I-983 Overview (STEM)", href: "https://studyinthestates.dhs.gov/form-i-983-overview" },
            { label: "USCIS OPT Information", href: "https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-opt-for-f-1-students" },
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
              advice. Consult your DSO and a licensed immigration attorney before making decisions
              about your OPT employment structure, hours, or qualifying status.
            </p>
          </div>
        </div>

        <div className="not-prose mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Guides</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { href: "/blog/multiple-jobs-opt-two-employers", title: "Working Multiple Jobs on OPT", desc: "Two-employer OPT: reporting, degree relationship, and hour documentation." },
              { href: "/blog/90-day-unemployment-rule-opt", title: "The 90-Day OPT Unemployment Rule", desc: "How the 90-day limit works and how qualifying employment stops the clock." },
              { href: "/blog/opt-job-related-to-degree", title: "How to Prove Your OPT Job Is Related to Your Degree", desc: "Duty-based relationship statements with examples across 5 fields of study." },
              { href: "/blog/freelance-gig-work-uber-doordash-opt", title: "Freelance and Gig Work on OPT", desc: "Can 1099 contractor or self-employed work count as qualifying OPT employment?" },
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
