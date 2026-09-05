import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { AuthorBio } from '@/components/blog/AuthorBio';
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import { getRelatedPostsForSlug } from "@/lib/blog/related-posts";
import { BlogPostSchema } from '@/components/blog/BlogPostSchema';
import { BreadcrumbSchema } from '@/components/BreadcrumbSchema';

const CANONICAL =
  'https://www.trackmyopt.com/blog/f1-visa-social-media-screening-2026';
const DOS_2026_SCREENING =
  'https://travel.state.gov/content/travel/en/News/visas-news/announcement-of-expanded-screening-and-vetting-for-visa-applicants.html';
const DOS_FMJ_SCREENING =
  'https://travel.state.gov/content/travel/en/News/visas-news/announcement-of-expanded-screening-and-vetting-for-h-1b-and-dependent-h-4-visa-applicants.html';
const DOS_SOCIAL_FAQ =
  'https://travel.state.gov/content/dam/visas/Enhanced%20Vetting/CA%20-%20FAQs%20on%20Social%20Media%20Collection%20-%206-4-2019%20%28v.2%29.pdf?inline=1';
const DOS_DS160_FAQ =
  'https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/forms/ds-160-online-nonimmigrant-visa-application/ds-160-faqs.html';

export const metadata: Metadata = {
  title: 'F-1 Visa Social Media Screening (2026)',
  description:
    'F-1 visa applicants face online-presence review and are instructed to make social profiles public. Learn what is confirmed, what is not, and how to prepare.',
  keywords: [
    'F-1 visa social media screening 2026',
    'F-1 visa public social media profiles',
    'DS-160 social media identifiers',
    'online presence review student visa',
    'OPT visa interview social media',
  ],
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: 'F-1 Visa Social Media Screening: What Students Should Know',
    description:
      'The State Department conducts online-presence review for F, M, and J visa applicants and instructs them to make profiles public. Prepare without guessing.',
    url: CANONICAL,
    type: 'article',
    images: [
      {
        url: 'https://www.trackmyopt.com/blog/f1-visa-social-media-screening-2026.png',
        width: 1200,
        height: 630,
        alt: 'Smartphone with abstract social profiles beside a passport and visa review checklist',
      },
    ],
  },
    twitter: {
        card: "summary_large_image",
        title: 'F-1 Visa Social Media Screening: What Students Should Know',
        description: 'The State Department conducts online-presence review for F, M, and J visa applicants and instructs them to make profiles public. Prepare without guessing.',
        images: ['https://www.trackmyopt.com/blog/f1-visa-social-media-screening-2026.png'],
    },
};

const faqItems = [
  {
    question:
      'Do F-1 visa applicants have to make social media profiles public?',
    answer:
      'The State Department instructs F, M, and J nonimmigrant visa applicants to adjust the privacy settings on all social media profiles to “public” or “open” to facilitate online-presence review. Follow the current instructions from the embassy handling the application.',
  },
  {
    question: 'Does the U.S. government ask for social media passwords?',
    answer:
      'The State Department’s official social-media identifier FAQ says consular officers will not request user passwords and will not attempt to subvert privacy controls. Applicants should never provide a password merely because an unofficial person or website claims it is required.',
  },
  {
    question: 'How many years of social media history does the DS-160 request?',
    answer:
      'The DS-160 social-media questions generally request identifiers used on listed platforms during the preceding five years. Applicants should answer the current form exactly as presented and disclose requested identifiers accurately, including old handles they actually used.',
  },
  {
    question: 'Should I delete old posts before an F-1 visa interview?',
    answer:
      'Do not delete or alter information to conceal facts or create a misleading record. There is no official promise that deleting content prevents review, and an inaccurate DS-160 or inconsistent explanation can create a separate credibility problem. Preserve records and obtain legal advice for serious concerns.',
  },
  {
    question:
      'Does social-media screening apply to every F-1 student in the United States?',
    answer:
      'The public-profile instruction discussed here applies to applicants seeking F, M, or J visas through the State Department. It is not a blanket announcement ordering every person currently maintaining F-1 status inside the United States to keep all profiles public indefinitely.',
  },
];

