import { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Scale,
  TrendingDown,
  Users,
} from "lucide-react";
import { AuthorBio } from "@/components/blog/AuthorBio";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BlogProductCTA } from "@/components/blog/BlogProductCTA";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";

const CANONICAL =
  "https://www.trackmyopt.com/blog/fy2027-h1b-no-second-lottery-opt-backup-plan";

export const metadata: Metadata = {
  title:
    "FY 2027 H-1B Lottery: No Second Round — What OPT Students Must Do Before Cap-Gap Ends",
  description:
    "USCIS reached the FY 2027 H-1B cap after one lottery. No second selection. If your registration was not picked, here is your OPT backup playbook for the rest of 2026 and FY 2028 prep.",
  keywords: [
    "FY 2027 H-1B second lottery",
    "no second H-1B selection 2026",
    "OPT not selected H-1B backup plan",
    "cap gap October 2026 expires",
    "H-1B wage weighted selection FY 2027 results",
    "OPT STEM OPT next steps not selected",
  ],
  openGraph: {
    title: "FY 2027 H-1B: No Second Lottery — OPT Backup Plan | TrackMyOPT",
    description:
      "Official word: no second H-1B selection for FY 2027. Clear OPT and cap-gap action plan for the rest of 2026.",
    url: CANONICAL,
    type: "article",
    images: [
      {
        url: "https://www.trackmyopt.com/blog/fy2027-h1b-no-second-lottery-opt-backup-plan.svg",
        width: 1200,
        height: 630,
        alt: "FY 2027 H-1B No Second Lottery OPT Backup Plan",
      },
    ],
  },
  alternates: { canonical: CANONICAL },
  twitter: {
    card: "summary_large_image",
    title: "FY 2027 H-1B No Second Lottery — OPT Backup Plan",
    description:
      "USCIS reached the FY 2027 cap. No second round. What to do now on OPT.",
    images: ["https://www.trackmyopt.com/blog/fy2027-h1b-no-second-lottery-opt-backup-plan.svg"],
  },
};

const faqItems = [
  {
    question: "Will there be a second FY 2027 H-1B lottery?",
    answer:
      "No. On July 17, 2026, USCIS announced it had received enough petitions to fill the FY 2027 cap, so no second selection will be held. Only registrations picked in March 2026 were invited to file.",
  },
  {
    question: "What changes with the new wage-weighted H-1B lottery?",
    answer:
      "FY 2027 was the first season to use a wage-weighted selection system. Registrations with higher offered wages received more entries in the selection pool. Analysts expect this pattern to continue into FY 2028.",
  },
  {
    question: "My registration was not selected. When can I try again?",
    answer:
      "You can register again in the next H-1B cap season — for FY 2028, that registration window typically opens in early March 2027. Between now and then, your focus should be keeping OPT / STEM OPT valid and exploring cap-exempt employers or other work-visa paths.",
  },
  {
    question: "What happens to my cap-gap extension now?",
    answer:
      "If your F-1 status and OPT were extended under the cap-gap rule because an H-1B was pending, that extension ends at the date USCIS rejects, denies, or revokes the H-1B — or September 30, 2026, whichever is earlier. After cap-gap expires you cannot work until you have another authorization basis.",
  },
  {
    question: "Should I stick with my employer through this?",
    answer:
      "If your employer is H-1B-cap subject and your registration was not selected, talk to them honestly about re-registering next spring. If they are cap-exempt (universities, nonprofits tied to a university, nonprofit/government research orgs), they may be able to file an H-1B any time — the 'no second lottery' news does not apply to cap-exempt filings.",
  },
];

