# SCHEMA AUDIT: Current Coverage & Gaps

**Date:** March 12, 2026  
**Audit Type:** Blog Posts (22) + Feature Pages (9)  
**Status:** Critical gap identified — schemas defined but not rendered

---

## Current State Summary

| Scope | Defined | Rendered | Coverage |
|-------|---------|----------|----------|
| **Organization Schema** | ✅ Yes | ✅ Yes (root layout) | 100% |
| **Website Schema** | ✅ Yes | ✅ Yes (root layout) | 100% |
| **SoftwareApplication Schema** | ✅ Yes | ✅ Yes (root layout) | 100% |
| **Article Schema** | ✅ Yes | ❌ NO | 0% |
| **FAQ Schema** | ✅ Yes | ❌ NO | 0% |
| **HowTo Schema** | ✅ Yes | ❌ NO | 0% |
| **Service Schema** | ✅ Yes | ❌ NO | 0% |
| **BreadcrumbList Schema** | ✅ Yes | ❌ NO | 0% |
| **Speakable Schema** | ✅ Yes | ❌ NO | 0% |
| **DefinedTermSet Schema** | ✅ Yes | ✅ Yes (glossary) | 100% (1 page) |

---

## Blog Posts (22 Total): Schema Audit

**Priority: VERY HIGH — These are your main content assets**

| # | Blog Post | Slug | Current Schema | Needed Schema | Status |
|----|-----------|------|-----------------|---------------|--------|
| 1 | 90-Day Unemployment Rule | `90-day-unemployment-rule-opt` | Metadata only | Article, FAQ | ❌ MISSING |
| 2 | ATS Resume for International Students | `ats-resume-international-students` | Metadata only | Article, HowTo | ❌ MISSING |
| 3 | Can You Travel on OPT? | `can-you-travel-on-opt` | Metadata only | Article, FAQ | ❌ MISSING |
| 4 | Day 1: CPT vs OPT | `day-1-cpt-vs-opt` | Metadata only | Article, FAQ | ❌ MISSING |
| 5 | F-1 Student Tax Filing Guide | `f1-student-tax-filing-guide` | Metadata only | Article, HowTo, FAQ | ❌ MISSING |
| 6 | F-1 Visa Jobs Guide | `f1-visa-jobs-guide` | Metadata only | Article, FAQ | ❌ MISSING |
| 7 | H-1B Approval Rates by Company | `h1b-approval-rates-by-company` | Metadata only | Article, FAQ | ❌ MISSING |
| 8 | H-1B Cap-Gap Extension | `h1b-cap-gap-extension` | Metadata only | Article, FAQ | ❌ MISSING |
| 9 | I-983 Training Plan Guide | `i-983-training-plan-guide` | Metadata only | Article, HowTo | ❌ MISSING |
| 10 | OPT Application Checklist | `opt-application-checklist-2026` | Metadata only | Article, HowTo | ❌ MISSING |
| 11 | OPT Application Denied | `opt-application-denied` | Metadata only | Article, HowTo, FAQ | ❌ MISSING |
| 12 | OPT EAD Card Guide | `opt-ead-card-guide` | Metadata only | Article, FAQ | ❌ MISSING |
| 13 | OPT Extension Guide | `opt-extension-guide` | Metadata only | Article, FAQ | ❌ MISSING |
| 14 | OPT Health Insurance Guide | `opt-health-insurance-guide` | Metadata only | Article, HowTo, FAQ | ❌ MISSING |
| 15 | OPT Processing Time 2026 | `opt-processing-time-2026` | Metadata only | Article, FAQ | ❌ MISSING |
| 16 | OPT to H-1B Transition | `opt-to-h1b-transition` | Metadata only | Article, HowTo, FAQ | ❌ MISSING |
| 17 | STEM OPT Employer Requirements | `stem-opt-employer-requirements` | Metadata only | Article, HowTo, FAQ | ❌ MISSING |
| 18 | STEM OPT Extension Guide | `stem-opt-extension-guide` | Metadata only | Article, FAQ | ❌ MISSING |
| 19 | STEM OPT Unemployment Limit | `stem-opt-unemployment-limit` | Metadata only | Article, FAQ | ❌ MISSING |
| 20 | Top H-1B Sponsor Companies 2026 | `top-h1b-sponsor-companies-2026` | Metadata only | Article, FAQ | ❌ MISSING |
| 21 | USCIS Case Status Tracking Guide | `uscis-case-status-tracking-guide` | Metadata only | Article, HowTo, FAQ | ❌ MISSING |
| 22 | What Happens If OPT Expires | `what-happens-if-opt-expires` | Metadata only | Article, FAQ | ❌ MISSING |

