import { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Scale,
} from "lucide-react";
import { AuthorBio } from "@/components/blog/AuthorBio";
import { BlogPostSchema } from "@/components/blog/BlogPostSchema";
import { BlogProductCTA } from "@/components/blog/BlogProductCTA";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";

const CANONICAL =
  "https://www.trackmyopt.com/blog/september-2026-f1-fixed-admission-rule-opt";

export const metadata: Metadata = {
  title:
    "F-1 Duration of Status Rule Blocked (Oct 2026 Update): What the Court Order and DHS Appeal Mean",
  description:
    "A federal court blocked DHS’s fixed-admission rule for F-1 students. Duration of Status remains in effect while DHS appeals. Here is what changed in September–October 2026 — and what did not.",
  keywords: [
    "duration of status F-1 2026",
    "DHS fixed admission rule blocked",
    "F-1 four year cap injunction",
    "D/S rule appeal First Circuit",
    "September 2026 F-1 rule",
    "OPT duration of status update",
    "F-1 I-94 D/S still valid",
  ],
  openGraph: {
    title:
      "F-1 Duration of Status Still in Effect — Oct 2026 Court Update | TrackMyOPT",
    description:
      "Nationwide injunction blocked DHS’s fixed-admission rule. D/S continues; DHS appealed. Clear guidance for OPT students.",
    url: CANONICAL,
    type: "article",
    images: [
      {
        url: "https://www.trackmyopt.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "F-1 Duration of Status Rule October 2026 Update",
      },
    ],
  },
  alternates: { canonical: CANONICAL },
  twitter: {
    card: "summary_large_image",
    title: "F-1 Duration of Status Still in Effect — Oct 2026 Update",
    description:
      "Court blocked the fixed-admission rule. D/S remains. DHS appealed. What OPT students should do now.",
    images: ["https://www.trackmyopt.com/og-image.jpg"],
  },
};

const faqItems = [
  {
    question: "Is Duration of Status (D/S) ending for F-1 students right now?",
    answer:
      "No. As of early October 2026, a federal court has postponed the effective date of DHS’s fixed-admission rule nationwide. F-1 students continue to be admitted for Duration of Status under the existing regulations while the case proceeds.",
  },
  {
    question: "Did DHS appeal the injunction?",
    answer:
      "Yes. On or about September 30, 2026, the government appealed the district court’s preliminary injunction to the U.S. Court of Appeals for the First Circuit. An appeal does not automatically reinstate the blocked rule. Duration of Status remains in place unless a court orders otherwise.",
  },
  {
    question: "Does this change OPT, STEM OPT, or the 60-day grace period?",
    answer:
      "Not under the blocked rule. OPT filing windows, STEM OPT rules, unemployment limits, and the current 60-day departure grace period continue to operate under existing F-1 regulations. Follow USCIS and your DSO for OPT timelines — those rules were never replaced by the paused fixed-admission framework.",
  },
  {
    question: "What would the blocked rule have changed?",
    answer:
      "The July 17, 2026 DHS final rule would have replaced D/S with fixed periods of admission (often capped at four years), required many students to file Form I-539 for extensions of stay, shortened the departure grace period in the final text, and restricted certain transfers and same-level programs. None of that is currently in force.",
  },
  {
    question: "What should F-1 and OPT students do while litigation continues?",
    answer:
      "Keep complying with current rules: maintain status, report employment to your DSO, file OPT/STEM OPT on time, and do not assume a four-year I-94 cap applies. Watch official court and DHS updates — a future court order could change the picture. This is not legal advice; confirm with your DSO or an immigration attorney for your case.",
  },
];

