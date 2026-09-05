import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileClock,
} from 'lucide-react';
import { AuthorBio } from '@/components/blog/AuthorBio';
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import { getRelatedPostsForSlug } from "@/lib/blog/related-posts";
import { BlogPostSchema } from '@/components/blog/BlogPostSchema';
import { BreadcrumbSchema } from '@/components/BreadcrumbSchema';

const CANONICAL =
  'https://www.trackmyopt.com/blog/august-2026-visa-bulletin-opt-workers';
const AUGUST_BULLETIN =
  'https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/2026/visa-bulletin-for-august-2026.html';
const INDIA_EB2_NOTICE =
  'https://travel.state.gov/content/travel/en/News/visas-news/india-per-country-limit-reached-in-the-eb-2-category.html';
const USCIS_FILING_CHARTS =
  'https://www.uscis.gov/green-card/green-card-processes-and-procedures/visa-availability-priority-dates/adjustment-of-status-filing-charts-from-the-visa-bulletin';

export const metadata: Metadata = {
  title: 'August 2026 Visa Bulletin for OPT Workers',
  description:
    'The August 2026 Visa Bulletin makes EB-2 India unavailable and warns EB-1 India may follow. Learn what this means for OPT workers, I-140s, and I-485s.',
  keywords: [
    'August 2026 Visa Bulletin',
    'EB-2 India unavailable 2026',
    'EB-1 India August 2026',
    'visa bulletin for OPT workers',
    'priority date India green card',
    'I-485 August 2026 filing chart',
  ],
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: 'August 2026 Visa Bulletin: What OPT Workers Need to Know',
    description:
      'EB-2 India is unavailable for final action, EB-1 India is at risk, and October may reset annual limits. See the practical impact on OPT workers.',
    url: CANONICAL,
    type: 'article',
    images: [
      {
        url: 'https://www.trackmyopt.com/blog/august-2026-visa-bulletin-opt-workers.png',
        width: 1200,
        height: 630,
        alt: 'Calendar and abstract employment-based priority-date timelines showing a stopped category',
      },
    ],
  },
    twitter: {
        card: "summary_large_image",
        title: 'August 2026 Visa Bulletin: What OPT Workers Need to Know',
        description: 'EB-2 India is unavailable for final action, EB-1 India is at risk, and October may reset annual limits. See the practical impact on OPT workers.',
        images: ['https://www.trackmyopt.com/blog/august-2026-visa-bulletin-opt-workers.png'],
    },
};

const faqItems = [
  {
    question: 'What does U mean in the August 2026 Visa Bulletin?',
    answer:
      'U means “Unavailable.” For a category shown as U in the Final Action Dates chart, the government cannot use a visa number to approve an adjustment application or issue an immigrant visa in that category during the period of unavailability.',
  },
  {
    question: 'Is EB-2 India closed permanently?',
    answer:
      'No. The State Department says India reached its fiscal-year 2026 EB-2 per-country limit. Annual limits reset when fiscal year 2027 begins on October 1, 2026, though the exact movement after the reset depends on demand and the new annual allocation.',
  },
  {
    question: 'Does EB-2 India being unavailable cancel an approved I-140?',
    answer:
      'No. Visa-number unavailability does not by itself revoke an approved Form I-140 or erase its priority date. It prevents final action while a number is unavailable. The petition can still matter for retention, portability, or future filing, depending on the case.',
  },
  {
    question: 'Can I file Form I-485 using the Dates for Filing chart?',
    answer:
      'Only if USCIS designates that chart for employment-based adjustment filings in the relevant month and your priority date is earlier than the listed date. The State Department publishes both charts, but USCIS separately announces which one adjustment applicants may use.',
  },
  {
    question: 'Does filing an I-140 or waiting for a priority date extend OPT?',
    answer:
      'No. An I-140 petition or a place in the visa queue does not independently extend F-1 status, OPT, STEM OPT, or employment authorization. Maintain a separate valid status and work-authorized basis until another authorization becomes effective.',
  },
];

const indiaSnapshot = [
  [
    'EB-1',
    '15OCT22',
    '01DEC23',
    'DOS warns India could become unavailable before FY 2026 ends.',
  ],
  [
    'EB-2',
    'U',
    '15JAN15',
    'India’s FY 2026 per-country EB-2 limit has been reached.',
  ],
  [
    'EB-3',
    '01JAN14',
    '15JAN15',
    'Final action remains available only before the listed date.',
  ],
  [
    'EB-5 Unreserved',
    'U',
    '01MAY24',
    'Unreserved numbers for India are unavailable; set-asides remain current.',
  ],
];