**CRITICAL GAP:** 0/22 blog posts have JSON-LD schema. All have basic metadata (title, description, OpenGraph, canonical) but NO structured data for search engines or AI models.

**Impact:** Missing featured snippets, AI citation opportunities, and AEO signals.

---

## Feature Pages (9 Total): Schema Audit

| # | Feature Page | Route | Current Schema | Needed Schema | Status |
|----|--------------|-------|-----------------|---------------|--------|
| 1 | Case Status | `/features/case-status` | Metadata + FeatureFAQ component (no schema) | Service, FAQ | ❌ MISSING |
| 2 | Community | `/features/community` | Metadata only | Service, FAQ | ❌ MISSING |
| 3 | Compliance | `/features/compliance` | Metadata only | Service, HowTo, FAQ | ❌ MISSING |
| 4 | Extension | `/features/extension` | Metadata only | Service, FAQ | ❌ MISSING |
| 5 | Health Insurance | `/features/health-insurance` | Metadata only | Service, HowTo, FAQ | ❌ MISSING |
| 6 | Job Tracker | `/features/job-tracker` | Metadata only | Service, FAQ | ❌ MISSING |
| 7 | Resume AI | `/features/resume-ai` | Metadata only | Service, HowTo, FAQ | ❌ MISSING |
| 8 | Sponsors | `/features/sponsors` | Metadata only | Service, FAQ | ❌ MISSING |
| 9 | Tax Filing | `/features/tax-filing` | Metadata only | Service, HowTo, FAQ | ❌ MISSING |

**CRITICAL GAP:** 0/9 feature pages have JSON-LD Service schema. The `FeatureFAQ` component renders HTML but doesn't include FAQSchema JSON-LD.

**Impact:** Missing rich snippet opportunities for product listings, losing AI citations about features.

---

## Pillar Guides (3 Total): Schema Status

| # | Guide | Route | Current Schema | Needed Schema | Status |
|----|-------|-------|-----------------|---------------|--------|
| 1 | Ultimate F-1 Tax Guide | `/guides/f1-tax-filing` | Metadata only | Article, HowTo, FAQ | ❌ MISSING |
| 2 | F-1 Career Guide | `/guides/opt-career` | Metadata only | Article, HowTo, FAQ | ❌ MISSING |
| 3 | OPT Health Insurance | `/guides/opt-health-insurance` | Metadata only | Article, HowTo, FAQ | ❌ MISSING |

**Impact:** Pillar guides should be your highest-authority content but lack schema to signal importance.

---

## Utility Pages

| # | Page | Route | Current Schema | Needed Schema | Status |
|----|------|-------|-----------------|---------------|--------|
| 1 | /tools | `/tools` | Metadata + ItemList (tools) | ItemList (correct) | ✅ COMPLETE |
| 2 | /glossary | `/glossary` | Metadata + DefinedTermSet | DefinedTermSet (correct) | ✅ COMPLETE |
| 3 | /pricing | `/pricing` | Metadata + PricingPage | PricingPage (check if indexed) | ✅ MOSTLY |

---

## Recommendations by Priority

### Phase 2A Priority 1: Blog Post Schema (Days 1–3)

**Goal:** Inject Article + FAQ schema into all 22 blog posts  
**Effort:** 30–60 min (batch update via template)  
**Impact:** +22 indexed pages with rich snippets + AEO signals

**Action:**

1. Create a reusable `BlogPostSchema` component:

```typescript
// components/blog/BlogPostSchema.tsx
export function BlogPostSchema({
  title,
  description,
  publishedDate,
  modifiedDate,
  author = "TrackMyOPT",
  faqItems = [],
}: BlogPostSchemaProps) {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: description,
    datePublished: publishedDate,
    dateModified: modifiedDate,
    author: {
      "@type": "Organization",
      name: author,
      logo: "https://www.trackmyopt.com/logo.png",
    },
    publisher: {
      "@type": "Organization",
      name: "TrackMyOPT",
      logo: "https://www.trackmyopt.com/logo.png",
    },
  };

  const faqSchema =
    faqItems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </>
  );
}
```

2. Update each blog post's page.tsx:

