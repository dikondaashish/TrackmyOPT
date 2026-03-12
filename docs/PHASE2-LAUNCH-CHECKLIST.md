# Phase 2 Launch Checklist: Complete Setup Guide

**Date:** March 12, 2026  
**Status:** All 5 tasks completed → Ready to launch Phase 2  
**Owner:** TrackMyOPT Growth Team

---

## ✅ All 5 Tasks Completed

### 1. AI Citation Baseline Document ✅
**File:** `/docs/PHASE2-AI-CITATION-BASELINE.md`  
**What it does:** Tracks which AI models (ChatGPT, Perplexity, Gemini) cite TrackMyOPT for 30 common OPT queries

**Key sections:**
- 30 baseline queries organized by tier (OPT basics, STEM OPT, tax/finance, career/H-1B, edge cases)
- Template for recording today's baseline (Day 0)
- Re-check templates for Day 60 and Day 100
- How to interpret results

**Your action this week:**
- [ ] Fill in all 30 queries across ChatGPT, Perplexity, Gemini
- [ ] Record baseline (0% cited assumption)
- [ ] Save results with date

**Impact:** You'll know exactly which queries to prioritize for Phase 2 content

---

### 2. Phase 2 Master Template ✅
**File:** `/docs/PHASE2-MASTER-QA-TEMPLATE.md`  
**What it does:** Reusable template for creating 50 Q&A pages with AEO optimization baked in

**Key sections:**
- Complete Next.js template (layout.tsx + [slug]/page.tsx)
- 3 JSON-LD schemas (FAQPage, Article, Speakable)
- Component structure with "Quick Answer" box optimized for AI extraction
- Category system (opt-basics, stem-opt, tax-finance, health, career, h1b)
- Related links system (connects Q&A back to blog posts + features)
- CTA button at bottom

**How to use:**
1. Create 50 question definitions in `/app/answers/data.ts`
2. Dynamic route pulls data and renders identical schema/layout
3. Copy-paste workflow: Change question + answer + category + links, done

**Implementation time:** ~5 hours for all 50 pages  
**Estimated Days:** 36–40 of Phase 2 (one week)

**Your action:**
- [ ] Populate `/app/answers/data.ts` with 50 questions from "Quotable vs Not" doc
- [ ] Test one page end-to-end
- [ ] Validate schema in Google Rich Results Test
- [ ] Deploy batch

**Impact:** +50 pages that AI models can easily cite, with consistent structure

---

### 3. Schema Audit Document ✅
**File:** `/docs/PHASE2-SCHEMA-AUDIT.md`  
**What it does:** Identifies where schema markup is missing, provides implementation roadmap

**Critical finding:**
- **Organization, Website, SoftwareApplication schemas:** ✅ Deployed (root layout)
- **Blog posts (22):** ❌ Have metadata only — **NEED Article + FAQ schema**
- **Feature pages (9):** ❌ Have metadata only — **NEED Service + FAQ schema**
- **Glossary + Tools:** ✅ Already have correct schema
- **Pillar guides (3):** ❌ **NEED Article + HowTo + FAQ schema**

**Coverage before fix:** 3/34 pages (9%)  
**Coverage after fix:** 34/34 pages (100%)

**Implementation roadmap:**

| Phase | Component | Files | Time | Schemas Added |
|-------|-----------|-------|------|---------------|
| 2A (P0) | BlogPostSchema | 22 blog posts | 2 hours | 22 Article + FAQ |
| 2B (P1) | FeatureServiceSchema | 9 feature pages | 1 hour | 9 Service + FAQ |
| 2C (P2) | PillarGuideSchema | 3 guide pages | 30 min | 3 Article + HowTo + FAQ |

**Your action:**
- [ ] Create `BlogPostSchema` component (template provided in doc)
- [ ] Create `FeatureServiceSchema` component (template provided)
- [ ] Batch update all pages (scripts provided)
- [ ] Validate in Google Rich Results Test
- [ ] Check no TypeScript errors

**Impact:** +31 pages eligible for featured snippets + AI citations  
**AEO Boost:** ~50% increase in AI citation probability for existing content

---

### 4. "Quotable vs Not" Priority Matrix ✅
**File:** `/docs/PHASE2-QUOTABLE-VS-NOT.md`  
**What it does:** Rates each question by AI citation probability, helps prioritize which 50 to create

