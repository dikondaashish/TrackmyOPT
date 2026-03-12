# Phase 2: Master Template for `/answers/` Q&A Pages

**Status:** Template Complete  
**Created:** March 12, 2026  
**Usage:** Batch-produce 50 Q&A pages with consistent AEO optimization  
**File Pattern:** `/app/answers/[slug]/page.tsx` (new route)

---

## Directory Structure

```
/app/answers/
├── layout.tsx (shared layout for all answer pages)
├── [[...slug]]/
│   └── page.tsx (dynamic route handler)
├── what-is-opt/
│   └── page.tsx
├── what-is-stem-opt/
│   └── page.tsx
├── how-long-is-opt/
│   └── page.tsx
... (50 total)
```

---

## Shared Layout: `/app/answers/layout.tsx`

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OPT Answers | TrackMyOPT",
  description:
    "Quick answers to your most common OPT, F-1, and STEM OPT questions.",
  openGraph: {
    title: "OPT Answers | TrackMyOPT",
    description:
      "Quick answers to your most common OPT, F-1, and STEM OPT questions.",
    type: "website",
    images: [
      {
        url: "https://www.trackmyopt.com/og-answers.png",
        width: 1200,
        height: 630,
        alt: "TrackMyOPT Answers",
      },
    ],
  },
};

export default function AnswersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
```

---

## Page Template: `/app/answers/[slug]/page.tsx`

```typescript
import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

// Reusable Q&A data structure
interface AnswerPageData {
  slug: string;
  question: string;
  shortAnswer: string; // 2-sentence answer (for AI citation)
  category: "opt-basics" | "stem-opt" | "tax-finance" | "health" | "career" | "h1b";
  relatedBlogPost?: string; // slug of related blog post
  relatedFeaturePage?: string; // url path of related feature
  faqItems: Array<{
    question: string;
    answer: string;
  }>;
  lastUpdated: string; // "2026-03-12"
}

// Data import (to be populated)
const answerData: AnswerPageData = {
  slug: "what-is-opt",
  question: "What is OPT?",
  shortAnswer:
    "OPT (Optional Practical Training) is a 12-month work authorization for F-1 students on their degree field in the United States after graduation. STEM degree holders can extend for an additional 24 months.",
  category: "opt-basics",
  relatedBlogPost: "opt-extension-guide",
  relatedFeaturePage: "/features/case-status",
  faqItems: [
    {
      question: "How long does OPT last?",
      answer: "OPT lasts for 12 months of employment. However, with the STEM extension, you can extend your OPT for an additional 24 months if you meet the requirements.",
    },
    {
      question: "Can I work for any employer on OPT?",
      answer:
        "No. Your work must be related to your degree field. Your employer must also verify your work authorization through E-Verify.",
    },
    {
      question: "Do I need a job offer to apply for OPT?",
      answer:
        "No. You can apply for OPT before securing a job. However, you must start working within 60 days of OPT approval.",
    },
  ],
  lastUpdated: "2026-03-12",
};

// Generate metadata dynamically
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `${answerData.question} | TrackMyOPT Answers`,
    description: answerData.shortAnswer,
    openGraph: {
      title: answerData.question,
      description: answerData.shortAnswer,
      type: "article",
      publishedTime: answerData.lastUpdated,
      authors: ["TrackMyOPT"],
    },
    alternates: {
      canonical: `https://www.trackmyopt.com/answers/${answerData.slug}`,
    },
  };
}

// FAQ Schema (JSON-LD)
function generateFAQSchema(data: AnswerPageData) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: data.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: data.shortAnswer,
        },
      },
      ...data.faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    ],
  };
}

// Article Schema (JSON-LD)
function generateArticleSchema(data: AnswerPageData) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: data.question,
    description: data.shortAnswer,
    datePublished: data.lastUpdated,
    dateModified: data.lastUpdated,
    author: {
      "@type": "Organization",
      name: "TrackMyOPT",
      logo: {
        "@type": "ImageObject",
        url: "https://www.trackmyopt.com/logo.png",
      },
    },
    publisher: {
      "@type": "Organization",
      name: "TrackMyOPT",
      logo: {
        "@type": "ImageObject",
        url: "https://www.trackmyopt.com/logo.png",
      },
    },
    isPartOf: {
      "@type": "WebSite",
      name: "TrackMyOPT",
      url: "https://www.trackmyopt.com",
    },
  };
}