export default function F1VisaSocialMediaScreeningPage() {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://www.trackmyopt.com' },
          { name: 'Blog', url: 'https://www.trackmyopt.com/blog' },
          { name: 'F-1 Visa Social Media Screening', url: CANONICAL },
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
          <span className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-3 py-1 rounded-full">
            Visa Screening Update
          </span>
          <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">
            F, M & J Applicants
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
          F-1 Visa Social Media Screening in 2026: What Officers Can Review
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
          The State Department conducts online-presence review for student visa
          applicants and instructs F, M, and J applicants to make social
          profiles public or open. This guide separates the confirmed
          requirements from rumors and provides a practical accuracy audit.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" /> 9 min read
          </span>
          <span>•</span>
          <span>Published August 11, 2026</span>
          <span>•</span>
          <span>Verified against Department of State guidance</span>
        </div>
      </header>

      <figure className="mb-12">
        <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-xl">
          <Image
            src="/blog/f1-visa-social-media-screening-2026.png"
            alt="Smartphone with abstract social profiles beside a passport and visa review checklist"
            fill
            sizes="(min-width: 768px) 896px, 100vw"
            className="object-cover"
            priority
          />
        </div>
        <figcaption className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
          The safest preparation strategy is factual consistency—not guessing
          which lawful posts an officer may like or dislike.
        </figcaption>
      </figure>

      <div className="bg-gradient-to-r from-violet-50 to-blue-50 dark:from-violet-900/20 dark:to-blue-900/20 border border-violet-200 dark:border-violet-800 rounded-2xl p-6 mb-10">
        <p className="text-xs font-semibold text-violet-700 dark:text-violet-300 uppercase tracking-wider mb-2">
          Direct Answer
        </p>
        <p className="text-lg text-gray-800 dark:text-gray-100 font-medium leading-relaxed mb-0">
          F-1 visa applicants are subject to online-presence review. The State
          Department instructs F, M, and J applicants to set all social media
          profiles to public or open, while the DS-160 requests social-media
          identifiers used during the preceding five years. Official guidance
          says officers do not request passwords. The agency does not publish an
          exhaustive list of every post, keyword, or platform factor it
          evaluates.
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
            <a href="#confirmed" className="hover:underline">
              1. What is officially confirmed
            </a>
          </li>
          <li>
            <a href="#ds160" className="hover:underline">
              2. DS-160 identifiers
            </a>
          </li>
          <li>
            <a href="#review" className="hover:underline">
              3. What review can compare
            </a>
          </li>
          <li>
            <a href="#not-confirmed" className="hover:underline">
              4. What is not confirmed
            </a>
          </li>
          <li>
            <a href="#audit" className="hover:underline">
              5. Seven-step accuracy audit
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
        <section id="confirmed" className="scroll-mt-24">
          <h2>
            What Is Officially Confirmed About F-1 Social Media Screening?
          </h2>
          <p>
            The
            <a
              href={DOS_FMJ_SCREENING}
              target="_blank"
              rel="noopener noreferrer"
            >
              State Department’s student and worker screening announcement
              <ExternalLink
                className="inline w-4 h-4 ml-1"
                aria-hidden="true"
              />
            </a>
            states that all F, M, and J nonimmigrant visa applicants are subject
            to online-presence review. It instructs those applicants to make all
            social media profiles public.
          </p>
          <p>
            A March 25, 2026
            <a
              href={DOS_2026_SCREENING}
              target="_blank"
              rel="noopener noreferrer"
            >
              expanded-vetting announcement
            </a>
            repeats that F, M, and J applicants are already covered and uses the
            wording “public” or “open.” The same notice expands review to
            additional visa categories, but it does not remove student
            applicants from the process.
          </p>
          <div className="not-prose grid sm:grid-cols-3 gap-4 my-8">
            <div className="p-5 rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20">
              <Eye className="w-7 h-7 text-violet-600 mb-3" />
              <p className="font-bold text-violet-900 dark:text-violet-200 mb-1">
                Online review
              </p>
              <p className="text-xs text-violet-800 dark:text-violet-300 mb-0">
                Confirmed for F, M, and J visa applicants.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
              <Smartphone className="w-7 h-7 text-blue-600 mb-3" />
              <p className="font-bold text-blue-900 dark:text-blue-200 mb-1">
                Public profiles
              </p>
              <p className="text-xs text-blue-800 dark:text-blue-300 mb-0">
                Applicants are instructed to change profiles to public or open.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
              <ShieldCheck className="w-7 h-7 text-green-600 mb-3" />
              <p className="font-bold text-green-900 dark:text-green-200 mb-1">
                No passwords
              </p>
              <p className="text-xs text-green-800 dark:text-green-300 mb-0">
                The official FAQ says officers do not request account passwords.
              </p>
            </div>
          </div>
        </section>

        <section id="ds160" className="scroll-mt-24">
          <h2>What Social Media Information Does the DS-160 Request?</h2>
          <p>
            Since May 31, 2019, most immigrant and nonimmigrant visa
            applications have requested social media identifiers. A social-media
            identifier is a username, handle, or other name used on a listed
            platform—not the password.
          </p>
          <p>
            The official
            <a href={DOS_SOCIAL_FAQ} target="_blank" rel="noopener noreferrer">
              social-media identifier FAQ
            </a>
            explains that applicants must provide requested identifiers used
            during the preceding five years. It also says applicants who never
            used a listed platform may answer “None” when the form provides that
            option. A false “None” response is not a privacy strategy.
          </p>
          <h3>Prepare this information before starting the DS-160</h3>
          <ul>
            <li>
              Current usernames and profile URLs for platforms listed on the
              form.
            </li>
            <li>Old usernames used within the requested five-year period.</li>
            <li>
              Accounts that changed names after a move, graduation, or job
              change.
            </li>
            <li>
              A copy of the final DS-160 answers retained with the visa
              application record.
            </li>
          </ul>
          <p>
            The
            <a href={DOS_DS160_FAQ} target="_blank" rel="noopener noreferrer">
              current DS-160 FAQ
            </a>
            emphasizes that answers must be accurate and complete. Errors can
            require correction and rescheduling of the interview.
          </p>
        </section>

        <section id="review" className="scroll-mt-24">
          <h2>What Can an Online-Presence Review Compare?</h2>
          <p>
            The Department of State says it uses available information to
            determine identity and visa eligibility under U.S. law. It does not
            publish a comprehensive scoring rubric. For an F-1 or OPT applicant,
            the practical concern is whether public information conflicts with
            the application and immigration record.
          </p>
          <div className="not-prose overflow-x-auto my-6">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-zinc-800">
                  <th className="text-left p-4 border border-gray-200 dark:border-zinc-700">
                    Public information
                  </th>
                  <th className="text-left p-4 border border-gray-200 dark:border-zinc-700">
                    Record it may be compared with
                  </th>
                  <th className="text-left p-4 border border-gray-200 dark:border-zinc-700">
                    Common consistency question
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    'School and degree',
                    'DS-160, I-20, SEVIS history',
                    'Do institution, program, and dates match?',
                  ],
                  [
                    'Employer and job title',
                    'OPT reporting, résumé, employment letter',
                    'Are employer, dates, location, and duties consistent?',
                  ],
                  [
                    'Freelance or business activity',
                    'Work authorization and visa category',
                    'Was the activity authorized and related to the degree?',
                  ],
                  [
                    'Travel and residence',
                    'DS-160 address and travel history',
                    'Do locations and dates tell the same story?',
                  ],
                  [
                    'Identity details',
                    'Passport and prior applications',
                    'Are names, handles, and biographical facts attributable to the applicant?',
                  ],
                ].map(([publicInfo, record, question]) => (
                  <tr
                    key={publicInfo}
                    className="odd:bg-white even:bg-gray-50/60 dark:odd:bg-zinc-950 dark:even:bg-zinc-900/50"
                  >
                    <td className="p-4 border border-gray-200 dark:border-zinc-700 font-semibold">
                      {publicInfo}
                    </td>
                    <td className="p-4 border border-gray-200 dark:border-zinc-700">
                      {record}
                    </td>
                    <td className="p-4 border border-gray-200 dark:border-zinc-700">
                      {question}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            For OPT students, compare the public employment story against the
            <Link href="/blog/opt-employment-evidence-checklist">
              OPT employment evidence checklist
            </Link>
            and the information reported through the DSO or SEVP Portal. An
            ordinary title difference may have an innocent explanation;
            fabricated employment or unauthorized work is a materially different
            issue.
          </p>
        </section>

        <section id="not-confirmed" className="scroll-mt-24">
          <h2>What the Government Has Not Publicly Confirmed</h2>
          <p>
            Online discussions frequently turn a limited announcement into an
            invented checklist. The official sources reviewed for this article
            do not publish:
          </p>
          <ul>
            <li>
              A list of prohibited lawful opinions, ordinary jokes, or lifestyle
              photos.
            </li>
            <li>
              A promise that deleting a post or account prevents the government
              from finding it.
            </li>
            <li>
              A requirement to volunteer passwords or send private messages to
              an officer.
            </li>
            <li>
              A fixed number of posts, years, or platforms an officer will
              manually inspect beyond the form’s requested identifiers.
            </li>
            <li>
              A guarantee that a perfectly consistent public profile will result
              in visa issuance.
            </li>
          </ul>
          <div className="not-prose bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-6 rounded-r-xl my-8">
            <div className="flex gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900 dark:text-amber-200 mb-1">
                  Do not manufacture a cleaner history
                </p>
                <p className="text-amber-800 dark:text-amber-200/80 text-sm mb-0">
                  Concealing requested identifiers, deleting evidence of
                  unauthorized work, or changing dates to match an application
                  can create a credibility or misrepresentation issue. Correct
                  genuine errors transparently and obtain qualified legal advice
                  for material problems.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="audit" className="scroll-mt-24">
          <h2>Seven-Step F-1 Social Media Accuracy Audit</h2>
          <div className="not-prose grid gap-4 my-8">
            {[
              [
                'Inventory every requested identifier',
                'List current and prior handles used during the DS-160 lookback period. Do not rely on memory during submission.',
              ],
              [
                'Follow the public-profile instruction',
                'Before the interview, review the current State Department and embassy instructions and set covered profiles to public or open as directed.',
              ],
              [
                'Reconcile identity and education',
                'Compare names, schools, degrees, dates, locations, and program details with the passport, DS-160, I-20, and SEVIS record.',
              ],
              [
                'Reconcile OPT employment',
                'Match employer names, job dates, locations, and role descriptions with DSO or SEVP reporting and employment evidence.',
              ],
              [
                'Identify unauthorized-work concerns',
                'Separate innocent wording differences from freelance, gig, startup, or side work that may have required authorization.',
              ],
              [
                'Preserve the submitted record',
                'Save the DS-160 confirmation and a private list of answers, identifiers, corrections, and supporting records.',
              ],
              [
                'Escalate material inconsistencies',
                'Ask a licensed U.S. immigration attorney about omissions, false information, arrests, status violations, or work-authorization concerns before the interview.',
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
          <p>
            Also review the broader
            <Link href="/blog/opt-cpt-enforcement-scrutiny-2026">
              OPT and CPT compliance environment
            </Link>
            , but rely on the primary sources above for the actual social-media
            rule. The public profile is one part of a visa case, not a
            substitute for statutory eligibility.
          </p>
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
            F-1 visa social media screening in 2026 is real: student visa
            applicants face online-presence review, are instructed to make
            profiles public or open, and must disclose requested identifiers
            accurately. What is not supported is the idea that officers demand
            passwords or follow a published list of disfavored ordinary posts.
            Prepare by making the public facts consistent with the immigration
            record—not by trying to erase or rewrite history.
          </p>
        </section>

        <section className="not-prose bg-gradient-to-br from-violet-600 to-blue-700 rounded-2xl p-8 text-white my-12 shadow-xl">
          <div className="flex items-start gap-4">
            <ShieldCheck className="w-9 h-9 text-violet-100 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold text-white mb-3 mt-0">
                Keep the Immigration Record Consistent
              </h2>
              <p className="text-violet-100 mb-6 text-lg">
                TrackMyOPT helps students track employment dates, unemployment
                days, reporting obligations, and documents—the facts that should
                match a visa application and public professional history.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-white text-violet-700 px-6 py-3 rounded-xl font-bold hover:bg-violet-50 transition-colors"
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
                href={DOS_FMJ_SCREENING}
                target="_blank"
                rel="noopener noreferrer"
              >
                Department of State: Screening for H-1B, H-4, F, M, and J
                Applicants
              </a>
            </li>
            <li>
              <a
                href={DOS_2026_SCREENING}
                target="_blank"
                rel="noopener noreferrer"
              >
                Department of State: Expanded Screening and Vetting, March 2026
              </a>
            </li>
            <li>
              <a
                href={DOS_SOCIAL_FAQ}
                target="_blank"
                rel="noopener noreferrer"
              >
                Department of State: Social Media Identifier FAQ
              </a>
            </li>
            <li>
              <a href={DOS_DS160_FAQ} target="_blank" rel="noopener noreferrer">
                Department of State: DS-160 Frequently Asked Questions
              </a>
            </li>
          </ul>
          <p className="text-gray-500 dark:text-gray-400">
            This article provides general educational information, not legal
            advice. Visa eligibility and the significance of any online
            information depend on the individual facts and applicable law.
          </p>
        </section>

        
            <RelatedPosts posts={getRelatedPostsForSlug("f1-visa-social-media-screening-2026")} />
            <AuthorBio />
      </div>
    </article>
  );
}
