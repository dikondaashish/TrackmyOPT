import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, AlertTriangle } from "lucide-react";
import { AuthorBio } from "@/components/blog/AuthorBio";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BlogProductCTA } from "@/components/blog/BlogProductCTA";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";

const CANONICAL_URL = "https://www.trackmyopt.com/blog/when-does-opt-unemployment-clock-start";

export const metadata: Metadata = {
  title: "When Does the OPT Unemployment Clock Start? (2026)",
  description:
    "Learn exactly when OPT unemployment days begin, whether EAD delays count, how job gaps are calculated, and how to track your remaining days.",
  keywords: [
    "when does OPT unemployment clock start",
    "when does OPT unemployment begin",
    "does unemployment count before EAD arrives",
    "OPT start date unemployment days",
    "OPT unemployment clock delayed EAD",
  ],
  openGraph: {
    title: "When Does the OPT Unemployment Clock Start? (2026)",
    description:
      "A practical, source-backed guide to OPT unemployment start dates, EAD delays, job gaps, and remaining-day tracking.",
    url: CANONICAL_URL,
    type: "article",
    images: [{ url: "https://www.trackmyopt.com/blog/when-does-opt-unemployment-clock-start.png", width: 1200, height: 630, alt: "Calendar with OPT start date circled, EAD card, countdown timer showing 78 days remaining, and SEVIS reporting confirmation" }],
  },
  alternates: { canonical: CANONICAL_URL },
    twitter: {
        card: "summary_large_image",
        title: "When Does the OPT Unemployment Clock Start? (2026)",
        description: "A practical, source-backed guide to OPT unemployment start dates, EAD delays, job gaps, and remaining-day tracking.",
        images: ["https://www.trackmyopt.com/blog/when-does-opt-unemployment-clock-start.png"],
    },
};

const FAQS = [
  {
    question: "When does the OPT unemployment clock start?",
    answer:
      "For post-completion OPT, unemployment days generally begin on the OPT authorization start date printed on your EAD card, even if the card arrives later. Confirm your dates with your DSO if the EAD or SEVIS record contains an error.",
  },
  {
    question: "Do unemployment days count while I am waiting for my EAD card?",
    answer:
      "If the OPT authorization period has already started, days without qualifying employment can count even while the physical EAD is delayed. You cannot start working until you have work authorization, so contact your DSO promptly if the delay creates a compliance concern.",
  },
  {
    question: "Do weekends and holidays count as OPT unemployment days?",
    answer:
      "Yes. The limit is measured in calendar days. A gap from one qualifying job to the next includes weekends and holidays unless a qualifying employment period covers those dates.",
  },
  {
    question: "Does STEM OPT reset the unemployment clock?",
    answer:
      "No. Initial post-completion OPT allows up to 90 days, and STEM OPT adds 60 days for a combined 150-day limit across the OPT period. STEM OPT does not erase days already used.",
  },
  {
    question: "Can TrackMyOPT replace my DSO or immigration attorney?",
    answer:
      "No. TrackMyOPT helps organize dates, employment records, reminders, and USCIS updates. It is not legal advice. Discuss unusual facts or status concerns with your DSO or a licensed immigration attorney.",
  },
] as const;