**Key insight:** Not all questions are equal. AI models prefer:
- Definitive, quantifiable answers (durations, rules, percentages)
- Data-backed answers (rankings, comparisons, statistics)
- Procedural answers (step-by-step "how-to")
- Definitions (complex terms simplified)
- Comparisons (A vs B tables)

**Tier system:**
- **Tier 1 (Highest):** 37 questions with clear answers (P0 priority)
- **Tier 2 (Medium):** 14 follow-up questions (P1-P2 priority)
- **Tier 3 (Lower):** 6 opinion-based or rare scenarios (skip for Phase 2)

**Examples:**
- ✅ QUOTABLE: "What is the 90-day unemployment rule?" (quantifiable)
- ✅ QUOTABLE: "OPT processing times 2026" (data-backed, timely)
- ✅ QUOTABLE: "How to apply for OPT?" (step-by-step procedure)
- ❌ NOT QUOTABLE: "Should I take OPT or go to grad school?" (opinion)
- ❌ NOT QUOTABLE: "Is H-1B sponsorship worth it?" (subjective)

**Your action:**
- [ ] Review Tier 1 list (37 questions)
- [ ] Add any domain-specific questions you think matter
- [ ] Confirm the 50 you'll create (mix of Tier 1 + best Tier 2)
- [ ] Feed these into `/app/answers/data.ts`

**Impact:** You focus on high-citation-likelihood questions, avoid wasting time on low-probability answers

---

### 5. AI Citation Monitoring Setup ✅
**File:** `/docs/PHASE2-AI-CITATION-MONITORING.md`  
**What it does:** Framework for tracking "Are we getting cited by AI?" over time

**Two options:**

**Option A: Manual Monitoring** (Free, 30 min/week)
- Weekly spot-check on 5–10 random baseline queries
- Monthly deep dive on all 30 baseline queries
- Update Google Sheet with results
- Requires: Google Sheets + your time

**Option B: Automated Monitoring** (Recommended, $20–50/mo)
- Perplexity API script runs weekly automatically
- Tracks all 30 queries at once
- JSON output shows citation rate + which competitors cited
- Requires: API key + 15 min setup

**Option C: Hybrid** (Recommended)
- Automated Perplexity API checks weekly (easy trending)
- Manual ChatGPT/Gemini checks monthly (harder to automate)
- Balanced cost + accuracy

**Included bonus: Copy-paste Python script** for automated monitoring