const actionPlan = [
  {
    step: 1,
    title: "Confirm the official answer from USCIS, not social media",
    body: "USCIS's announcement on July 17, 2026 is the source of truth. Many sites still say a second lottery 'might' happen. Per USCIS, it will not.",
  },
  {
    step: 2,
    title: "Audit your remaining OPT / cap-gap runway",
    body: "Add your current OPT end date, any STEM OPT 24-month extension window, and any cap-gap end date to a single calendar. After cap-gap expires you cannot keep working without another authorization basis.",
  },
  {
    step: 3,
    title: "If eligible, prepare your STEM OPT 24-month extension",
    body: "You may file the STEM OPT I-765 up to 90 days before your current OPT expires, and within 60 days of your DSO entering the recommendation in SEVIS. A timely filing triggers the automatic 180-day work-authorization extension while pending.",
  },
  {
    step: 4,
    title: "Explore cap-exempt H-1B paths",
    body: "Universities, nonprofits affiliated with universities, and nonprofit/government research employers are cap-exempt and can file H-1Bs year-round. The FY 2027 announcement does not apply to them.",
  },
  {
    step: 5,
    title: "Get ready for the FY 2028 lottery now",
    body: "The wage-weighted selection favors higher-wage offers. Use the coming months to negotiate your role and level so a next-year registration lands in a higher wage band — and to audit your employer's readiness to register on day one.",
  },
];

