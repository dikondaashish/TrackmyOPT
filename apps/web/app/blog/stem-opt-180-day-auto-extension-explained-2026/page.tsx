import { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { AuthorBio } from "@/components/blog/AuthorBio";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BlogProductCTA } from "@/components/blog/BlogProductCTA";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";

const CANONICAL =
  "https://www.trackmyopt.com/blog/stem-opt-180-day-auto-extension-explained-2026";

export const metadata: Metadata = {
  title:
    "STEM OPT 180-Day Auto-Extension Explained (2026): When It Applies, When It Stops, and What Employers Miss",
  description:
    "File your STEM OPT I-765 on time and you may automatically get 180 days of work authorization after your OPT expires — but the rule has sharp edges. Full 2026 explainer.",
  keywords: [
    "stem opt 180 day auto extension",
    "stem opt extension pending can i work",
    "i-765 stem opt timely filing automatic extension",
    "stem opt 180 days when does it end",
    "180-day auto extension OPT expires while pending",
    "stem opt unemployment 150 days",
  ],
  openGraph: {
    title:
      "STEM OPT 180-Day Auto-Extension — 2026 Explainer | TrackMyOPT",
    description:
      "File your STEM OPT I-765 on time and you may get 180 days of work authorization after OPT expires. Sharp edges explained.",
    url: CANONICAL,
    type: "article",
    images: [
      {
        url: "https://www.trackmyopt.com/blog/stem-opt-180-day-auto-extension-explained-2026.svg",
        width: 1200,
        height: 630,
        alt: "STEM OPT 180-Day Auto-Extension Explained",
      },
    ],
  },
  alternates: { canonical: CANONICAL },
  twitter: {
    card: "summary_large_image",
    title: "STEM OPT 180-Day Auto-Extension Explained",
    description:
      "When the 180-day bridge applies, when it stops, and what employers miss.",
    images: ["https://www.trackmyopt.com/blog/stem-opt-180-day-auto-extension-explained-2026.svg"],
  },
};

const faqItems = [
  {
    question: "What is the STEM OPT 180-day auto-extension?",
    answer:
      "If you file your STEM OPT I-765 on time (up to 90 days before your current OPT end date, and within 60 days of your DSO entering the STEM OPT recommendation in SEVIS) and your OPT expires while the application is still pending, USCIS automatically extends your employment authorization for up to 180 days. You do not receive a separate 180-day EAD card — the extension is automatic by regulation.",
  },
  {
    question: "When does the 180-day extension stop?",
    answer:
      "Three triggers end the extension: (1) USCIS approves your STEM OPT — in which case your new 24-month EAD controls; (2) USCIS denies your application — employment authorization ends immediately; or (3) 180 days pass without a decision — authorization ends at day 180.",
  },
  {
    question: "Does the 180-day extension also extend my F-1 status?",
    answer:
      "It preserves your work authorization. Your F-1 student status is preserved separately by the timely filing itself and continued compliance (employer reporting, unemployment limits). Always confirm with your DSO that your SEVIS record is active through the pending period.",
  },
  {
    question: "What unemployment days count during the auto-extension?",
    answer:
      "You continue to accrue unemployment days against the 150-day aggregate cap (90 initial OPT + 60 STEM extension). The auto-extension does not pause or reset the unemployment counter.",
  },
  {
    question: "What if my employer doesn't recognize the auto-extension?",
    answer:
      "Many HR teams see an expired EAD and assume you must stop working. Show them the I-765 receipt notice and the regulatory basis in 8 CFR 214.2(f)(11)(i)(C), which confirms the automatic 180-day extension. Some employers also accept a letter from your DSO.",
  },
];

const edges = [
  {
    title: "Filed on time = the only door in",
    body: "If your I-765 was received by USCIS even one day after your current OPT expiration, you do not get the auto-extension. The timely filing is what triggers it.",
  },
  {
    title: "180 days is the ceiling, not a guarantee",
    body: "If 180 days pass with no USCIS action, work authorization stops at day 180. It does not pause because of RFE back-and-forth; only an approval, denial, or RFE clock event changes the picture.",
  },
  {
    title: "Denial ends work instantly",
    body: "A denial stops the auto-extension immediately. Plan an exit or alternative work basis in advance so you are not caught off guard.",
  },
  {
    title: "180 days ≠ 6 calendar months exactly",
    body: "The clock counts days, not months. Mark day 180 in your calendar from the date your OPT expired.",
  },
  {
    title: "Travel while pending is risky",
    body: "International travel during a pending STEM OPT application raises re-entry complexity. Talk to your DSO before booking.",
  },
];

const checklist = [
  "I-765 receipt notice (Form I-797C) for the STEM OPT application",
  "Your most recent expired EAD card",
  "I-20 with your DSO's STEM OPT recommendation on page 2",
  "The regulation: 8 CFR 214.2(f)(11)(i)(C)",
  "A short letter from your DSO confirming timely filing and SEVIS status",
];

