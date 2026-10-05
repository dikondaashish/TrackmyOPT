import { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Calculator,
} from "lucide-react";
import { AuthorBio } from "@/components/blog/AuthorBio";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BlogProductCTA } from "@/components/blog/BlogProductCTA";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";

const CANONICAL =
  "https://www.trackmyopt.com/blog/opt-14-month-rule-delays-shorten-authorization-2026";

export const metadata: Metadata = {
  title:
    "OPT 14-Month Rule Explained (2026): How USCIS Delays Can Shorten Your EAD",
  description:
    "Filing I-765 on time does not guarantee 12 months of OPT. Post-completion OPT must end within 14 months of program completion — so late USCIS decisions permanently cut your work authorization. Premium processing, STEM differences, and what to do.",
  keywords: [
    "OPT 14 month rule",
    "OPT shortened by processing delay",
    "USCIS delay loses OPT months",
    "post-completion OPT 14 months",
    "OPT EAD end date program completion",
    "premium processing OPT worth it 2026",
    "I-765 delay shortens OPT",
  ],
  openGraph: {
    title: "OPT 14-Month Rule: Why Delays Steal Work Authorization | TrackMyOPT",
    description:
      "Late I-765 decisions push your OPT start later while the end date stays capped at 14 months after graduation. Clear math, examples, and next steps.",
    url: CANONICAL,
    type: "article",
    images: [
      {
        url: "https://www.trackmyopt.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "OPT 14-Month Rule 2026",
      },
    ],
  },
  alternates: { canonical: CANONICAL },
  twitter: {
    card: "summary_large_image",
    title: "OPT 14-Month Rule: Why Delays Steal Work Authorization",
    description:
      "How USCIS adjudication timing can permanently shorten post-completion OPT under the 14-month completion rule.",
    images: ["https://www.trackmyopt.com/og-image.jpg"],
  },
};

const faqItems = [
  {
    question: "What is the OPT 14-month rule?",
    answer:
      "Federal regulations require post-completion OPT to be completed within 14 months after the student’s program completion date. That outside deadline does not move just because USCIS took longer to decide your Form I-765.",
  },
  {
    question: "Can a late USCIS approval give me less than 12 months of OPT?",
    answer:
      "Yes. Employment authorization for post-completion OPT generally begins on the later of your requested start date or the adjudication date, while the end date cannot extend past 14 months after program completion. A delayed decision can push the start later and permanently shorten the usable period.",
  },
  {
    question: "Does a pending initial OPT application let me work?",
    answer:
      "No. Unlike a timely STEM OPT extension (which can trigger a 180-day automatic extension of employment authorization), a pending initial post-completion OPT I-765 does not authorize work. You need an approved EAD and a valid start date before performing work.",
  },
  {
    question: "Does the 14-month rule apply to STEM OPT the same way?",
    answer:
      "The 14-month completion limit is framed around regular post-completion OPT. The separate 24-month STEM OPT extension has its own eligibility and timing rules. STEM does not erase months already lost on a delayed initial OPT, and you still need a valid initial OPT foundation before extending.",
  },
  {
    question: "Should I buy premium processing because of the 14-month rule?",
    answer:
      "Often yes when your graduation-to-start window is tight, you have a hard job start date, or regular processing would push adjudication deep into the 14-month window. Premium processing (Form I-907) requires adjudicative action within 30 business days for eligible OPT categories — not a guaranteed card-in-hand date. Confirm the current fee on USCIS.gov (raised to $1,780 for eligible I-765 OPT categories effective March 1, 2026).",
  },
];

