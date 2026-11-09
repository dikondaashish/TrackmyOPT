import Link from 'next/link';
import { topicLabel } from '@/data/blog-categories';
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import {
  AUTOMATED_BYLINE,
  AuthorBio,
  AutomatedNewsByline,
} from '@/components/blog/AuthorBio';
import { BlogPostSchema } from '@/components/blog/BlogPostSchema';
import { BlogProductCTA } from '@/components/blog/BlogProductCTA';
import { BreadcrumbSchema } from '@/components/BreadcrumbSchema';
import type {
  ArticleTable,
  ResearchArticle,
} from '@/data/blog-series/types';
import { AdSenseInArticle } from '@/components/blog/AdSenseInArticle';
import { BlogFlowFigure } from '@/components/blog/BlogFlowFigure';
import { BlogPostImage } from '@/components/blog/BlogPostImage';
import styles from './ResearchArticlePage.module.css';

const SITE = 'https://www.trackmyopt.com';
const DEFAULT_IMAGE = '/blog/international-student-guidance-library-2026.png';

// Page chrome around the article body, per article language.
const LABELS = {
  en: {
    badge: 'Verified 2026 Guide',
    published: 'Published',
    updated: 'Updated',
    reviewed: 'Reviewed against primary government sources',
    caption:
      'A practical TrackMyOPT guide: confirm the rule, document your dates, and act before the deadline.',
    statusNote: 'Publication-status note',
    directAnswer: 'Direct answer',
    contents: 'In this guide',
    first: 'What You Should Know First',
    sources: 'Sources:',
    note: 'Vinay\u2019s practical note',
    checklist: 'Your Action Checklist',
    mistakes: 'Common Mistakes to Avoid',
    faq: 'Frequently Asked Questions',
    officialSources: 'Official Sources',
    officialIntro:
      'Rules can change. We checked this guide against the primary sources below; always open the current form instructions or agency page before acting.',
    keepReading: 'Keep Reading',
    locale: 'en-US',
  },
  es: {
    badge: 'Gu\u00eda verificada 2026',
    published: 'Publicado el',
    updated: 'Actualizado el',
    reviewed: 'Revisado con fuentes oficiales del gobierno de EE. UU.',
    caption:
      'Gu\u00eda pr\u00e1ctica de TrackMyOPT: confirma la regla, anota tus fechas y act\u00faa antes del plazo.',
    statusNote: 'Nota sobre el estado de publicaci\u00f3n',
    directAnswer: 'Respuesta directa',
    contents: 'En esta gu\u00eda',
    first: 'Lo que debes saber primero',
    sources: 'Fuentes:',
    note: 'Nota pr\u00e1ctica de Vinay',
    checklist: 'Tu lista de acci\u00f3n',
    mistakes: 'Errores comunes que debes evitar',
    faq: 'Preguntas frecuentes',
    officialSources: 'Fuentes oficiales',
    officialIntro:
      'Las reglas cambian. Revisamos esta gu\u00eda con las fuentes oficiales de abajo; abre siempre la p\u00e1gina oficial vigente antes de actuar.',
    keepReading: 'Sigue leyendo',
    locale: 'es-US',
  },
  ko: {
    badge: '2026 \uac80\uc99d \uac00\uc774\ub4dc',
    published: '\uac8c\uc2dc\uc77c',
    updated: '\uc5c5\ub370\uc774\ud2b8',
    reviewed: '\ubbf8\uad6d \uc815\ubd80 \uacf5\uc2dd \uc790\ub8cc\ub85c \uac80\ud1a0',
    caption:
      'TrackMyOPT \uc2e4\uc6a9 \uac00\uc774\ub4dc: \uaddc\uc815\uc744 \ud655\uc778\ud558\uace0, \ub0a0\uc9dc\ub97c \uae30\ub85d\ud558\uace0, \uae30\ud55c \uc804\uc5d0 \uc900\ube44\ud558\uc138\uc694.',
    statusNote: '\uac8c\uc2dc \uc0c1\ud0dc \uc548\ub0b4',
    directAnswer: '\ud575\uc2ec \ub2f5\ubcc0',
    contents: '\uc774 \uac00\uc774\ub4dc\uc758 \ub0b4\uc6a9',
    first: '\uba3c\uc800 \uc54c\uc544\uc57c \ud560 \uac83',
    sources: '\ucd9c\ucc98:',
    note: 'Vinay\uc758 \uc2e4\uc6a9 \ud301',
    checklist: '\uc2e4\ucc9c \uccb4\ud06c\ub9ac\uc2a4\ud2b8',
    mistakes: '\ud53c\ud574\uc57c \ud560 \ud754\ud55c \uc2e4\uc218',
    faq: '\uc790\uc8fc \ubb3b\ub294 \uc9c8\ubb38',
    officialSources: '\uacf5\uc2dd \ucd9c\ucc98',
    officialIntro:
      '\uaddc\uc815\uc740 \ubc14\ub01c \uc218 \uc788\uc2b5\ub2c8\ub2e4. \uc544\ub798 \uacf5\uc2dd \ucd9c\ucc98\ub85c \uc774 \uac00\uc774\ub4dc\ub97c \uac80\ud1a0\ud588\uc2b5\ub2c8\ub2e4. \ud589\ub3d9\ud558\uae30 \uc804\uc5d0 \ud56d\uc0c1 \ucd5c\uc2e0 \uacf5\uc2dd \ud398\uc774\uc9c0\ub97c \ud655\uc778\ud558\uc138\uc694.',
    keepReading: '\ub354 \uc77d\uc5b4\ubcf4\uae30',
    locale: 'ko-KR',
  },
} as const;