// Speakable Schema (for voice/quick answer extraction by AI)
function generateSpeakableSchema(data: AnswerPageData) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: [".answer-text"],
    },
  };
}

export default function AnswerPage() {
  const faqSchema = generateFAQSchema(answerData);
  const articleSchema = generateArticleSchema(answerData);
  const speakableSchema = generateSpeakableSchema(answerData);

  const categoryColors: Record<string, string> = {
    "opt-basics": "bg-blue-100 text-blue-800",
    "stem-opt": "bg-green-100 text-green-800",
    "tax-finance": "bg-purple-100 text-purple-800",
    health: "bg-red-100 text-red-800",
    career: "bg-orange-100 text-orange-800",
    h1b: "bg-indigo-100 text-indigo-800",
  };

  return (
    <>
      {/* Schema Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }}
      />

      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-600">
        <Link href="/" className="hover:text-blue-600">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/answers" className="hover:text-blue-600">
          Answers
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-900">{answerData.question}</span>
      </nav>

      {/* Category Badge */}
      <div className="mb-4">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${categoryColors[answerData.category]}`}
        >
          {answerData.category.replace("-", " ").toUpperCase()}
        </span>
      </div>

      {/* Main Heading */}
      <h1 className="mb-6 text-4xl font-bold text-gray-900">
        {answerData.question}
      </h1>

      {/* Quick Answer Box (AI-Extract Friendly) */}
      <div className="mb-8 rounded-lg bg-blue-50 p-6 border-l-4 border-blue-500">
        <p className="text-sm font-semibold uppercase text-blue-700 mb-3">
          Quick Answer
        </p>
        <p className="answer-text text-lg text-gray-800 leading-relaxed">
          {answerData.shortAnswer}
        </p>
      </div>

      {/* Detailed Explanation */}
      <div className="mb-12 prose prose-lg max-w-full">
        <p>
          The question above is what AI models cite most frequently. Below, we
          provide more detailed information to help you fully understand this
          topic.
        </p>

        {/* Detailed answer content goes here */}
        <p>
          OPT is a critical work authorization after your F-1 studies end. It
          allows you to gain practical experience in your field and build your
          career in the United States. Many students use their OPT time to
          either find an H-1B sponsoring employer or gain valuable work
          experience before returning home.
        </p>

        <h2>Key Facts About OPT</h2>
        <ul>
          <li>Lasts 12 months of employment (on campus work doesn't count)</li>
          <li>For STEM degree holders, can extend for 24 more months</li>
          <li>Must be related to your degree field</li>
          <li>Must start working within 60 days of approval</li>
          <li>Employer must verify through E-Verify</li>
          <li>Has rules about unemployment days (90 days max)</li>
        </ul>
      </div>

      {/* FAQ Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Common Questions
        </h2>
        <div className="space-y-6">
          {answerData.faqItems.map((item, index) => (
            <details
              key={index}
              className="group border-b border-gray-200 pb-6"
            >
              <summary className="cursor-pointer font-semibold text-gray-900 hover:text-blue-600">
                {item.question}
              </summary>
              <p className="mt-3 text-gray-700">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Related Content Links */}
      <div className="mb-12 rounded-lg bg-gray-50 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Related Resources
        </h3>
        <div className="space-y-3">
          {answerData.relatedBlogPost && (
            <Link
              href={`/blog/${answerData.relatedBlogPost}`}
              className="block text-blue-600 hover:text-blue-700 font-medium"
            >
              → Read our full guide: {answerData.relatedBlogPost}
            </Link>
          )}
          {answerData.relatedFeaturePage && (
            <Link
              href={answerData.relatedFeaturePage}
              className="block text-blue-600 hover:text-blue-700 font-medium"
            >
              → Explore our {answerData.relatedFeaturePage.split("/").pop()}{" "}
              feature
            </Link>
          )}
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-xs text-gray-500">
        Last updated: {new Date(answerData.lastUpdated).toLocaleDateString()}
      </div>

      {/* CTA Section */}
      <div className="mt-12 rounded-lg bg-blue-600 p-8 text-white text-center">
        <h3 className="text-2xl font-bold mb-3">
          Track Your OPT Timeline Automatically
        </h3>
        <p className="mb-6 text-blue-100">
          Stop manually tracking dates. Let TrackMyOPT handle the calculations,
          reminders, and deadlines for you.
        </p>
        <Link
          href="https://app.trackmyopt.com/signup"
          className="inline-block bg-white text-blue-600 font-bold px-8 py-3 rounded-lg hover:bg-blue-50 transition"
        >
          Start Free Now →
        </Link>
      </div>
    </>
  );
}
```

---

## How to Use This Template

### Step 1: Create Answer Data File
Create `/app/answers/data.ts` to centralize all 50 Q&A definitions:

```typescript
// /app/answers/data.ts
export const answers: Record<string, AnswerPageData> = {
  "what-is-opt": {
    slug: "what-is-opt",
    question: "What is OPT?",
    shortAnswer: "OPT (Optional Practical Training) is...",
    category: "opt-basics",
    // ... rest of data
  },
  "what-is-stem-opt": {
    // ... another answer
  },
  // ... 48 more
};
```

### Step 2: Modify Dynamic Route
Update the page.tsx to read from the data file:

```typescript
import { answers } from "../data";

export async function generateStaticParams() {
  return Object.keys(answers).map((slug) => ({ slug }));
}

export default function AnswerPage({ params }: { params: { slug: string } }) {
  const answerData = answers[params.slug];
  // ... rest of component
}
```

### Step 3: Batch Create All 50 Pages
Use this script to generate all files:

```bash
# Create the route
mkdir -p apps/web/app/answers/
touch apps/web/app/answers/layout.tsx

# Data file
touch apps/web/app/answers/data.ts

# Dynamic route
mkdir -p apps/web/app/answers/\[slug\]
touch apps/web/app/answers/\[slug\]/page.tsx
```

---

## Key AEO Optimizations Baked Into Template

✅ **2-sentence "Quick Answer" at top** — AI models extract this directly  
✅ **FAQ Schema (mainEntity)** — Signals to Google this is a Q&A page  
✅ **Article Schema** — Establishes authorship, publication date  
✅ **Speakable Schema** — For voice assistant extraction  
✅ **Category badges** — Helps AI understand topic area  
✅ **"answer-text" CSS class** — Speeds AI extraction (Speakable selector)  
✅ **Related blog links** — Cross-links drive authority  
✅ **Related feature links** — Drives product discovery + conversions  
✅ **Last updated date** — Signals freshness to AI models  
✅ **Breadcrumb nav** — Helps search engines understand site structure  
✅ **CTA at bottom** — Converts curious visitors to users  

---

## Customization Per Answer

For each of 50 answers, you only need to change:

```typescript
const answerData: AnswerPageData = {
  slug: "YOUR_SLUG_HERE",
  question: "YOUR_QUESTION_HERE?",
  shortAnswer: "TWO_SENTENCE_ANSWER_HERE",
  category: "opt-basics" | "stem-opt" | "tax-finance" | "health" | "career" | "h1b",
  relatedBlogPost: "related-blog-slug-or-undefined",
  relatedFeaturePage: "/features/case-status-or-undefined",
  faqItems: [
    { question: "Sub-Q1?", answer: "Answer to sub-Q1." },
    { question: "Sub-Q2?", answer: "Answer to sub-Q2." },
  ],
  lastUpdated: "2026-03-12",
};
```

Everything else stays the same. Copy, paste, fill in, ship.

---

## Estimated Production Time

- **Template creation:** Done ✅
- **Data entry (50 answers × 5 min):** ~4 hours
- **Schema validation:** 30 min
- **Testing/QA:** 1 hour
- **Total:** ~5.5 hours to create all 50 pages
- **Deployed:** Ready for Days 36–40 of Phase 2

---

## Next Steps

1. Create `/app/answers/layout.tsx` and `/app/answers/data.ts`
2. Create dynamic route `/app/answers/[slug]/page.tsx`
3. Populate `data.ts` with 50 Q&A definitions (use Phase 2 Plan +  "Quotable vs Not" doc)
4. Test schema validation in Google Rich Results Test
5. Deploy and index (submit to Google Search Console)