**Your action:**
- [ ] Choose Option A, B, or C
- [ ] If B/C: Get free Perplexity API key (https://www.perplexity.ai/settings/api)
- [ ] If B/C: Run setup script (5 min, provided in doc)
- [ ] Create Google Sheet for tracking (template provided)
- [ ] Schedule weekly check (Monday 9am)

**Success metrics to track:**
- % of queries where you're cited (goal: 50%+ by Day 100)
- Which AI model cites you most (Perplexity? Gemini? ChatGPT?)
- Which competitor still dominates (gap to attack)
- Which question types improved most (focus for future content)

**Impact:** Weekly visibility into whether Phase 2 is working

---

## Phase 2 Timeline: Ready-to-Execute Plan

### Week 1 (Days 36–40): Q&A Page Creation
- [ ] Day 36: Fill out AI Citation Baseline (all 30 queries, record Day 0)
- [ ] Day 37: Populate `/app/answers/data.ts` with 50 questions
- [ ] Day 38: Create `/app/answers/layout.tsx` + `/app/answers/[slug]/page.tsx`
- [ ] Day 39: Test 5 pages end-to-end
- [ ] Day 40: Validate schemas + deploy all 50 pages

**Deliverable:** 50 indexed Q&A pages live at `/answers/*`

### Week 2 (Days 41–45): Knowledge Graph & Entity
- [ ] Day 41: Claim/update Google Knowledge Panel
- [ ] Day 42–43: Submit to Product Hunt, G2, AlternativeTo, Crunchbase
- [ ] Day 44–45: Optimize Perplexity citations (update metadata freshness)

**Deliverable:** TrackMyOPT as a recognized entity

### Week 3 (Days 46–50): Schema Expansion + Existing Content Overhaul
- [ ] Days 46–47: Create blog post schema component
- [ ] Days 47–48: Create feature page schema component
- [ ] Days 48–49: Batch update all 22 blog + 9 feature + 3 pillar pages
- [ ] Day 50: Validate + resubmit sitemap

**Deliverable:** +31 pages with JSON-LD schema (Article, Service, FAQ, HowTo)

### Week 4 (Days 51–55): AI-Specific Optimization
- [ ] Days 51–52: Optimize every page's first paragraph for AI quotability
- [ ] Days 53–54: Add "Quick Answer" boxes to top 15 blog posts
- [ ] Day 55: Create structured comparison tables (OPT vs CPT vs H-1B, etc.)

**Deliverable:** All content structured for AI extraction

### Ongoing: Monitoring
- [ ] Weekly: Run AI citation check (automated or spot-check 5 queries)
- [ ] Monthly: Full 30-query re-check + analysis
- [ ] Day 60: Compare to baseline, report progress

**Deliverable:** Weekly citation tracking + monthly "State of AI Citations" report

---

## Quick Reference: File Locations

| Task | Document | Location |
|------|----------|----------|
| AI Citation Baseline | PHASE2-AI-CITATION-BASELINE.md | `/docs/` |
| Master Q&A Template | PHASE2-MASTER-QA-TEMPLATE.md | `/docs/` |
| Schema Audit | PHASE2-SCHEMA-AUDIT.md | `/docs/` |
| Quotable Questions | PHASE2-QUOTABLE-VS-NOT.md | `/docs/` |
| Monitoring Setup | PHASE2-AI-CITATION-MONITORING.md | `/docs/` |
| 100-Day Plan | 100-DAY-GROWTH-PLAN.md | `/docs/` |

---

## Success Checklist

**By Day 40 (End of Week 1):**
- [ ] 50 Q&A pages deployed and indexed
- [ ] AI Citation Baseline recorded (Day 0)
- [ ] All baseline queries manually checked in ChatGPT, Perplexity, Gemini
- [ ] Baseline citation rate documented (likely 0% → becomes your Day 0)

**By Day 55 (End of Phase 2):**
- [ ] 50 Q&A pages live + ranked for their keywords
- [ ] 31 existing pages have JSON-LD schema
- [ ] Knowledge Panel claimed/updated
- [ ] All first paragraphs AI-quotable
- [ ] Comparison tables created
- [ ] Monitoring system running weekly

**By Day 60 (Mid-Phase Check):**
- [ ] Re-check 30 baseline queries
- [ ] Compare to Day 0 baseline
- [ ] Expect 10–20% citation rate (conservative goal)
- [ ] Identify biggest wins (which content changes helped most)

**By Day 100 (Final Phase Check):**
- [ ] Final 30-query re-check
- [ ] Target: 50%+ of baseline queries cite TrackMyOPT
- [ ] Monthly signups from "Answers" pages tracked
- [ ] ROI calculated (time spent on Phase 2 vs. new customers)

---

## What Happens Next (After This Setup)

1. **Immediate (This Week):**
   - Fill out AI Citation Baseline
   - Decide on monitoring approach (Manual/Automated/Hybrid)
   - Schedule weekly check

2. **Days 36–55 (Phase 2 Execution):**
   - Create 50 Q&A pages
   - Add schema to 31 existing pages
   - Optimize for AI quotability

3. **Days 56–75 (Phase 3: Backlink Building)**
   - University outreach (.edu links)
   - Guest posting
   - HARO responses
   - Linkable assets (OPT dashboard, H-1B rankings, state guides)

4. **Days 76–90 (Phase 4: Social Media)**
   - YouTube launch
   - LinkedIn daily posts
   - Reddit strategy
   - Community building (Discord)

5. **Days 91–100 (Phase 5: Conversion)**
   - Landing pages
   - Lead magnets + email sequences
   - Programmatic SEO (state/university/job-role pages)

---

## Questions Before You Start?

Key decisions to make:

1. **Monitoring:** Will you use automated API (Perplexity) or manual?
2. **Content calendar:** When will you create the 50 Q&A pages? (Days 36–40 is fast)
3. **Schema rollout:** Will you batch update all blog/feature/pillar pages immediately after templates are ready?
4. **Prioritization:** Should we start with Tier 1 questions only (37), or mix in Tier 2 (14 more)?

---

## You're Ready to Launch Phase 2

All frameworks are in place. You have:

✅ Baseline document → measure impact  
✅ Master template → batch-create 50 Q&A pages  
✅ Schema audit → fix gaps in existing content  
✅ Question prioritization → focus on high-likelihood queries  
✅ Monitoring system → track weekly progress  

**Next action:** Fill out the AI Citation Baseline this week, then execute Days 36–55.

---

*Phase 2: AEO Domination starts in ~24 days (March 12 → ~April 6, 2026)*  
*Documents created: 5 | Schema gaps identified: 31 pages | Monitoring system: Ready*