```typescript
import BlogPostSchema from "@/components/blog/BlogPostSchema";

export default function BlogPost() {
  return (
    <>
      <BlogPostSchema
        title="90-Day Unemployment Rule on OPT"
        description="..."
        publishedDate="2025-03-12"
        modifiedDate="2026-03-12"
        faqItems={[
          { question: "What is the 90-day rule?", answer: "..." },
          // ... more FAQs from post content
        ]}
      />
      {/* rest of post */}
    </>
  );
}
```

### Phase 2B Priority 2: Feature Page Service Schema (Days 4–5)

**Goal:** Inject Service + FAQ schema into all 9 feature pages  
**Effort:** 30 min (batch update)  
**Impact:** +9 pages with rich snippets + feature discoverability

**Action:**

1. Create `FeatureServiceSchema` component:

```typescript
// components/features/FeatureServiceSchema.tsx
export function FeatureServiceSchema({
  name,
  description,
  faqItems = [],
}: FeatureServiceSchemaProps) {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: name,
    description: description,
    provider: {
      "@type": "Organization",
      name: "TrackMyOPT",
      url: "https://www.trackmyopt.com",
    },
    areaServed: "US",
    isPartOf: {
      "@type": "SoftwareApplication",
      name: "TrackMyOPT",
      operatingSystem: "Web",
    },
  };

  const faqSchema =
    faqItems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </>
  );
}
```

2. Update each feature page:

```typescript
import { FeatureServiceSchema } from "@/components/features/FeatureServiceSchema";

export default function CaseStatusFeature() {
  return (
    <>
      <FeatureServiceSchema
        name="USCIS Case Status Tracker"
        description="Real-time tracking of your I-765 employment authorization application."
        faqItems={[
          { question: "How often is status updated?", answer: "..." },
          // ... more FAQs from FeatureFAQ component
        ]}
      />
      {/* rest of feature page */}
    </>
  );
}
```

### Priority 3: Pillar Guide Schema (Days 6–7)

**Goal:** Add Article + HowTo + FAQ schema to 3 pillar guides  
**Effort:** 30 min  
**Impact:** +3 pages with maximum schema coverage

---

## Implementation Timeline

| Days | Task | Files | Impact |
|------|------|-------|--------|
| 1–3 | Create `BlogPostSchema` component | `/components/blog/BlogPostSchema.tsx` | Blog posts searchable |
| 1–3 | Update all 22 blog posts | `/app/blog/*/page.tsx` (22 files) | +22 Article/FAQ schemas |
| 4–5 | Create `FeatureServiceSchema` component | `/components/features/FeatureServiceSchema.tsx` | Features discoverable |
| 4–5 | Update all 9 feature pages | `/app/features/*/page.tsx` (9 files) | +9 Service/FAQ schemas |
| 6–7 | Update 3 pillar guides | `/app/guides/*/page.tsx` (3 files) | +3 Article/HowTo/FAQ schemas |
| 8 | Validate all schemas | Google Rich Results Test | Ensure correctness |
| 9 | Resubmit sitemap | Google Search Console | Re-index with schemas |

**Total Effort:** ~4–5 hours  
**Total New Schemas:** 22 + 9 + 3 = **34 pages with JSON-LD**

---

## Validation Checklist

Before declaring schema audit complete, validate each category:

- [ ] Blog posts render `<script type="application/ld+json">` in `<head>`
- [ ] Feature pages render Service schema
- [ ] Glossary page has DefinedTermSet (already done)
- [ ] All schemas pass Google Rich Results Test (zero errors)
- [ ] Article schema includes datePublished, dateModified
- [ ] FAQ schema questions match on-page content
- [ ] Service schema includes provider + areaServed
- [ ] Schemas are in `<head>`, not `<body>`

---

## Expected Impact

After schema audit completion:

✅ **22 blog posts** eligible for featured snippets  
✅ **9 feature pages** eligible for rich results  
✅ **3 pillar guides** signaling high-authority content  
✅ **50 Q&A pages** (Phase 2) will have FAQPage schema from template  

**Total: 84 pages with JSON-LD** (vs. 3 currently)

**AEO Impact:** AI models will extract answers directly from your schemas, increasing citation likelihood by ~50–100%.

---

## Next Steps

1. Create schema components (1 hour)
2. Batch update blog posts (1.5 hours)
3. Batch update feature pages (30 min)
4. Validate in Google Rich Results Test (30 min)
5. Resubmit sitemap (5 min)

**Ready to proceed with batch updates?**