export default function OptUnemploymentClockStartArticle() {
  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://www.trackmyopt.com" },
          { name: "Blog", url: "https://www.trackmyopt.com/blog" },
          { name: "When Does the OPT Unemployment Clock Start?", url: CANONICAL_URL },
        ]}
      />
      <BlogPostSchema
        title={metadata.title}
        description={metadata.description}
        publishedDate="2026-07-27"
        modifiedDate="2026-07-27"
        canonicalUrl={CANONICAL_URL}
        faqItems={[...FAQS]}
      />

      <nav className="mb-8 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-blue-600">Blog</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white">OPT unemployment clock</span>
      </nav>

      <header className="mb-10">
        <div className="mb-4 flex items-center gap-3">
          <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">OPT Compliance</span>
          <span className="flex items-center gap-1 text-sm text-gray-500"><Clock className="h-3.5 w-3.5" /> 9 min read</span>
        </div>
        <h1 className="mb-5 text-4xl font-bold leading-tight text-gray-900 dark:text-white sm:text-5xl">When Does the OPT Unemployment Clock Start?</h1>
        <p className="text-xl leading-relaxed text-gray-600 dark:text-gray-300">
          Your OPT unemployment clock generally starts on the OPT authorization start date—not when your EAD card arrives. Here is how to calculate the first day, handle an EAD delay, and protect your remaining unemployment buffer.
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
          <span>Last updated: July 27, 2026</span><span>•</span><span>Written by Vinay Kumar</span>
        </div>
      </header>

      <div className="relative w-full h-[420px] md:h-[520px] rounded-2xl overflow-hidden mb-12 shadow-xl">
        <img src="/blog/when-does-opt-unemployment-clock-start.png" alt="Calendar with OPT start date circled in red, EAD card, countdown timer showing 78 days remaining, and SEVIS reporting confirmation on a rustic wooden desk" className="object-cover w-full h-full" />
      </div>

      <div className="mb-8 rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-950/30">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">Short answer</p>
        <p className="text-lg font-medium leading-relaxed text-gray-900 dark:text-white">
          For post-completion OPT, count unemployment from the first day of the OPT authorization period shown on your EAD. A late physical card does not automatically move that start date. You may not work until you are authorized, so document the delay and contact your DSO.
        </p>
      </div>

      <BlogProductCTA variant="unemployment" sourcePage="/blog/when-does-opt-unemployment-clock-start" />

      <div className="prose prose-lg prose-longform max-w-none dark:prose-invert">
        <div className="not-prose mb-10 rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">In this guide</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              ["#answer", "The exact start-date rule"],
              ["#ead-delay", "What if your EAD is delayed?"],
              ["#examples", "Three date examples"],
              ["#job-gaps", "How job gaps are counted"],
              ["#action-plan", "Your 24-hour action plan"],
              ["#faq", "Frequently asked questions"],
            ].map(([href, label]) => <a key={href} href={href} className="text-sm text-blue-600 hover:underline dark:text-blue-400">→ {label}</a>)}
          </div>
        </div>

        <section id="answer">
          <h2>When does the OPT unemployment clock start?</h2>
          <p>
            The practical rule for post-completion OPT is to use the <strong>OPT start date on your employment authorization period</strong>. That date is usually printed on the front of your Form I-766 (EAD). If you have no qualifying employment during a calendar day after that date, the day can count toward the 90-day initial OPT limit.
          </p>
          <p>
            U.S. Immigration and Customs Enforcement explains that OPT must relate to your major and that you should wait to begin work until you receive work authorization. The two dates therefore matter independently: the EAD controls when you may work, while the OPT authorization period controls the compliance timeline. Compare the official <a href="https://www.ice.gov/sevis/practical-training" target="_blank" rel="noopener noreferrer">ICE practical-training guidance</a> with <a href="https://www.uscis.gov/working-in-the-united-states/students-and-exchange-visitors/optional-practical-training-opt-for-f-1-students" target="_blank" rel="noopener noreferrer">USCIS OPT guidance</a>, then confirm your individual record with your DSO.
          </p>
          <div className="not-prose my-6 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-5 dark:bg-amber-950/30">
            <p className="font-semibold text-amber-900 dark:text-amber-100">A late EAD is urgent, but it is not a reason to work without authorization.</p>
            <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">Do not begin employment before the authorized start date and do not assume an application receipt, approval notice, or tracking number is permission to work.</p>
          </div>
        </section>

        <section id="ead-delay">
          <h2>What if your EAD arrives after the OPT start date?</h2>
          <p>
            First, compare the EAD start date, EAD end date, I-20 recommendation, and your SEVP Portal record. If the card is late, keep the USCIS receipt, approval notice, USPS information, and every message to your DSO. Ask your DSO how the school wants the delay documented before the unemployment counter gets close to a threshold.
          </p>
          <ol>
            <li>Check the receipt number in the <Link href="/dashboard/case-status">TrackMyOPT USCIS case tracker</Link> and save each status change.</li>
            <li>Verify the EAD production and mailing status with <a href="https://egov.uscis.gov/e-request/ndc" target="_blank" rel="noopener noreferrer">USCIS non-delivery guidance</a> if the card should already have arrived.</li>
            <li>Do not start work until you have valid authorization and an eligible start date.</li>
            <li>Log the gap in your <Link href="/dashboard/opt-tools/opt-clock">OPT unemployment clock</Link> and set an alert before day 60, 75, and 90.</li>
          </ol>
        </section>

        <section id="examples">
          <h2>Three examples: which date starts counting?</h2>
          <div className="not-prose my-6 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead><tr className="bg-gray-100 dark:bg-zinc-800"><th className="border p-3 text-left dark:border-zinc-700">Scenario</th><th className="border p-3 text-left dark:border-zinc-700">First date to review</th><th className="border p-3 text-left dark:border-zinc-700">What to do</th></tr></thead>
              <tbody>
                <tr><td className="border p-3 dark:border-zinc-700">EAD starts July 1; card arrives July 10</td><td className="border p-3 font-semibold dark:border-zinc-700">July 1</td><td className="border p-3 dark:border-zinc-700">Do not work before authorization; document the 9-day delay.</td></tr>
                <tr className="bg-gray-50 dark:bg-zinc-900"><td className="border p-3 dark:border-zinc-700">EAD starts July 1; qualifying job starts July 15</td><td className="border p-3 font-semibold dark:border-zinc-700">July 1</td><td className="border p-3 dark:border-zinc-700">Review July 1–14 as a potential 14-day gap with your DSO.</td></tr>
                <tr><td className="border p-3 dark:border-zinc-700">Job ends August 20; next qualifying job starts September 5</td><td className="border p-3 font-semibold dark:border-zinc-700">August 21</td><td className="border p-3 dark:border-zinc-700">Log the gap and preserve both employers’ dates and evidence.</td></tr>
              </tbody>
            </table>
          </div>
          <p>These examples illustrate the calendar math; your DSO should confirm whether a particular role, contract, volunteer position, or employment interruption qualifies under your record.</p>
        </section>

        <section id="job-gaps">
          <h2>How job gaps are counted on OPT</h2>
          <p>Initial post-completion OPT generally allows 90 cumulative unemployment days. STEM OPT adds 60 days, for a combined 150-day limit; it does not reset the days you already used. Count calendar days, including weekends and holidays, and keep evidence for every employment period.</p>
          <div className="not-prose my-6 grid gap-4 sm:grid-cols-2">
            {[
              ["Qualifying employment", "A role related to your degree and reported accurately to your DSO/SEVP record."],
              ["Potential unemployment", "A day after the OPT start date with no qualifying employment covering it."],
              ["Evidence to keep", "Offer letter, start/end dates, job description, supervisor details, pay records, and reporting confirmations."],
              ["Warning threshold", "Set reminders before your remaining days become too small to find and start another role."],
            ].map(([title, body]) => <div key={title} className="rounded-xl border border-gray-200 p-4 dark:border-zinc-800"><h3 className="mb-1 font-semibold text-gray-900 dark:text-white">{title}</h3><p className="text-sm text-gray-600 dark:text-gray-400">{body}</p></div>)}
          </div>
          <p>For a full explanation of the 90-day and 150-day limits, see our <Link href="/blog/90-day-unemployment-rule-opt">OPT unemployment rule guide</Link>. This article focuses only on the date the clock begins and what to do when dates do not line up.</p>
        </section>

        <section id="action-plan">
          <h2>Your 24-hour action plan</h2>
          <ol>
            <li>Photograph or scan both sides of your EAD and save the approval notice.</li>
            <li>Write down the OPT start date, first eligible work date, first job start date, and every later job gap.</li>
            <li>Ask your DSO to confirm how the gap should be reported and whether your SEVP Portal information is current.</li>
            <li>Use TrackMyOPT to track the unemployment counter, USCIS case changes, deadlines, and job applications together.</li>
            <li>Use the <Link href="/features/resume-ai">TrackMyOPT AI resume tools</Link> to tailor applications to your degree-related roles. AI can help with resume wording and job-search organization; it cannot determine your immigration status or replace DSO/legal advice.</li>
          </ol>
          <div className="not-prose my-6 rounded-xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-800 dark:bg-indigo-950/30">
            <p className="font-semibold text-indigo-900 dark:text-indigo-100">Need a plain-English second check?</p>
            <p className="mt-1 text-sm text-indigo-800 dark:text-indigo-200">Browse the <Link href="/ai-facts" className="font-semibold underline">TrackMyOPT AI facts and answers</Link> for definitions, then verify the result against USCIS/ICE guidance and your DSO’s instructions.</p>
          </div>
        </section>

        <section id="faq">
          <h2>Frequently asked questions</h2>
          <div className="not-prose space-y-4">
            {FAQS.map((faq) => <div key={faq.question} className="rounded-xl border border-gray-200 p-5 dark:border-zinc-800"><h3 className="font-bold text-gray-900 dark:text-white">{faq.question}</h3><p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{faq.answer}</p></div>)}
          </div>
        </section>
      </div>

      <div className="mt-10 rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Continue reading</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/blog/90-day-unemployment-rule-opt" className="text-sm text-blue-600 hover:underline dark:text-blue-400">→ The 90-day OPT unemployment rule</Link>
          <Link href="/blog/opt-processing-time-2026" className="text-sm text-blue-600 hover:underline dark:text-blue-400">→ OPT processing times and EAD delays</Link>
          <Link href="/blog/opt-ead-card-guide" className="text-sm text-blue-600 hover:underline dark:text-blue-400">→ OPT EAD card guide</Link>
          <Link href="/blog/sevp-portal-guide-opt" className="text-sm text-blue-600 hover:underline dark:text-blue-400">→ SEVP Portal guide</Link>
        </div>
      </div>

      <AuthorBio />

      <div className="mt-12 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white">
        <h2 className="mb-3 text-2xl font-bold">Know your remaining OPT buffer</h2>
        <p className="mx-auto mb-6 max-w-lg text-blue-100">Track unemployment days, USCIS updates, job applications, and reminders in one place.</p>
        <Link href="/login" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-blue-600 hover:bg-blue-50">Start tracking free <ArrowRight className="h-4 w-4" /></Link>
      </div>

      <p className="mt-8 flex items-start gap-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />This article is educational information, not legal advice. Immigration rules and individual records vary. Confirm important decisions with your DSO or a licensed immigration attorney.</p>
    </article>
  );
}