export default function August2026VisaBulletinPage() {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://www.trackmyopt.com' },
          { name: 'Blog', url: 'https://www.trackmyopt.com/blog' },
          { name: 'August 2026 Visa Bulletin', url: CANONICAL },
        ]}
      />
      <BlogPostSchema
        title={metadata.title as string}
        description={metadata.description as string}
        publishedDate="2026-08-11"
        modifiedDate="2026-08-11"
        author="Vinay Kumar"
        canonicalUrl={CANONICAL}
        faqItems={faqItems}
      />

      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold mb-4">
          <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full">
            Green Card Update
          </span>
          <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-3 py-1 rounded-full">
            EB-2 India Unavailable
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
          August 2026 Visa Bulletin: EB-2 India Unavailable and EB-1 at Risk
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
          The August bulletin contains a consequential split for Indian
          employment-based applicants: EB-2 is unavailable for final action,
          while EB-1 may also become unavailable before the fiscal year ends.
          Here is what OPT workers should—and should not—conclude from those
          charts.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" /> 10 min read
          </span>
          <span>•</span>
          <span>Published August 11, 2026</span>
          <span>•</span>
          <span>Source-checked against DOS Bulletin No. 17</span>
        </div>
      </header>

      <figure className="mb-12">
        <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-xl">
          <Image
            src="/blog/august-2026-visa-bulletin-opt-workers.png"
            alt="Calendar and abstract employment-based priority-date timelines showing a stopped category"
            fill
            sizes="(min-width: 768px) 896px, 100vw"
            className="object-cover"
            priority
          />
        </div>
        <figcaption className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
          A priority date controls a place in line; it does not independently
          grant status or work authorization.
        </figcaption>
      </figure>

      <div className="bg-gradient-to-r from-red-50 to-amber-50 dark:from-red-900/20 dark:to-amber-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 mb-10">
        <p className="text-xs font-semibold text-red-700 dark:text-red-300 uppercase tracking-wider mb-2">
          Direct Answer
        </p>
        <p className="text-lg text-gray-800 dark:text-gray-100 font-medium leading-relaxed mb-0">
          In the August 2026 Final Action Dates chart, EB-2 India is “U,”
          meaning unavailable, and EB-5 India unreserved is also unavailable.
          EB-1 India remains at October 15, 2022, but the State Department warns
          it may become unavailable. These limits pause final approval or visa
          issuance; they do not automatically cancel an I-140, erase a priority
          date, or extend OPT.
        </p>
      </div>

      <nav
        className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 mb-12"
        aria-label="Table of contents"
      >
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          In This Guide
        </h2>
        <ol className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-blue-600 dark:text-blue-400">
          <li>
            <a href="#snapshot" className="hover:underline">
              1. August India snapshot
            </a>
          </li>
          <li>
            <a href="#charts" className="hover:underline">
              2. How the two charts work
            </a>
          </li>
          <li>
            <a href="#unavailable" className="hover:underline">
              3. What “Unavailable” means
            </a>
          </li>
          <li>
            <a href="#opt" className="hover:underline">
              4. Impact on OPT workers
            </a>
          </li>
          <li>
            <a href="#action-plan" className="hover:underline">
              5. Action plan
            </a>
          </li>
          <li>
            <a href="#faq" className="hover:underline">
              6. Frequently asked questions
            </a>
          </li>
        </ol>
      </nav>

      <div className="prose prose-lg prose-longform dark:prose-invert max-w-none prose-a:text-blue-600 dark:prose-a:text-blue-400">
        <section id="snapshot" className="scroll-mt-24">
          <h2>August 2026 Employment-Based Visa Bulletin: India Snapshot</h2>
          <p>
            The
            <a href={AUGUST_BULLETIN} target="_blank" rel="noopener noreferrer">
              Department of State’s August 2026 Visa Bulletin
              <ExternalLink
                className="inline w-4 h-4 ml-1"
                aria-hidden="true"
              />
            </a>
            contains separate Final Action Dates and Dates for Filing. The table
            below reproduces the India employment-based entries most relevant to
            students and early-career workers moving from F-1 status toward
            permanent residence.
          </p>
          <div className="not-prose overflow-x-auto my-6">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-zinc-800">
                  <th className="text-left p-4 border border-gray-200 dark:border-zinc-700">
                    Category
                  </th>
                  <th className="text-left p-4 border border-gray-200 dark:border-zinc-700">
                    Final Action
                  </th>
                  <th className="text-left p-4 border border-gray-200 dark:border-zinc-700">
                    Dates for Filing
                  </th>
                  <th className="text-left p-4 border border-gray-200 dark:border-zinc-700">
                    August 2026 note
                  </th>
                </tr>
              </thead>
              <tbody>
                {indiaSnapshot.map(([category, finalAction, filing, note]) => (
                  <tr
                    key={category}
                    className="odd:bg-white even:bg-gray-50/60 dark:odd:bg-zinc-950 dark:even:bg-zinc-900/50"
                  >
                    <td className="p-4 border border-gray-200 dark:border-zinc-700 font-semibold">
                      {category}
                    </td>
                    <td
                      className={`p-4 border border-gray-200 dark:border-zinc-700 font-bold ${finalAction === 'U' ? 'text-red-600 dark:text-red-400' : ''}`}
                    >
                      {finalAction}
                    </td>
                    <td className="p-4 border border-gray-200 dark:border-zinc-700">
                      {filing}
                    </td>
                    <td className="p-4 border border-gray-200 dark:border-zinc-700">
                      {note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Dates use the bulletin’s day-month-year format. “15OCT22,” for
            example, means October 15, 2022. A priority date generally must be
            earlier than the listed cutoff.
          </p>
        </section>

        <section id="charts" className="scroll-mt-24">
          <h2>Final Action Dates vs. Dates for Filing</h2>
          <p>
            The two charts answer different questions. Confusing them can lead
            to a premature filing or an incorrect expectation about approval.
          </p>
          <div className="not-prose grid md:grid-cols-2 gap-5 my-8">
            <div className="p-6 border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
              <CalendarDays className="w-7 h-7 text-indigo-600 mb-3" />
              <h3 className="font-bold text-indigo-900 dark:text-indigo-200 mb-2">
                Dates for Filing
              </h3>
              <p className="text-sm text-indigo-800 dark:text-indigo-300 mb-0">
                Indicates when documents may be assembled or an adjustment
                application may be filed—but adjustment applicants can use this
                chart only when USCIS says so for that month.
              </p>
            </div>
            <div className="p-6 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <FileClock className="w-7 h-7 text-green-600 mb-3" />
              <h3 className="font-bold text-green-900 dark:text-green-200 mb-2">
                Final Action Dates
              </h3>
              <p className="text-sm text-green-800 dark:text-green-300 mb-0">
                Indicates when a visa number may be used for final approval or
                immigrant-visa issuance, subject to eligibility and continued
                number availability.
              </p>
            </div>
          </div>
          <p>
            USCIS publishes a separate
            <a
              href={USCIS_FILING_CHARTS}
              target="_blank"
              rel="noopener noreferrer"
            >
              monthly adjustment-of-status chart selection
            </a>
            . Do not file Form I-485 solely because the State Department’s Dates
            for Filing chart shows a favorable date.
          </p>
        </section>

        <section id="unavailable" className="scroll-mt-24">
          <h2>What “EB-2 India Unavailable” Actually Means</h2>
          <p>
            India reached its prorated EB-2 limit for fiscal year 2026. The
            <a
              href={INDIA_EB2_NOTICE}
              target="_blank"
              rel="noopener noreferrer"
            >
              State Department’s May 22 notice
            </a>
            says embassies and consulates cannot issue additional EB-2 immigrant
            visas to applicants chargeable to India for the rest of FY 2026. The
            August Final Action chart accordingly shows “U.”
          </p>
          <p>Unavailability generally means:</p>
          <ul>
            <li>
              No final approval or immigrant-visa issuance using an EB-2 India
              number while the category is unavailable.
            </li>
            <li>
              A pending petition or adjustment case is not automatically denied
              solely because the category becomes unavailable.
            </li>
            <li>
              An approved I-140 and its priority date are not automatically
              cancelled.
            </li>
            <li>
              A person still needs a separate lawful status or authorized stay
              while waiting.
            </li>
          </ul>
          <div className="not-prose bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-6 rounded-r-xl my-8">
            <div className="flex gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900 dark:text-amber-200 mb-1">
                  October is a reset, not a guaranteed jump
                </p>
                <p className="text-amber-800 dark:text-amber-200/80 text-sm mb-0">
                  The fiscal-year limit resets October 1, 2026, and DOS
                  previously said issuance may resume for qualified applicants.
                  The exact cutoff movement will depend on FY 2027 allocation
                  and demand. Do not treat October as a guaranteed approval
                  date.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="opt" className="scroll-mt-24">
          <h2>What the August Visa Bulletin Means for OPT Workers</h2>
          <p>
            For someone on OPT or STEM OPT, the most important distinction is
            between a green-card case and current work authorization. Filing or
            approving an I-140 does not itself authorize employment, extend an
            EAD, or preserve F-1 status.
          </p>
          <h3>If only the I-140 is filed or approved</h3>
          <p>
            Continue maintaining an independent status and employment
            authorization. Review the long-term sequence in our
            <Link href="/blog/green-card-after-opt">
              green card after OPT guide
            </Link>
            and, for self-petitioners, our
            <Link href="/blog/eb2-niw-green-card-opt">
              EB-2 NIW guide for OPT students
            </Link>
            .
          </p>
          <h3>If Form I-485 is already pending</h3>
          <p>
            Visa retrogression or unavailability can pause final adjudication
            while the case stays pending. Employment authorization or advance
            parole based on the pending adjustment follows its own validity and
            eligibility rules. Travel, job changes, and maintenance of
            nonimmigrant status require case-specific planning.
          </p>
          <h3>If no immigrant petition has been filed</h3>
          <p>
            A slower Visa Bulletin does not make preparation pointless.
            Employers may still work on the
            <Link href="/blog/perm-labor-certification-opt">
              PERM labor-certification process
            </Link>
            , and applicants may evaluate EB-1, EB-2 NIW, H-1B, O-1, L-1, or
            other lawful pathways when the facts support them. Different
            categories have different legal tests; a backlog alone does not
            create eligibility for another category.
          </p>
        </section>

        <section id="action-plan" className="scroll-mt-24">
          <h2>Six Steps to Take After the August 2026 Visa Bulletin</h2>
          <div className="not-prose grid gap-4 my-8">
            {[
              [
                'Confirm the priority date',
                'Use the date on the I-797 approval or applicable labor-certification record; do not estimate it from an employment start date.',
              ],
              [
                'Identify chargeability',
                'The relevant country is usually the country of birth, not citizenship. Cross-chargeability may apply in some family situations.',
              ],
              [
                'Read the correct category and chart',
                'Separate EB-1, EB-2, EB-3, and EB-5, then distinguish Final Action Dates from Dates for Filing.',
              ],
              [
                'Check the USCIS monthly selection',
                'Adjustment applicants must verify which chart USCIS permits for employment-based I-485 filings that month.',
              ],
              [
                'Protect current work authorization',
                'Track OPT, STEM OPT, cap-gap, H-1B, or adjustment-based EAD deadlines independently from the immigrant-visa queue.',
              ],
              [
                'Review the case before October',
                'Ask qualified counsel how the FY 2027 reset, job changes, travel, portability, or a category upgrade could affect the specific record.',
              ],
            ].map(([title, description]) => (
              <div
                key={title}
                className="flex gap-3 p-5 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl"
              >
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                    {title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="faq" className="scroll-mt-24 mb-12">
          <h2>Frequently Asked Questions</h2>
          <div className="not-prose space-y-4">
            {faqItems.map((faq) => (
              <div
                key={faq.question}
                className="p-5 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800"
              >
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  {faq.question}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-0">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2>The Bottom Line</h2>
          <p>
            The August 2026 Visa Bulletin pauses EB-2 India final action and
            warns that EB-1 India could also become unavailable. For OPT
            workers, that is a queue-management problem—not an automatic
            cancellation of petitions and not an extension of F-1 work
            authorization. Protect the status that lets you work today while
            monitoring the FY 2027 reset and the USCIS filing-chart decision
            each month.
          </p>
        </section>

        <section className="not-prose bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-8 text-white my-12 shadow-xl">
          <div className="flex items-start gap-4">
            <CalendarDays className="w-9 h-9 text-indigo-100 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold text-white mb-3 mt-0">
                Keep Today’s Status Separate From Tomorrow’s Queue
              </h2>
              <p className="text-indigo-100 mb-6 text-lg">
                TrackMyOPT helps F-1 students monitor OPT milestones,
                unemployment days, employment changes, and document deadlines
                while long-term immigration plans develop.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors"
              >
                Create Your Free Account <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        <section className="text-sm">
          <h2>Official Sources</h2>
          <ul>
            <li>
              <a
                href={AUGUST_BULLETIN}
                target="_blank"
                rel="noopener noreferrer"
              >
                Department of State: Visa Bulletin for August 2026
              </a>
            </li>
            <li>
              <a
                href={INDIA_EB2_NOTICE}
                target="_blank"
                rel="noopener noreferrer"
              >
                Department of State: India Per-Country Limit Reached in EB-2
              </a>
            </li>
            <li>
              <a
                href={USCIS_FILING_CHARTS}
                target="_blank"
                rel="noopener noreferrer"
              >
                USCIS: Adjustment of Status Filing Charts
              </a>
            </li>
          </ul>
          <p className="text-gray-500 dark:text-gray-400">
            This article is general educational information, not legal advice or
            a prediction of future priority-date movement. Visa availability and
            filing eligibility are case-specific.
          </p>
        </section>

        
            <RelatedPosts posts={getRelatedPostsForSlug("august-2026-visa-bulletin-opt-workers")} />
            <AuthorBio />
      </div>
    </article>
  );
}
