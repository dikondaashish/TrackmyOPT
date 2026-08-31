import Image from 'next/image';
import Link from 'next/link';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Lightbulb,
  ShieldCheck,
} from 'lucide-react';
import { AuthorBio } from '@/components/blog/AuthorBio';
import { BlogPostSchema } from '@/components/blog/BlogPostSchema';
import { BlogProductCTA } from '@/components/blog/BlogProductCTA';
import { BreadcrumbSchema } from '@/components/BreadcrumbSchema';
import type { ResearchArticle } from '@/data/blog-series/types';
import { AdSenseInArticle } from '@/components/blog/AdSenseInArticle';

const SITE = 'https://www.trackmyopt.com';
const DEFAULT_IMAGE = '/blog/international-student-guidance-library-2026.png';

export function ResearchArticlePage({ article }: { article: ResearchArticle }) {
  const canonical = `${SITE}/blog/${article.slug}`;
  const image = article.image ?? DEFAULT_IMAGE;
  const imageUrl = image.startsWith('http') ? image : `${SITE}${image}`;

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: SITE },
          { name: 'Blog', url: `${SITE}/blog` },
          { name: article.title, url: canonical },
        ]}
      />
      <BlogPostSchema
        title={article.title}
        description={article.description}
        publishedDate={article.publishedDate}
        modifiedDate={article.modifiedDate}
        author="Vinay Kumar"
        canonicalUrl={canonical}
        imageUrl={imageUrl}
        faqItems={article.faq}
      />

      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold mb-4">
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
            {article.category}
          </span>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            Verified 2026 Guide
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
          {article.title}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
          {article.description}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" /> {article.readTime}
          </span>
          <span aria-hidden>•</span>
          <span>Published {formatDate(article.publishedDate)}</span>
          <span aria-hidden>•</span>
          <span>Reviewed against primary government sources</span>
        </div>
      </header>

      <figure className="mb-10">
        <div className="relative aspect-[1200/630] overflow-hidden rounded-2xl shadow-xl">
          <Image
            src={image}
            alt={
              article.imageAlt ??
              `International student reviewing documents for ${article.title}`
            }
            fill
            priority
            sizes="(min-width: 768px) 896px, 100vw"
            className="object-cover"
          />
        </div>
        <figcaption className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
          {article.imageCaption ??
            'A practical TrackMyOPT guide: confirm the rule, document your dates, and act before the deadline.'}
        </figcaption>
      </figure>

      {article.statusNote && (
        <div className="mb-8 rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
          <p className="font-bold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" /> Publication-status note
          </p>
          <p className="mt-2 mb-0">{article.statusNote}</p>
        </div>
      )}

      <div className="mb-10 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-6 dark:border-emerald-800 dark:from-emerald-950/30 dark:to-teal-950/20">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
          Direct answer
        </p>
        <p className="mb-0 text-lg font-medium leading-relaxed text-gray-900 dark:text-gray-100">
          {article.directAnswer}
        </p>
      </div>

      <AdSenseInArticle />

      <div className="prose prose-lg prose-longform dark:prose-invert max-w-none prose-a:text-blue-600 dark:prose-a:text-blue-400">
        <section>
          <h2>What You Should Know First</h2>
          <ul>
            {article.keyTakeaways.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        {article.sections.map((section, index) => (
          <section
            id={`section-${index + 1}`}
            className="scroll-mt-24"
            key={section.heading}
          >
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.bullets && (
              <ul>
                {section.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
            {section.numbered && (
              <ol>
                {section.numbered.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            )}
            {section.note && (
              <div className="not-prose my-7 rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-800 dark:bg-blue-950/30">
                <p className="mb-2 flex items-center gap-2 font-bold text-blue-900 dark:text-blue-100">
                  <Lightbulb className="h-5 w-5" /> Vinay&apos;s practical note
                </p>
                <p className="mb-0 leading-relaxed text-blue-900 dark:text-blue-100">
                  {section.note}
                </p>
              </div>
            )}
          </section>
        ))}

        <section>
          <h2>Your Action Checklist</h2>
          <div className="not-prose grid gap-3">
            {article.checklist.map((item) => (
              <div
                className="flex gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/20"
                key={item}
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-700 dark:text-green-400" />
                <span className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2>Common Mistakes to Avoid</h2>
          <ul>
            {article.mistakes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      <BlogProductCTA
        variant={article.cta}
        sourcePage={`/blog/${article.slug}`}
      />

      <div className="prose prose-lg dark:prose-invert max-w-none">
        {article.category.includes('Tax') && (
          <aside className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-100">
            <strong>Tax disclaimer:</strong> This educational guide is not tax,
            legal, or accounting advice. Tax residency, treaty eligibility, and
            filing obligations depend on individual facts. Verify the current
            IRS and state instructions or consult a qualified international-tax
            professional.
          </aside>
        )}
        {article.dataNote && (
          <section className="rounded-xl border border-violet-200 bg-violet-50 p-6 dark:border-violet-800 dark:bg-violet-950/20">
            <h2 className="mt-0 flex items-center gap-2">
              <ShieldCheck className="h-6 w-6" /> Data and methodology note
            </h2>
            <p className="mb-0">{article.dataNote}</p>
          </section>
        )}

        <section>
          <h2>Frequently Asked Questions</h2>
          {article.faq.map((item) => (
            <div className="mb-6" key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </div>
          ))}
        </section>

        <section>
          <h2>Official Sources</h2>
          <p>
            Rules can change. We checked this guide against the primary sources
            below; always open the current form instructions or agency page
            before acting.
          </p>
          <ul>
            {article.sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  {source.label} — {source.publisher}{' '}
                  <ExternalLink className="inline h-4 w-4" />
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>Keep Reading</h2>
          <ul>
            {article.related.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <AuthorBio />
    </article>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`));
}
