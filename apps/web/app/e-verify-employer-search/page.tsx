import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  CircleHelp,
  ExternalLink,
  FileCheck2,
  FileText,
  GraduationCap,
  Landmark,
  Search,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react';
import { OfficialEVerifyEmployerSearch } from '@/components/career/h1b/OfficialEVerifyEmployerSearch';
import { safeSerializeJsonLd } from '@/lib/safe-json-ld';

const canonicalUrl = 'https://www.trackmyopt.com/e-verify-employer-search';

const officialSources = {
  search: 'https://www.e-verify.gov/e-verify-employer-search',
  caveats:
    'https://www.e-verify.gov/sites/default/files/everify/E-VerifyEmployerSearchToolCaveats.pdf',
  overview: 'https://www.e-verify.gov/about-e-verify/what-is-e-verify',
  enrollment: 'https://www.e-verify.gov/employers/enrolling-in-e-verify',
  i765: 'https://www.uscis.gov/sites/default/files/document/forms/i-765instr.pdf',
  i983: 'https://studyinthestates.dhs.gov/form-i-983-overview',
  myEVerify: 'https://myeverify.uscis.gov/',
};

const faqs = [
  {
    question: 'Is E-Verify required for STEM OPT?',
    answer:
      'Yes. An employer must be enrolled in E-Verify and remain in good standing for a student to qualify for the 24-month STEM OPT extension. The student and employer must also complete Form I-983 and meet the other STEM OPT requirements.',
  },
  {
    question: 'Is E-Verify required for regular post-completion OPT?',
    answer:
      'E-Verify enrollment is a specific employer requirement for the 24-month STEM OPT extension. Regular post-completion OPT has different employment rules. Confirm your situation with your designated school official because changing employers or moving to STEM OPT can change what is required.',
  },
  {
    question: 'Why can’t I find my employer in the public search?',
    answer:
      'Try the employer’s exact legal name, DBA, abbreviation, parent company, franchisee, and worksite city. USCIS says the public database only includes employers that self-report five or more employees, and not every participating location is necessarily displayed. Ask HR to confirm enrollment directly.',
  },
  {
    question: 'Does a search result prove an employer qualifies for STEM OPT?',
    answer:
      'No. A public search result is one checkpoint, not a complete eligibility decision. Confirm the employer’s current enrollment and Company ID with HR, complete Form I-983, and review the training plan and employer relationship with your designated school official.',
  },
  {
    question: 'Can I search by a company’s DBA or trade name?',
    answer:
      'Yes. USCIS records can use a legal name, trade name, abbreviation, or location-based name. Search both the name shown on the job offer and the legal entity listed on tax or employment documents. For franchises, ask which legal entity will employ and pay you.',
  },
  {
    question: 'What E-Verify number goes on Form I-765 for STEM OPT?',
    answer:
      'USCIS Form I-765 instructions request the employer name as listed in E-Verify plus the employer’s E-Verify Company Identification Number or a valid E-Verify Client Company Identification Number. Ask the employer for that number; do not substitute an EIN.',
  },
  {
    question: 'Is an EIN the same as an E-Verify Company ID?',
    answer:
      'No. An EIN is a federal tax identification number issued by the IRS. An E-Verify Company ID or Client Company ID identifies an employer’s E-Verify enrollment. These numbers serve different purposes and should not be used interchangeably on a STEM OPT application.',
  },
];

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: 'E-Verify Employer Search for STEM OPT',
      description:
        'Free access to the official USCIS E-Verify employer search with plain-English STEM OPT guidance.',
      isPartOf: { '@id': 'https://www.trackmyopt.com/#website' },
      about: [
        { '@type': 'Thing', name: 'E-Verify' },
        { '@type': 'Thing', name: 'STEM Optional Practical Training' },
      ],
      dateModified: '2026-08-29',
      inLanguage: 'en-US',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://www.trackmyopt.com/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Free Tools',
          item: 'https://www.trackmyopt.com/tools',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'E-Verify Employer Search',
          item: canonicalUrl,
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    },
  ],
};