export function ResearchArticlePage({ article }: { article: ResearchArticle }) {
  const canonical = `${SITE}/blog/${article.slug}`;
  const image = article.image ?? DEFAULT_IMAGE;
  const imageUrl = image.startsWith('http') ? image : `${SITE}${image}`;
  const automated = article.byline === 'automated';
  const lang = article.lang ?? 'en';
  const t = LABELS[lang];

  return (
    <article
      lang={lang}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
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
        author={automated ? AUTOMATED_BYLINE : 'Vinay Kumar'}
        authorType={automated ? 'organization' : 'person'}
        canonicalUrl={canonical}
        imageUrl={imageUrl}
        faqItems={article.faq}
      />

      <header className="mb-10 border-b border-border pb-8">
        <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-4">
          <span className="font-medium text-primary">{topicLabel(article)}</span>
          <span aria-hidden>·</span>
          <span>{article.badgeLabel ?? t.badge}</span>
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-6">
          {article.title}
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          {article.description}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>{article.readTime}</span>
          <span aria-hidden>•</span>
          <span>
            {t.published} {formatDate(article.publishedDate, t.locale)}
          </span>
          {article.modifiedDate !== article.publishedDate && (
            <>
              <span aria-hidden>•</span>
              <span>
                {t.updated} {formatDate(article.modifiedDate, t.locale)}
              </span>
            </>
          )}
          <span aria-hidden>•</span>
          <span>
            {article.reviewLabel ?? t.reviewed}
          </span>
        </div>
      </header>

      <figure className="mb-10">
        <div className="relative aspect-[1200/630] overflow-hidden rounded-xl border border-border bg-muted shadow-card">
          <BlogPostImage
            src={image}
            alt={
              article.imageAlt ??
              `International student reviewing documents for ${article.title}`
            }
            preload
            sizes="(min-width: 768px) 896px, 100vw"
            className="object-cover"
          />
        </div>
        <figcaption className="mt-3 text-center text-sm text-muted-foreground">
          {article.imageCaption ?? t.caption}
        </figcaption>
      </figure>

      {article.statusNote && (
        <div className="mb-8 rounded-r-xl border-l-4 border-l-amber-500 bg-amber-50 p-5 text-amber-950 dark:bg-amber-950 dark:text-amber-100">
          <p className="font-bold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" /> {t.statusNote}
          </p>
          <p className="mt-2 mb-0">{article.statusNote}</p>
        </div>
      )}

      <div className="mb-10 rounded-xl border border-primary-muted bg-primary-soft p-6">
        <p className="mb-2 text-sm font-semibold text-primary">
          {t.directAnswer}
        </p>
        <p className="mb-0 text-lg font-medium leading-relaxed text-foreground">
          {article.directAnswer}
        </p>
      </div>

      <AdSenseInArticle />

      {article.showContents && (
        <nav
          aria-label={t.contents}
          className="mb-10 rounded-xl border border-border bg-surface p-5 sm:p-6"
        >
          <p className="mb-3 font-bold text-foreground">{t.contents}</p>
          <ol className="grid gap-2 text-sm sm:grid-cols-2">
            {article.sections.map((section, index) => (
              <li key={section.heading}>
                <a
                  href={`#section-${index + 1}`}
                  className="text-blue-700 hover:underline dark:text-blue-300"
                >
                  {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div
        className={`${styles.reading} prose prose-lg dark:prose-invert max-w-none`}
      >
        <section className="rounded-xl border border-primary-muted bg-primary-soft p-6 sm:p-7">
          <h2>{t.first}</h2>
          <ul>
            {article.keyTakeaways.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        {article.sections.map((section, index) => (
          <section
            id={`section-${index + 1}`}
            className="scroll-mt-40"
            key={section.heading}
          >
            {section.anchors?.map((anchor) => (
              <span
                id={anchor}
                key={anchor}
                className="block scroll-mt-40"
                aria-hidden
              />
            ))}
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.figure && (
              <figure className="not-prose my-7">
                <div
                  className="relative overflow-hidden rounded-xl border border-border bg-white"
                  style={{ aspectRatio: `${section.figure.width} / ${section.figure.height}` }}
                >
                  <BlogPostImage
                    src={section.figure.src}
                    alt={section.figure.alt}
                    sizes="(min-width: 768px) 832px, 100vw"
                    className="object-contain"
                  />
                </div>
                <figcaption className="mt-2 text-center text-sm text-muted-foreground">
                  {section.figure.caption}
                </figcaption>
              </figure>
            )}
            {section.table && <ArticleDataTable table={section.table} />}
            {section.sources && (
              <p className="text-sm">
                {t.sources}{' '}
                {section.sources.map((source, sourceIndex) => (
                  // Two sources can share a URL (different eCFR paragraphs).
                  <span key={`${source.url}-${source.label}`}>
                    {sourceIndex > 0 && '; '}
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {source.label}
                    </a>
                  </span>
                ))}
              </p>
            )}
            {section.links && (
              <ul>
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            )}
            {section.visual && <BlogFlowFigure visual={section.visual} />}
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
              <div className="not-prose my-7 rounded-r-xl border-l-4 border-l-emerald-600 bg-emerald-50 p-5 dark:bg-emerald-950">
                <p className="mb-2 font-bold text-emerald-900 dark:text-emerald-100">
                  {t.note}
                </p>
                <p className="mb-0 leading-relaxed text-gray-800 dark:text-gray-200">
                  {section.note}
                </p>
              </div>
            )}
          </section>
        ))}

        <section id="checklist">
          <h2>{t.checklist}</h2>
          <div className="not-prose grid gap-3">
            {article.checklist.map((item) => (
              <div
                className="flex gap-3 rounded-lg border border-border bg-card p-4 shadow-card"
                key={item}
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm leading-relaxed text-foreground">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2>{t.mistakes}</h2>
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

      <div
        className={`${styles.reading} prose prose-lg dark:prose-invert max-w-none`}
      >
        {article.category.includes('Tax') && (
          <aside className="rounded-r-xl border-l-4 border-l-amber-500 bg-amber-50 p-6 text-sm text-amber-950 dark:bg-amber-950 dark:text-amber-100">
            <strong>Tax disclaimer:</strong> This educational guide is not tax,
            legal, or accounting advice. Tax residency, treaty eligibility, and
            filing obligations depend on individual facts. Verify the current
            IRS and state instructions or consult a qualified international-tax
            professional.
          </aside>
        )}
        {article.dataNote && (
          <section className="rounded-xl border border-violet-200 bg-violet-50 p-6 dark:border-violet-800 dark:bg-violet-950">
            <h2 className="mt-0">
              Data and methodology note
            </h2>
            <p className="mb-0">{article.dataNote}</p>
          </section>
        )}

        <section id="faq">
          <h2>{t.faq}</h2>
          {article.faq.map((item) => (
            <div className="border-t border-border pt-1 mb-5 first-of-type:border-t-0" key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </div>
          ))}
        </section>

        <section>
          <h2>{t.officialSources}</h2>
          <p>{t.officialIntro}</p>
          <ul>
            {article.sources.map((source) => (
              <li key={`${source.url}-${source.label}`}>
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  {source.label} — {source.publisher}{' '}
                  <ExternalLink className="inline h-4 w-4" />
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>{t.keepReading}</h2>
          <ul>
            {article.related.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {automated ? <AutomatedNewsByline /> : <AuthorBio />}
    </article>
  );
}

function ArticleDataTable({ table }: { table: ArticleTable }) {
  return (
    <div className="not-prose my-6 overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[480px] border-collapse text-sm">
        {table.caption && (
          <caption className="bg-surface px-4 py-2 text-left text-xs font-semibold text-muted-foreground">
            {table.caption}
          </caption>
        )}
        <thead>
          <tr className="bg-primary-soft text-left">
            {table.columns.map((column) => (
              <th
                key={column}
                scope="col"
                className="px-3 py-2 font-semibold text-foreground"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr
              key={row.join('|')}
              className="border-t border-border even:bg-surface"
            >
              {row.map((cell, index) => (
                <td
                  key={`${index}-${cell}`}
                  className={
                    index === 0
                      ? 'px-3 py-2 font-medium text-foreground'
                      : 'px-3 py-2 text-foreground tabular-nums'
                  }
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`));
}