export default function FY2027H1BNoSecondLotteryPage() {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://www.trackmyopt.com" },
          { name: "Blog", url: "https://www.trackmyopt.com/blog" },
          { name: "FY 2027 H-1B No Second Lottery", url: CANONICAL },
        ]}
      />
      <BlogPostSchema
        imageUrl="https://www.trackmyopt.com/blog/fy2027-h1b-no-second-lottery-opt-backup-plan.svg"
        title={metadata.title as string}
        description={metadata.description as string}
        publishedDate="2026-10-05"
        modifiedDate="2026-10-05"
        author="Vinay Kumar"
        canonicalUrl={CANONICAL}
        faqItems={faqItems}
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
        <span className="text-gray-900 dark:text-white">
          FY 2027 H-1B No Second Lottery
        </span>
      </nav>

      <header className="mb-12">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            H-1B Cap Season
          </span>
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            9 min read
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          FY 2027 H-1B Lottery: Officially <span className="text-blue-600">No Second Round</span> — What OPT Students Must Do Now
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
          On July 17, 2026, USCIS announced it received enough petitions to fill
          the FY 2027 cap. That closes the lottery for this year. If your
          registration was not picked, this guide is your OPT-centered backup plan.
        </p>
        <div className="mt-6 text-sm text-gray-500">
          Last updated: October 5, 2026 • Written by Vinay Kumar
        </div>
      </header>

      <div className="bg-gradient-to-r from-red-50 to-amber-50 dark:from-red-900/20 dark:to-amber-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 mb-10">
        <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">
          Quick Answer
        </p>
        <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
          There is <strong>no second FY 2027 H-1B lottery</strong>. The cap is full
          (65,000 regular + 20,000 advanced-degree). If you were not selected,
          focus on (a) keeping OPT / STEM OPT valid, (b) cap-exempt employers,
          and (c) FY 2028 prep that takes advantage of the new wage-weighted selection.
        </p>
      </div>

      <BlogProductCTA
        variant="case-status"
        sourcePage="/blog/fy2027-h1b-no-second-lottery-opt-backup-plan"
      />

      <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingDown className="w-7 h-7 text-red-500" />
            What USCIS Actually Announced
          </h2>
          <div className="not-prose space-y-4">
            <div className="p-5 rounded-xl border border-gray-200 dark:border-zinc-800">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                On <strong>July 17, 2026</strong>, USCIS confirmed it had received
                enough H-1B petitions to fill the FY 2027 numerical allocations —
                the 65,000 regular cap and the 20,000 advanced-degree exemption.
                That formally ends this year's selection season.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-gray-200 dark:border-zinc-800">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                Overall registration volume was <strong>about 38% lower</strong>{" "}
                than the prior year — but the new wage-weighted selection process
                concentrated picks more strongly among higher-wage offers, and
                enough selections converted into filings to fill the cap in one round.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30">
              <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">
                <strong>Do not rely on rumors.</strong> Sites that still suggest a
                "possible" second FY 2027 selection are out of date. Plan as if
                this year is closed.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-600" />
            Who This Hits Hardest
          </h2>
          <div className="not-prose grid sm:grid-cols-2 gap-4">
            {[
              {
                title: "OPT ending before spring",
                body: "If your OPT ends before the FY 2028 season, this is the most urgent slot. A STEM OPT extension, cap-exempt offer, or alternative visa is the must-have.",
              },
              {
                title: "Cap-gap expiring Sept 30, 2026",
                body: "You cannot keep working on cap-gap past September 30 unless your H-1B was approved. Confirm whether your employer already knows your case status.",
              },
              {
                title: "12-month OPT already used",
                body: "If you have already burned your 12-month OPT, the only realistic work bridges are STEM OPT (still unused), cap-exempt employment, or a different work-visa category.",
              },
              {
                title: "Employers not planning to re-register",
                body: "If your employer is not planning to re-register you in March 2027, treat that as a job-search trigger — not a personal failure.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-5 rounded-xl bg-gray-50 dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800"
              >
                <p className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                  {item.title}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-7 h-7 text-blue-600" />
            Your 5-Step Backup Plan
          </h2>
          <div className="not-prose space-y-3">
            {actionPlan.map((item) => (
              <div
                key={item.step}
                className="flex items-start gap-4 p-5 rounded-xl border border-gray-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
              >
                <span className="shrink-0 w-8 h-8 inline-flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm">
                  {item.step}
                </span>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                    {item.title}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Cap-Exempt vs Cap-Subject — The Distinction That Matters
          </h2>
          <div className="not-prose grid md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30">
              <CheckCircle2 className="w-5 h-5 text-green-600 mb-2" />
              <p className="font-semibold text-green-900 dark:text-green-100 mb-2">
                Cap-exempt employers
              </p>
              <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                <li>• Accredited U.S. universities</li>
                <li>• Nonprofits affiliated with a university</li>
                <li>• Nonprofit / government research organizations</li>
                <li>• Can file H-1Bs year-round, not tied to the cap</li>
              </ul>
            </div>
            <div className="p-5 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30">
              <AlertTriangle className="w-5 h-5 text-red-600 mb-2" />
              <p className="font-semibold text-red-900 dark:text-red-100 mb-2">
                Cap-subject employers
              </p>
              <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                <li>• Most private companies</li>
                <li>• Must re-register next March for FY 2028</li>
                <li>• New wage-weighted system favors higher wage bands</li>
                <li>• Cannot bypass the cap by filing "later"</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
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
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Scale className="w-7 h-7 text-blue-600" />
            Related Reading
          </h2>
          <div className="not-prose grid sm:grid-cols-2 gap-4">
            {[
              {
                href: "/blog/h1b-fy2027-cap-closed-no-second-lottery",
                title: "FY 2027 Cap Closed — Initial Report",
                desc: "The original July announcement, decoded.",
              },
              {
                href: "/blog/h1b-alternatives-work-visas",
                title: "H-1B Alternatives",
                desc: "O-1, L-1, TN, E-3, and more, translated for OPT students.",
              },
              {
                href: "/blog/stem-opt-extension-guide",
                title: "STEM OPT Extension Guide",
                desc: "Eligibility, filing window, and 180-day auto-extension.",
              },
              {
                href: "/blog/h1b-cap-gap-extension",
                title: "Cap-Gap Extension",
                desc: "How cap-gap works, and when it ends.",
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
                  Read <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <div className="not-prose bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-2xl p-6">
            <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
              <strong>Reminder:</strong> TrackMyOPT guides are planning summaries —
              not legal advice. Cap-gap, STEM OPT, and H-1B strategy depends on
              your specific dates, employer type, and status. Confirm decisions
              with your DSO and, for anything complex, an immigration attorney.
            </p>
          </div>
        </section>
      </div>

      <AuthorBio />
    </article>
  );
}