export default function September2026FixedAdmissionRulePage() {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://www.trackmyopt.com" },
          { name: "Blog", url: "https://www.trackmyopt.com/blog" },
          {
            name: "F-1 Fixed Admission Rule Oct 2026 Update",
            url: CANONICAL,
          },
        ]}
      />
      <BlogPostSchema
        title={metadata.title as string}
        description={metadata.description as string}
        publishedDate="2026-09-15"
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
        <span className="text-gray-900 dark:text-white">D/S Rule Update</span>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            Breaking Policy Update
          </span>
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            8 min read
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          F-1 Duration of Status Rule Blocked: October 2026 Court Update for OPT
          Students
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
          DHS finalized a rule that would have ended Duration of Status (D/S) for
          F-1 students. A federal court paused it nationwide. DHS appealed. Here is
          what that means for your I-94, OPT plans, and grace period — without the
          rumor noise.
        </p>
        <div className="mt-6 text-sm text-gray-500">
          Last updated: October 5, 2026 • Written by Vinay Kumar
        </div>
      </header>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
          Quick Answer
        </p>
        <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
          <strong>Duration of Status is still in effect.</strong> The fixed-admission
          rule is <strong>not</strong> operating. Keep following current OPT and F-1
          rules (including the 60-day grace period). Watch the First Circuit appeal —
          the picture can change if a court lifts the injunction.
        </p>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 mb-10">
        <h2 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Key Takeaway
        </h2>
        <p className="text-amber-800 dark:text-amber-200 font-medium">
          Do <strong>not</strong> plan your semester, OPT filing, or travel as if a
          four-year I-94 cap or mandatory I-539 extension already applies. Those
          pieces belonged to a rule that is currently blocked. Do <strong>not</strong>{" "}
          ignore OPT deadlines — those still apply under existing regulations.
        </p>
      </div>

      <BlogProductCTA
        variant="opt-timeline"
        sourcePage="/blog/september-2026-f1-fixed-admission-rule-opt"
      />

      <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Scale className="w-7 h-7 text-blue-600" />
            What Happened (Timeline)
          </h2>
          <div className="not-prose relative border-l-2 border-blue-300 dark:border-blue-700 ml-4 pl-6 space-y-6 mb-6">
            {[
              {
                date: "July 17, 2026",
                event:
                  "DHS published the final rule replacing Duration of Status with fixed periods of admission for F, J, and I nonimmigrants.",
              },
              {
                date: "August 2026",
                event:
                  "Higher-education and journalism groups sued, arguing DHS violated the Administrative Procedure Act.",
              },
              {
                date: "September 14, 2026",
                event:
                  "U.S. District Judge F. Dennis Saylor IV granted nationwide preliminary relief — postponing the rule’s effective date and barring implementation while the case continues.",
              },
              {
                date: "September 30, 2026",
                event:
                  "The federal government appealed to the First Circuit. The appeal alone does not put the rule back into effect.",
              },
              {
                date: "Early October 2026",
                event:
                  "Status proceedings continue in district court; reporting confirms DHS seeks an expedited appeal. D/S remains the current framework.",
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
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            NAFSA and the Presidents’ Alliance on Higher Education and Immigration have
            published case trackers confirming the nationwide stay. Treat social-media
            claims that “D/S already ended” as outdated unless a new court order says
            otherwise.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            What the Blocked Rule Would Have Done
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            Understanding the proposal helps you spot bad advice — even while it is paused:
          </p>
          <div className="not-prose space-y-3">
            {[
              "Replace D/S on Form I-94 with a date-certain admission period (often tied to program end, commonly discussed as capped around four years).",
              "Require many students to file Form I-539 to extend stay beyond that fixed period.",
              "Tighten transfers, changes of educational objective, and some same-level or second-degree pathways.",
              "Change grace-period timing in the final regulatory text (students widely discussed a move from 60 days toward a shorter window under the new framework).",
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
          <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
            <strong>None of the above is currently enforceable</strong> under the
            injunction. Your school should still issue I-20s and advise under the existing
            D/S system unless official guidance changes.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            What OPT Students Should Do Now
          </h2>
          <div className="not-prose space-y-3 mb-6">
            {[
              {
                title: "Keep filing OPT on the current calendar",
                body: "Up to 90 days before program end, and within the post-completion window your DSO confirms. The blocked rule does not pause USCIS processing delays.",
              },
              {
                title: "Protect the time you already have",
                body: "Late I-765 approvals can still shorten usable OPT under the separate 14-month completion rule — that regulation is independent of the D/S litigation.",
              },
              {
                title: "Travel with current documents",
                body: "Valid passport, F-1 visa (if required), I-20 with travel signature, and I-94 showing D/S. Do not invent a fixed I-94 end date from rumor.",
              },
              {
                title: "Follow the appeal quietly",
                body: "Bookmark NAFSA / Presidents’ Alliance updates. If an appellate court lifts the stay, schools will issue new instructions — that is your signal to re-plan.",
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
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            For delay math on a pending EAD, read{" "}
            <Link
              href="/blog/opt-14-month-rule-delays-shorten-authorization-2026"
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              how the 14-month rule can shorten your OPT
            </Link>{" "}
            and{" "}
            <Link
              href="/blog/opt-ead-pending-processing-delays-2026"
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              what to do when your I-765 is stuck
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
                href: "/blog/opt-processing-time-2026",
                title: "OPT Processing Time 2026",
                desc: "Current I-765 wait expectations and filing timing.",
              },
              {
                href: "/blog/is-opt-ending-dhs-rule-2026",
                title: "Is OPT Ending?",
                desc: "Separate from D/S — what DHS OPT re-evaluation rumors mean.",
              },
              {
                href: "/blog/60-day-grace-period-f1-students",
                title: "60-Day Grace Period",
                desc: "What still applies while D/S remains in force.",
              },
              {
                href: "/blog/can-you-travel-on-opt-complete-guide",
                title: "Traveling on OPT",
                desc: "Documents and re-entry planning under current rules.",
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
      </div>

      <AuthorBio />
    </article>
  );
}