export default function STEMOPTAutoExtensionPage() {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://www.trackmyopt.com" },
          { name: "Blog", url: "https://www.trackmyopt.com/blog" },
          { name: "STEM OPT 180-Day Auto-Extension", url: CANONICAL },
        ]}
      />
      <BlogPostSchema
        imageUrl="https://www.trackmyopt.com/blog/stem-opt-180-day-auto-extension-explained-2026.svg"
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
          STEM OPT 180-Day Auto-Extension
        </span>
      </nav>

      <header className="mb-12">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            Work Authorization Guide
          </span>
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            8 min read
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          STEM OPT 180-Day Auto-Extension: When It Applies, When It <span className="text-red-500">Stops</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
          File your STEM OPT extension on time and USCIS automatically extends
          your work authorization for up to 180 days if your case stays pending.
          It's powerful — and it's also where students most often misjudge risk.
        </p>
        <div className="mt-6 text-sm text-gray-500">
          Last updated: October 5, 2026 • Written by Vinay Kumar
        </div>
      </header>

      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 mb-10">
        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
          Quick Answer
        </p>
        <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
          The 180-day auto-extension applies <strong>only</strong> when you filed
          your STEM OPT I-765 <strong>on time</strong>. It ends on the earliest
          of: approval, denial, or day 180. It does not pause your unemployment
          counter, and it does not give you a separate EAD card.
        </p>
      </div>

      <BlogProductCTA
        variant="case-status"
        sourcePage="/blog/stem-opt-180-day-auto-extension-explained-2026"
      />

      <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-emerald-600" />
            The Rule, in One Paragraph
          </h2>
          <div className="not-prose p-5 rounded-xl border border-gray-200 dark:border-zinc-800">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              Under <strong>8 CFR 214.2(f)(11)(i)(C)</strong>, if you file your
              STEM OPT extension Form I-765 on time — up to <strong>90 days
              before</strong> your current post-completion OPT end date, and
              within <strong>60 days</strong> of your DSO entering the STEM OPT
              recommendation in SEVIS — then if your OPT expires while the
              application is pending, your employment authorization is
              automatically extended for up to <strong>180 days</strong> from the
              OPT expiration date.
            </p>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
            No second card is printed. The extension exists by regulation. This
            is where confusion most often starts: your employer's I-9 system
            sees an expired EAD and stops you, even though the law says you can
            keep working.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-7 h-7 text-red-500" />
            Five Sharp Edges Most Students Miss
          </h2>
          <div className="not-prose space-y-3">
            {edges.map((item) => (
              <div
                key={item.title}
                className="p-5 rounded-xl bg-gray-50 dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800"
              >
                <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
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
            <Calendar className="w-7 h-7 text-blue-600" />
            A Realistic 2026 Timeline Example
          </h2>
          <div className="not-prose relative border-l-2 border-blue-300 dark:border-blue-700 ml-4 pl-6 space-y-5">
            {[
              {
                date: "Program end",
                event: "OPT end date on current EAD — Oct 14, 2026",
              },
              {
                date: "Jul 16, 2026",
                event:
                  "DSO enters STEM OPT recommendation in SEVIS. 60-day filing window opens.",
              },
              {
                date: "Jul 22, 2026",
                event:
                  "I-765 filed and receipted. Auto-extension protection attaches (because filing was timely).",
              },
              {
                date: "Oct 14, 2026",
                event:
                  "Current OPT EAD expires. Auto-extension starts on day 1 because the I-765 is still pending.",
              },
              {
                date: "Apr 12, 2027",
                event:
                  "Day 180 since OPT expiration. If USCIS has not yet acted, work authorization stops today.",
              },
            ].map((item) => (
              <div key={item.date} className="relative">
                <span className="absolute -left-[1.6rem] top-1.5 h-3 w-3 rounded-full bg-blue-500" />
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  {item.date}
                </p>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {item.event}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-7 h-7 text-blue-600" />
            What to Show a Skeptical Employer
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            HR teams that don't process many STEM OPT extensions often stop you
            the day your card expires. That's wrong. Pull together:
          </p>
          <div className="not-prose space-y-2">
            {checklist.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-zinc-800"
              >
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-700 dark:text-gray-300">{item}</p>
              </div>
            ))}
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
                href: "/blog/stem-opt-extension-guide",
                title: "STEM OPT Extension Guide",
                desc: "Eligibility, filing windows, and Form I-983 basics.",
              },
              {
                href: "/blog/stem-opt-unemployment-limit",
                title: "STEM OPT Unemployment 150-Day Limit",
                desc: "How the 90+60 day cap actually computes.",
              },
              {
                href: "/blog/stem-opt-processing-time-2026",
                title: "STEM OPT Processing Time 2026",
                desc: "Recent USCIS timelines and RFE patterns.",
              },
              {
                href: "/blog/laid-off-on-stem-opt",
                title: "Laid Off on STEM OPT",
                desc: "Grace-period math and reporting duties.",
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
              <strong>Reminder:</strong> This guide describes the regulation and
              common practice. Your I-20, SEVIS record, and employer's I-9
              posture are case-specific. Confirm with your DSO and, for anything
              complex, an immigration attorney. TrackMyOPT articles are planning
              resources — not legal advice.
            </p>
          </div>
        </section>
      </div>

      <AuthorBio />
    </article>
  );
}