const interpretationRows = [
  {
    result: 'Employer appears as enrolled',
    meaning: 'The employer appears as participating in E-Verify.',
    next: 'Confirm the exact legal entity and current Company ID with HR before filing.',
  },
  {
    result: 'Employer appears as terminated',
    meaning:
      'The result may show that the listed enrollment is no longer active.',
    next: 'Do not rely on an old enrollment. Ask HR and your DSO to confirm current eligibility.',
  },
  {
    result: 'No matching result',
    meaning:
      'This does not, by itself, prove that the employer is not enrolled.',
    next: 'Try legal-name and DBA variants, then ask HR for the E-Verify Company ID.',
  },
];

export default function EVerifyEmployerSearchPage() {
  return (
    <>
      <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-zinc-950 dark:text-white">
        <section className="relative overflow-hidden border-b border-blue-100 bg-gradient-to-br from-white via-blue-50 to-indigo-100/70 px-4 pb-16 pt-28 dark:border-blue-950 dark:from-zinc-950 dark:via-slate-950 dark:to-blue-950/40 sm:px-6 sm:pb-20 sm:pt-32 lg:px-8">
          <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_1px_1px,rgba(37,99,235,0.16)_1px,transparent_0)] [background-size:28px_28px] dark:opacity-20" />
          <div className="relative mx-auto max-w-6xl">
            <nav
              aria-label="Breadcrumb"
              className="mb-8 text-sm text-slate-600 dark:text-slate-400"
            >
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link
                    href="/"
                    className="hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link
                    href="/tools"
                    className="hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    Free tools
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li
                  aria-current="page"
                  className="font-medium text-slate-900 dark:text-white"
                >
                  E-Verify search
                </li>
              </ol>
            </nav>

            <div className="grid items-center gap-10 lg:grid-cols-[1.25fr_.75fr]">
              <div>
                <div className="mb-5 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Free · No sign-in required
                  </span>
                </div>
                <h1 className="max-w-4xl text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
                  E-Verify employer search
                </h1>
                <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700 dark:text-slate-300 sm:text-xl">
                  Check whether an employer appears in E-Verify. For STEM OPT,
                  confirm the legal employer name and Company ID with HR before
                  filing Form I-765.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href="#employer-search"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
                  >
                    Search an employer
                    <Search className="h-4 w-4" aria-hidden="true" />
                  </a>
                  <a
                    href={officialSources.search}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-800 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800 dark:focus-visible:ring-offset-zinc-950"
                  >
                    Open directly on USCIS
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              </div>

              <aside className="rounded-3xl border border-white/80 bg-white/85 p-6 shadow-xl shadow-blue-900/5 backdrop-blur dark:border-slate-800 dark:bg-zinc-900/85">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-bold">Quick answer</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      What students should verify
                    </p>
                  </div>
                </div>
                <ul className="mt-5 space-y-4 text-sm leading-6 text-slate-700 dark:text-slate-300">
                  {[
                    'Search the exact legal employer name and DBA variants.',
                    'Confirm the Company ID directly with the employer.',
                    'Do not use an EIN in place of an E-Verify Company ID.',
                    'Review Form I-983 and eligibility with your DSO.',
                  ].map((item) => (
                    <li key={item} className="flex gap-3">
                      <CheckCircle2
                        className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl space-y-20 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <section
            id="employer-search"
            className="scroll-mt-28"
            aria-labelledby="search-section-heading"
          >
            <div className="mb-7 max-w-3xl">
              <h2
                id="search-section-heading"
                className="text-3xl font-black tracking-tight sm:text-4xl"
              >
                Search an employer
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
                Search the official USCIS records by employer name.
              </p>
            </div>
            <OfficialEVerifyEmployerSearch />
          </section>

          <section
            aria-labelledby="how-to-search-heading"
            className="grid gap-10 lg:grid-cols-[.75fr_1.25fr]"
          >
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-blue-700 dark:text-blue-300">
                Search smarter
              </p>
              <h2
                id="how-to-search-heading"
                className="mt-2 text-3xl font-black tracking-tight"
              >
                How to search an employer
              </h2>
              <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">
                Employer records are sensitive to names and locations. A careful
                search reduces false “not found” results.
              </p>
            </div>
            <ol className="grid gap-4 sm:grid-cols-3">
              {[
                [
                  '1',
                  'Start with the offer',
                  'Search the employer name exactly as it appears on your offer letter or employment paperwork.',
                ],
                [
                  '2',
                  'Try name variants',
                  'Try the legal name, DBA, abbreviation, parent company, or franchisee that will actually employ you.',
                ],
                [
                  '3',
                  'Confirm with HR',
                  'Ask HR for the current E-Verify Company ID and confirm it matches the legal employer for Form I-983.',
                ],
              ].map(([step, title, text]) => (
                <li
                  key={step}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-black text-white">
                    {step}
                  </span>
                  <h3 className="mt-5 text-lg font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {text}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="results-heading">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-widest text-blue-700 dark:text-blue-300">
                Understand the result
              </p>
              <h2
                id="results-heading"
                className="mt-2 text-3xl font-black tracking-tight"
              >
                What an E-Verify search result means
              </h2>
              <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">
                Use a result as a starting point, not a decision about STEM OPT
                eligibility.
              </p>
            </div>
            <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-slate-100 text-sm text-slate-700 dark:bg-zinc-800 dark:text-slate-200">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-bold">
                      Search result
                    </th>
                    <th scope="col" className="px-6 py-4 font-bold">
                      What it tells you
                    </th>
                    <th scope="col" className="px-6 py-4 font-bold">
                      What to do next
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm leading-6 dark:divide-zinc-800">
                  {interpretationRows.map((row) => (
                    <tr key={row.result}>
                      <th
                        scope="row"
                        className="px-6 py-5 align-top font-bold text-slate-950 dark:text-white"
                      >
                        {row.result}
                      </th>
                      <td className="px-6 py-5 align-top text-slate-600 dark:text-slate-300">
                        {row.meaning}
                      </td>
                      <td className="px-6 py-5 align-top text-slate-600 dark:text-slate-300">
                        {row.next}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
              <TriangleAlert
                className="mt-0.5 h-5 w-5 shrink-0"
                aria-hidden="true"
              />
              <p>
                <strong>USCIS search caveat:</strong> the public database
                includes employers that self-report five or more employees, and
                not every business location may appear. A missing result does
                not establish whether an employer is enrolled. See the official{' '}
                <a
                  href={officialSources.caveats}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline underline-offset-4"
                >
                  Employer Search Tool Caveats
                </a>
                .
              </p>
            </div>
          </section>

          <section
            aria-labelledby="stem-opt-heading"
            className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white shadow-xl shadow-blue-900/10"
          >
            <div className="grid gap-10 p-7 sm:p-10 lg:grid-cols-[1fr_1.1fr] lg:p-12">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold ring-1 ring-white/20">
                  <GraduationCap className="h-4 w-4" aria-hidden="true" />
                  STEM OPT checklist
                </div>
                <h2
                  id="stem-opt-heading"
                  className="mt-5 text-3xl font-black tracking-tight sm:text-4xl"
                >
                  E-Verify is required—but it is not the only requirement
                </h2>
                <p className="mt-5 leading-8 text-blue-100">
                  For the 24-month STEM OPT extension, the employer must
                  participate in E-Verify and the student and employer must
                  complete Form I-983. Your DSO recommends the STEM OPT
                  extension in SEVIS before you file Form I-765.
                </p>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {[
                  'Confirm active E-Verify enrollment',
                  'Get the correct Company ID from HR',
                  'Complete and sign Form I-983',
                  'Confirm the legal employer relationship',
                  'Request the STEM OPT recommendation from your DSO',
                  'Use the employer name exactly as listed in E-Verify',
                ].map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 rounded-2xl bg-white/10 p-4 ring-1 ring-white/15"
                  >
                    <CheckCircle2
                      className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300"
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium leading-6">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section
            aria-labelledby="numbers-heading"
            className="grid gap-8 lg:grid-cols-3"
          >
            <div className="lg:col-span-3">
              <p className="text-sm font-bold uppercase tracking-widest text-blue-700 dark:text-blue-300">
                Avoid a common filing error
              </p>
              <h2
                id="numbers-heading"
                className="mt-2 text-3xl font-black tracking-tight"
              >
                Company ID, EIN, and case number are different
              </h2>
            </div>
            {[
              {
                icon: BadgeCheck,
                title: 'E-Verify Company ID',
                text: 'An identifier connected to the employer’s E-Verify enrollment. Form I-765 instructions request this number or a valid Client Company ID for STEM OPT.',
              },
              {
                icon: FileText,
                title: 'Employer Identification Number (EIN)',
                text: 'A federal tax identifier issued by the IRS. It is not interchangeable with an E-Verify Company ID.',
              },
              {
                icon: FileCheck2,
                title: 'E-Verify case number',
                text: 'A number for an individual employment-verification case. It is not the employer enrollment identifier requested for STEM OPT.',
              },
            ].map(({ icon: Icon, title, text }) => (
              <article
                key={title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {text}
                </p>
              </article>
            ))}
          </section>

          <section aria-labelledby="faq-heading">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                <CircleHelp className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2
                id="faq-heading"
                className="mt-5 text-3xl font-black tracking-tight sm:text-4xl"
              >
                E-Verify employer search FAQ
              </h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
                Clear answers to the questions students ask before accepting a
                STEM OPT role.
              </p>
            </div>
            <div className="mx-auto mt-10 grid max-w-4xl gap-4">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm open:border-blue-300 dark:border-zinc-800 dark:bg-zinc-900 dark:open:border-blue-800"
                >
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-bold marker:content-none">
                    {faq.question}
                    <span
                      aria-hidden="true"
                      className="text-2xl font-light text-blue-600 transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-4 border-t border-slate-100 pt-4 leading-7 text-slate-600 dark:border-zinc-800 dark:text-slate-300">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          <section aria-labelledby="next-steps-heading">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-blue-700 dark:text-blue-300">
                  Keep moving
                </p>
                <h2
                  id="next-steps-heading"
                  className="mt-2 text-3xl font-black tracking-tight"
                >
                  Your next OPT and career steps
                </h2>
              </div>
              <Link
                href="/tools"
                className="inline-flex min-h-11 items-center gap-2 font-semibold text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100"
              >
                Browse all free tools{' '}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                {
                  href: '/features/case-status',
                  icon: FileCheck2,
                  title: 'Track USCIS case status',
                  text: 'Check your case and get plain-English status guidance.',
                },
                {
                  href: '/features/sponsors',
                  icon: BriefcaseBusiness,
                  title: 'Research H-1B sponsors',
                  text: 'Explore sponsorship history, filings, and employer signals.',
                },
                {
                  href: '/tools/stem-apply',
                  icon: BookOpen,
                  title: 'Calculate your STEM OPT window',
                  text: 'See your earliest and latest filing dates.',
                },
              ].map(({ href, icon: Icon, title, text }) => (
                <Link
                  key={href}
                  href={href}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-800"
                >
                  <Icon
                    className="h-6 w-6 text-blue-600 dark:text-blue-400"
                    aria-hidden="true"
                  />
                  <h3 className="mt-4 text-lg font-bold group-hover:text-blue-700 dark:group-hover:text-blue-300">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {text}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
                    Open tool{' '}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="sources-heading"
            className="rounded-3xl border border-slate-200 bg-white p-7 dark:border-zinc-800 dark:bg-zinc-900 sm:p-9"
          >
            <div className="flex items-start gap-4">
              <Landmark
                className="mt-1 h-6 w-6 shrink-0 text-blue-600 dark:text-blue-400"
                aria-hidden="true"
              />
              <div>
                <h2 id="sources-heading" className="text-2xl font-black">
                  Official sources and review notes
                </h2>
                <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">
                  Reviewed August 29, 2026. This page is educational and is not
                  legal advice or a USCIS endorsement. Confirm filing decisions
                  with your DSO, employer, and official government instructions.
                </p>
                <ul className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                  {[
                    ['USCIS E-Verify Employer Search', officialSources.search],
                    ['Employer Search Tool Caveats', officialSources.caveats],
                    ['What is E-Verify?', officialSources.overview],
                    ['Enrolling in E-Verify', officialSources.enrollment],
                    ['USCIS Form I-765 Instructions', officialSources.i765],
                    ['Study in the States: Form I-983', officialSources.i983],
                    ['myE-Verify for employees', officialSources.myEVerify],
                  ].map(([label, href]) => (
                    <li key={href}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center gap-2 font-semibold text-blue-700 underline decoration-blue-300 underline-offset-4 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100"
                      >
                        {label}
                        <ExternalLink
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeSerializeJsonLd(schema) }}
      />
    </>
  );
}
