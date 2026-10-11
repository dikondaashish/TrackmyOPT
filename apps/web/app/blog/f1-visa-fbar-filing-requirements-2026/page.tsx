import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { AuthorBio } from '@/components/blog/AuthorBio';
import { BlogPostSchema } from '@/components/blog/BlogPostSchema';
import { BreadcrumbSchema } from '@/components/BreadcrumbSchema';
import {
  AccountsAndForms,
  NextSteps,
  ResidencyBasics,
  ResidencyExamples,
} from './content';
import styles from './guide.module.css';
import { faqItems, source } from './data';

const canonical =
  'https://www.trackmyopt.com/blog/f1-visa-fbar-filing-requirements-2026';
const imageUrl = 'https://www.trackmyopt.com/blog/fbar-2026/cover.png';
const title = 'F1 Visa FBAR Filing Requirements: OPT & STEM OPT (2026)';
const description =
  'Understand F1 visa FBAR filing requirements with five student examples, OPT timelines, the $10,000 account threshold and filing deadlines. Explore the guide.';

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'F1 visa FBAR filing requirements',
    'FBAR for OPT students',
    'STEM OPT FBAR filing',
    'F1 visa foreign bank account reporting',
    'FBAR five year rule',
    'international students FBAR',
    'nonresident alien FBAR',
  ],
  alternates: { canonical },
  openGraph: {
    title,
    description,
    url: canonical,
    type: 'article',
    publishedTime: '2026-10-11',
    modifiedTime: '2026-10-11',
    images: [
      {
        url: imageUrl,
        width: 1536,
        height: 1024,
        alt: 'Arjun and Priya compare F-1 arrival years, foreign balances and conditional FBAR obligations.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [imageUrl],
  },
};

const sections = [
  ['what-is-fbar', 'What is FBAR, and why does it exist?'],
  ['f1-students', 'Do F-1 students need to file FBAR?'],
  ['opt-stem-opt', 'Are OPT and STEM OPT students required to file?'],
  ['five-calendar-years', 'What is the five-calendar-year rule?'],
  ['nonresident-alien', 'What does “nonresident alien” mean?'],
  ['substantial-presence', 'How does the substantial presence test work?'],
  ['after-five-years', 'What happens after five calendar years?'],
  ['h1b-transition', 'Does switching to H-1B change the requirements?'],
  ['foreign-accounts', 'Which foreign accounts are reportable?'],
  ['account-threshold', 'How is the $10,000 threshold calculated?'],
  ['forms-compared', 'FBAR vs. Forms 8843, 1040-NR and 8938'],
  ['how-to-file', 'How do students file an FBAR?'],
  ['deadlines', 'What are the filing deadlines?'],
  ['mistakes', 'What mistakes should students avoid?'],
  ['professional-review', 'When should you consult a tax professional?'],
  ['faq', 'Frequently asked questions'],
  ['checklist', 'Your next-step checklist'],
];

export default function FbarGuidePage() {
  return (
    <article className={styles.guide}>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://www.trackmyopt.com' },
          { name: 'Blog', url: 'https://www.trackmyopt.com/blog' },
          { name: 'F-1 student FBAR guide', url: canonical },
        ]}
      />
      <BlogPostSchema
        title={title}
        description={description}
        publishedDate="2026-10-11"
        modifiedDate="2026-10-11"
        canonicalUrl={canonical}
        imageUrl={imageUrl}
        faqItems={faqItems}
      />
      <nav aria-label="Breadcrumb">
        <Link href="/blog">Blog</Link> / Tax &amp; Finance
      </nav>
      <header>
        <p className={styles.eyebrow}>
          The international student’s visual tax guide · 2026
        </p>
        <h1>Do F-1 Students on OPT or STEM OPT Need to File an FBAR?</h1>
        <p className={styles.intro}>
          Your friend has $18,000 back home and does not need FBAR. You have
          $10,500 across three accounts and might need it. The difference starts
          with residency, not your salary or EAD card.
        </p>
        <p className={styles.meta}>
          Published and rules checked: October 11, 2026 · About 16 minutes ·
          Fictional student examples
        </p>
        <AuthorBio compact />
      </header>
      <div className={styles.quickAnswer}>
        <h2>Quick answer: F1 visa FBAR filing requirements</h2>
        <p>
          Many qualifying F-1, OPT and STEM OPT students generally do{' '}
          <strong>not</strong> need a personal FBAR while they remain
          nonresident aliens for FBAR purposes. A U.S. person generally must
          file if they have a financial interest in, or signature authority
          over, foreign financial accounts whose aggregate value exceeds{' '}
          <strong>$10,000</strong> during the calendar year, unless a specific
          exception applies. <a href={source.fbar}>FinCEN’s filing rule</a>.
        </p>
        <p>
          The first five qualifying calendar years usually allow student days to
          be excluded from the substantial presence test. This is a residency
          rule, not a blanket F-1 exemption from account reporting or taxes.{' '}
          <a href={source.student}>IRS student rule</a>.
        </p>
      </div>
      <figure className={styles.cover}>
        <Image
          src="/blog/fbar-2026/cover.png"
          alt="Fictional comparison: Arjun arrived in 2023 and generally has no FBAR while nonresident; Priya arrived in 2020 and must reassess residency from 2025. Both hold more than $10,000 abroad."
          width={1536}
          height={1024}
          sizes="(max-width: 1080px) 100vw, 1040px"
          preload
        />
        <figcaption>
          This guide is for international students and graduates with foreign
          accounts. Compare the stories, then follow the decision path. These
          are illustrations, not personal filing determinations.
        </figcaption>
      </figure>
      <nav className={styles.toc} aria-label="Table of contents">
        <h2>Find your question</h2>
        <ol>
          {sections.map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`}>{label}</a>
            </li>
          ))}
        </ol>
      </nav>
      <div className={styles.body}>
        <ResidencyBasics />
        <ResidencyExamples />
        <AccountsAndForms />
        <NextSteps />
      </div>
    </article>
  );
}