export default function Opt14MonthRuleDelaysPage() {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://www.trackmyopt.com" },
          { name: "Blog", url: "https://www.trackmyopt.com/blog" },
          { name: "OPT 14-Month Rule 2026", url: CANONICAL },
        ]}
      />
      <BlogPostSchema
        title={metadata.title as string}
        description={metadata.description as string}
        publishedDate="2026-10-05"
        modifiedDate="2026-10-05"
        author="Vinay Kumar"
        faqItems={faqItems}
        canonicalUrl={CANONICAL}
      />

      <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
        <Link href="/" className="hover:text-blue-600">
          Home
        </Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-blue-600">
          Blog
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white">14-Month Rule</span>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold">
            USCIS Timing
          </span>
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            10 min read
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          OPT&apos;s 14-Month Rule: How USCIS Delays Can Permanently Shorten Your
          Work Authorization
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
          In 2026, I-765 waits of five to six-plus months are common for F-1 OPT.
          Filing early is necessary — but not enough. The 14-month completion rule
          means every month of adjudication delay can be a month of OPT you never
          get back.
        </p>
        <div className="mt-6 text-sm text-gray-500">
          Last updated: October 5, 2026 • Written by Vinay Kumar
        </div>
      </header>

      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 mb-10">
        <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">
          Quick Answer
        </p>
        <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
          Post-completion OPT must finish within <strong>14 months after program
          completion</strong>. Authorization usually starts on the{" "}
          <strong>later</strong> of your requested start date or USCIS&apos;s decision
          date. A late decision pushes the start later while the end date stays
          capped — so you can receive far less than 12 months even if you filed on
          time.
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
        <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Key Takeaway
        </h2>
        <p className="text-blue-800 dark:text-blue-200 font-medium">
          Track three clocks: <strong>program end date</strong>,{" "}
          <strong>14-month hard stop</strong>, and <strong>USCIS decision
          date</strong>. Waiting silently for six months is not “safe” just because
          your receipt is valid — the calendar against graduation keeps moving.
        </p>
      </div>

      <BlogProductCTA
        variant="case-status"
        sourcePage="/blog/opt-14-month-rule-delays-shorten-authorization-2026"
      />

      <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calculator className="w-7 h-7 text-amber-500" />
            The Math Students Miss
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Eligible F-1 students may receive up to <strong>12 months</strong> of
            post-completion OPT at each educational level. Separately, regulations
            require that practical training period to be completed within{" "}
            <strong>14 months after the program end date</strong> on your I-20.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            Put those together with how start dates work: authorization generally
            begins on the requested start date <em>or</em> the adjudication date,
            whichever is later. The end date cannot slide past the 14-month mark.
            Late approval compresses the middle.
          </p>

          <div className="not-prose overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-800 mb-6">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-zinc-800">
                <tr>
                  <th className="p-3 text-left font-semibold">Scenario</th>
                  <th className="p-3 text-left font-semibold">Program end</th>
                  <th className="p-3 text-left font-semibold">USCIS decides</th>
                  <th className="p-3 text-left font-semibold">Usable OPT</th>
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    "Fast decision",
                    "May 15, 2026",
                    "Jun 20, 2026",
                    "~12 months (within 14-month window)",
                  ],
                  [
                    "5-month delay",
                    "May 15, 2026",
                    "Oct 15, 2026",
                    "~9 months (end still ~Jul 15, 2027)",
                  ],
                  [
                    "8-month delay",
                    "May 15, 2026",
                    "Jan 15, 2027",
                    "~6 months remaining before 14-month cap",
                  ],
                ].map(([scenario, end, decide, usable], i) => (
                  <tr
                    key={scenario}
                    className={i % 2 === 0 ? "bg-gray-50 dark:bg-zinc-900" : ""}
                  >
                    <td className="p-3 border-t dark:border-zinc-700 font-medium">
                      {scenario}
                    </td>
                    <td className="p-3 border-t dark:border-zinc-700">{end}</td>
                    <td className="p-3 border-t dark:border-zinc-700">{decide}</td>
                    <td className="p-3 border-t dark:border-zinc-700 text-xs text-gray-600 dark:text-gray-400">
                      {usable}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500 italic">
            Illustrative only. Your EAD dates depend on the requested start date,
            USCIS decision, and how your DSO / USCIS apply the regulations to your
            filing. Always verify against your notice and I-20.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Why 2026 Delays Make This Urgent
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            Students and practitioners report broader I-765 slowdowns in 2025–2026.
            Published category times for F-1 OPT ((c)(3)) have recently clustered around
            roughly <strong>5–6.5 months</strong> for many offices — long enough to erase
            a large share of a 12-month OPT grant when the 14-month ceiling is fixed.
          </p>
          <div className="not-prose space-y-3">
            {[
              "Employers cannot onboard you on a pending initial OPT — unlike STEM’s 180-day auto-extension after a timely STEM filing.",
              "Unemployment days still follow OPT rules once authorization begins; a shortened OPT period also compresses job-search runway.",
              "H-1B and STEM strategies assume you actually receive months of OPT. Lost months can shrink lottery and extension planning windows.",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-zinc-800"
              >
                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-700 dark:text-gray-300">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            What To Do If Your Case Is Pending
          </h2>
          <div className="not-prose space-y-3 mb-6">
            {[
              {
                title: "Map the 14-month date today",
                body: "Program end + 14 months = hard planning ceiling. Compare it to today’s date and any published processing time for your receipt.",
              },
              {
                title: "File or upgrade premium when the math is tight",
                body: (
                  <>
                    Eligible OPT and STEM OPT I-765 filings can use Form I-907. USCIS must
                    take adjudicative action within 30 business days after the premium
                    clock starts (RFE pauses the clock). See our{" "}
                    <Link
                      href="/blog/opt-premium-processing-timeline-2026"
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      premium timeline
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/blog/opt-premium-processing-fee-increase-1780"
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      $1,780 fee guide
                    </Link>
                    .
                  </>
                ),
              },
              {
                title: "Use e-requests after you exceed published times",
                body: "Submit a USCIS service request when your case is outside posted processing times. Keep screenshots of receipt notices and inquiry responses.",
              },
              {
                title: "Talk to your DSO — and escalate early near the edge",
                body: "If you are approaching the 14-month mark with no decision, involve your DSO and consider consulting an immigration attorney. Do not wait until the last week.",
              },
              {
                title: "Never start work without the EAD",
                body: (
                  <>
                    Pending initial OPT is not work authorization. Read{" "}
                    <Link
                      href="/blog/can-you-start-work-before-opt-ead-arrives"
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      can you work before the EAD arrives
                    </Link>
                    .
                  </>
                ),
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900"
              >
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    {item.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            STEM OPT Is Not a Magic Undo Button
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            STEM OPT&apos;s 24-month extension is powerful — and it is{" "}
            <strong>not</strong> subject to the same “finish regular OPT within 14 months
            of graduation” framing in the same way. But STEM still builds on a valid
            initial post-completion OPT period and employer/E-Verify requirements. Months
            lost to a delayed initial EAD are not automatically restored at the end of
            STEM.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            If your initial OPT is still pending, talk with your DSO before assuming you
            can “skip ahead” to STEM. Structure and timing matter; see the{" "}
            <Link
              href="/blog/stem-opt-extension-guide"
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              STEM OPT extension guide
            </Link>
            .
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
          <div className="not-prose space-y-4">
            {faqItems.map((faq) => (
              <div
                key={faq.question}
                className="p-5 rounded-xl border border-gray-200 dark:border-zinc-800"
              >
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  {faq.question}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Related Guides
          </h2>
          <div className="not-prose grid sm:grid-cols-2 gap-4">
            {[
              {
                href: "/blog/opt-ead-pending-processing-delays-2026",
                title: "OPT EAD Still Pending?",
                desc: "Stage-by-stage actions at 3, 6, and 12 months.",
              },
              {
                href: "/blog/spring-graduates-opt-application-timing-2026",
                title: "Spring Graduate Filing Timing",
                desc: "Why the 90-day window is the floor, not early.",
              },
              {
                href: "/blog/opt-processing-time-2026",
                title: "OPT Processing Time 2026",
                desc: "Planning around current I-765 waits.",
              },
              {
                href: "/tools/opt-decision-window",
                title: "OPT Decision Window Tool",
                desc: "See where your wait stands vs similar cases.",
              },
            ].map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="group p-5 rounded-xl border border-gray-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
              >
                <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 mb-1">
                  {r.title}
                </h3>
                <p className="text-sm text-gray-500 mb-2">{r.desc}</p>
                <span className="text-sm font-medium text-blue-600 inline-flex items-center gap-1">
                  Open <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <AuthorBio />
    </article>
  );
}
