# Phase 2: AI Citation Monitoring Setup

**Goal:** Track which AI models cite TrackMyOPT for OPT/F-1/STEM OPT queries.  
**Status:** Framework for manual + automated monitoring  
**Update Frequency:** Weekly (automated) + Monthly (deep analysis)

---

## Current Approach: Baseline + Re-checks

### Option A: Manual Monitoring (Reliable, Low Cost)

**Setup:**

1. **Create a shared spreadsheet** (Google Sheets or Airtable) with the 30 baseline queries
2. **Weekly spot-check (30 min commitment):**
   - Pick 5–10 random queries from your baseline
   - Search in ChatGPT, Perplexity, Gemini
   - Record if TrackMyOPT is cited
   - Update trend line

3. **Monthly deep dive (2 hours):**
   - Re-check all 30 baseline queries
   - Compare to previous month
   - Update "30-day citation rate" metric
   - Identify which query type improved most

**Pros:**
- ✅ Free
- ✅ You understand nuances (AI models sometimes paraphrase)
- ✅ No technical setup needed
- ✅ Can qualitatively assess citation quality

**Cons:**
- ⚠️ Time-intensive at scale
- ⚠️ Subjective (did it cite you, or similar info?)
- ⚠️ Can't track 500+ queries

---

### Option B: Automated Monitoring (Scalable, Medium Cost)

**Setup: Perplexity API + Simple Python Script**

Perplexity AI offers an API to query their AI model and get citations. You can automate weekly citation checks.

**Estimated Cost:** $20–50/month (depending on volume)

**Implementation:**

```python
# /scripts/monitor-ai-citations.py
import requests
import json
from datetime import datetime

PERPLEXITY_API_KEY = "your_api_key_here"
BASELINE_QUERIES = [
    "What is OPT?",
    "What is STEM OPT?",
    "How long does OPT last?",
    # ... all 30 queries
]

def check_ai_citation(query: str) -> dict:
    """Query Perplexity API and extract citations."""
    url = "https://api.perplexity.ai/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
        "Content-Type": "application/json",
    }
    
    payload = {
        "model": "ppl-70b-online",
        "messages": [{"role": "user", "content": query}],
    }
    
    response = requests.post(url, json=payload, headers=headers)
    data = response.json()
    
    # Extract citations from response
    citations = data.get("citations", [])
    trackmyopt_cited = any("trackmyopt.com" in c.lower() for c in citations)
    
    return {
        "query": query,
        "citations": citations,
        "trackmyopt_cited": trackmyopt_cited,
        "timestamp": datetime.now().isoformat(),
    }

def run_weekly_check():
    """Run weekly citation check across all baseline queries."""
    results = []
    
    for query in BASELINE_QUERIES:
        result = check_ai_citation(query)
        results.append(result)
        print(f"✅ {query}: {result['trackmyopt_cited']}")
    
    # Save results
    with open(f"citation_check_{datetime.now().date()}.json", "w") as f:
        json.dump(results, f, indent=2)
    
    # Calculate stats
    cited_count = sum(1 for r in results if r["trackmyopt_cited"])
    citation_rate = (cited_count / len(results)) * 100
    
    print(f"\n📊 Citation Rate: {citation_rate:.1f}% ({cited_count}/{len(results)})")
    
    return results

if __name__ == "__main__":
    run_weekly_check()
```

**Usage:**

```bash
# Run weekly check
python scripts/monitor-ai-citations.py

# Schedule with cron (runs every Monday at 9am)
0 9 * * 1 cd /path/to/trackmyopt && python scripts/monitor-ai-citations.py
```

---

### Option C: Hybrid (Recommended)

**Combine both approaches:**

1. **Automated weekly spot-checks** (Perplexity API) — tracks trending
2. **Manual monthly deep dive** — ensures accuracy + captures nuance

**Setup:**
- Use Python script for weekly Perplexity checks
- Use Google Sheets for historical tracking
- Do manual ChatGPT/Gemini checks monthly (they're harder to automate)

---

## Monitoring Tools & Platforms

### 1. **Perplexity AI (Recommended)**

**Why:** Has citations in response, API available, OPT-friendly  
**Cost:** Perplexity Pro ($20/mo) OR API ($0.01–0.03 per query)  
**Setup:** 5 min (get API key, run script)

```python
# Minimal Perplexity API integration
import anthropic

client = anthropic.Anthropic(api_key="pk-xxx")

response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "What is OPT? Site:trackmyopt.com"}
    ],
)

print(response.content[0].text)
# (Note: Perplexity API faster; Claude for testing)
```

### 2. **Google Sheets + Google Forms Automation**

**Why:** Free, collaborative, auto-tracks history  
**Setup:** 10 min

Create a simple form:
- Query name
- ChatGPT cited? (yes/no)
- Perplexity cited? (yes/no)
- Gemini cited? (yes/no)
- Notes (competitor cited instead?)

Weekly, fill it out and get auto-aggregated results.

### 3. **Semrush / Ahrefs Position Tracking**

**Why:** Track "trainingdata" rankings in Semrush's AI Training Data index (if it exists)  
**Cost:** $99+/mo (if using full tool)  
**Limitation:** Limited AI citation-specific tracking (these tools focus on SERP rankings)

### 4. **Custom Dashboard (Optional)**

**Build a simple dashboard** that shows:
- Weekly citation rate (line chart)
- Which queries are cited (table)
- Citation trend (up/down/stable)
- Comparing to competitor citation rates

**Tech Stack:** Next.js + Vercel + Google Sheets API

```typescript
// /app/dashboard/citations/page.tsx
import { GoogleSheetsAPI } from "@/lib/googleSheets";

export default async function CitationsDashboard() {
  const data = await GoogleSheetsAPI.getCitationHistory();
  
  return (
    <div>
      <h1>TrackMyOPT AI Citation Rate</h1>
      <LineChart data={data} />
      <CitationTable data={data.latest} />
    </div>
  );
}
```

---

## Recommended Monitoring Plan

### Setup (This Week)

- [ ] Create Google Sheet with 30 baseline queries
- [ ] Get Perplexity API key (or use Pro account)
- [ ] Set up basic Python script (Option B) OR manual forms (Option A)
- [ ] Schedule weekly check (Monday 9am)
- [ ] Do initial baseline (use your PHASE2-AI-CITATION-BASELINE.md)

### Weekly Tasks (30 min)

- [ ] Run automated or manual check on 5–10 random baseline queries
- [ ] Update Google Sheet with results
- [ ] Note any quick wins ("Oh, we're now cited for X!")

### Monthly Tasks (2 hours, on the 1st)

- [ ] Full re-check of all 30 baseline queries across ChatGPT, Perplexity, Gemini
- [ ] Calculate citation rate (% of queries where you're cited)
- [ ] Compare to previous month: +X%, -Y%, stable
- [ ] Identify biggest improvements (which content changes helped?)
- [ ] Identify remaining gaps (which competitors still dominate?)
- [ ] Update 100-DAY-GROWTH-PLAN.md with KPI dashboard

### Quarterly Review (1 hour, every 3 months)

- [ ] Audit new content impact (which new pages/schema additions helped most?)
- [ ] Identify new question opportunities (are people asking questions you're not answering?)
- [ ] Pivot strategy if needed (if taxonomy changed, adjust Q&A focus)

---

## Quick Start: Perplexity API Script

**Copy-paste ready** to get started today:

```python
#!/usr/bin/env python3
"""
AI Citation Monitoring Script
Checks if TrackMyOPT is cited in Perplexity responses
"""

import requests
import json
from datetime import datetime

# Get your free API key from https://www.perplexity.ai/settings/api
PERPLEXITY_API_KEY = "ppl-xxx-your-key-here"

# Your 30 baseline OPT questions
QUERIES = [
    "What is OPT?",
    "What is STEM OPT?",
    "How long does OPT last?",
    "What is the 90-day unemployment rule?",
    "How to apply for OPT?",
    "OPT processing time 2026",
    "What is I-765?",
    "STEM OPT extension",
    "Do F-1 students pay taxes?",
    "What is H-1B?",
    # Add all 30...
]

def query_perplexity(question: str) -> dict:
    """Query Perplexity API and extract citations."""
    url = "https://api.perplexity.ai/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
        "Content-Type": "application/json",
    }
    
    payload = {
        "model": "ppl-70b-online",  # Online model with current citations
        "messages": [
            {
                "role": "user",
                "content": question,
            }
        ],
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Perplexity returns citations in a special field
        citations = data.get("citations", [])
        
        return {
            "query": question,
            "cited": any("trackmyopt" in str(c).lower() for c in citations),
            "citations": citations[:3],  # Top 3 citations
            "success": True,
        }
    except Exception as e:
        return {
            "query": question,
            "cited": None,
            "error": str(e),
            "success": False,
        }

def run_check():
    """Run citation check for all queries."""
    results = []
    cited_count = 0
    
    print(f"🔍 Checking {len(QUERIES)} queries on Perplexity...\n")
    
    for i, query in enumerate(QUERIES, 1):
        result = query_perplexity(query)
        results.append(result)
        
        if result["success"]:
            status = "✅" if result["cited"] else "❌"
            if result["cited"]:
                cited_count += 1
            print(f"{status} [{i}/{len(QUERIES)}] {query}")
        else:
            print(f"⚠️ [{i}/{len(QUERIES)}] {query} (Error: {result['error']})")
    
    # Calculate stats
    success_count = sum(1 for r in results if r["success"])
    citation_rate = (cited_count / success_count * 100) if success_count > 0 else 0
    
    print(f"\n{'='*60}")
    print(f"📊 CITATION RATE: {citation_rate:.1f}%")
    print(f"   {cited_count} cited out of {success_count} successful queries")
    print(f"{'='*60}\n")
    
    # Save results
    filename = f"citation_check_{datetime.now().strftime('%Y-%m-%d')}.json"
    with open(filename, "w") as f:
        json.dump(
            {
                "timestamp": datetime.now().isoformat(),
                "citation_rate": citation_rate,
                "results": results,
            },
            f,
            indent=2,
        )
    
    print(f"✅ Results saved to {filename}")
    return results

if __name__ == "__main__":
    run_check()
```

**To run:**
```bash
# Install dependencies
pip install requests

# Get Perplexity API key from https://www.perplexity.ai/settings/api

# Update PERPLEXITY_API_KEY in script

# Run
python monitor-citations.py

# Output: JSON file with results + citation rate %
```

---

## Tracking Template (Google Sheets)

**Create this simple sheet:**

| Date | Query | ChatGPT | Perplexity | Gemini | Competitor Cited | Notes |
|------|-------|---------|-----------|---------|-----------------|-------|
| 2026-03-14 | What is OPT? | ❌ | ✅ | ❌ | USCIS.gov | We rank #3 on Perplexity |
| 2026-03-14 | STEM OPT extension | ❌ | ❌ | ❌ | VisaVerge | Need more content |
| ... | ... | ... | ... | ... | ... | ... |

**Share link:** Give to team for collaborative tracking

---

## Success Metrics

Track these over time:

| Metric | Week 1 | Week 4 | Week 8 | Week 12 | Week 16 |
|--------|--------|--------|--------|---------|---------|
| % Queries Cited (Perplexity) | 0% | __% | __% | __% | __% |
| % Queries Cited (ChatGPT) | 0% | __% | __% | __% | __% |
| % Queries Cited (Gemini) | 0% | __% | __% | __% | __% |
| Average Citation Position | N/A | __# | __# | __# | __# |
| Competitor "steal" count | High | __  | __  | __  | Low |

**Target by Day 100:** 50%+ of baseline queries cite TrackMyOPT

---

## Next Steps

1. **This week:**
   - [ ] Create baseline spreadsheet
   - [ ] Get Perplexity API key (free tier available)
   - [ ] Run initial 30-query baseline (record in PHASE2-AI-CITATION-BASELINE.md)

2. **Next week:**
   - [ ] Set up weekly monitoring (automated script OR manual form)
   - [ ] Schedule recurring check (Monday 9am)

3. **By Day 60:**
   - [ ] Re-run full 30-query check
   - [ ] Compare to Day 0 baseline
   - [ ] Identify which content/schema changes helped most

4. **By Day 100:**
   - [ ] Final 30-query check
   - [ ] Calculate ROI (time spent on Phase 2 vs. increased citations)
   - [ ] Plan Phase 101+ based on what worked

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| API rate limited | Use free tier wisely (10 queries/day) or upgrade |
| Got cited but not first | Celebrate! Phase 2 goal is ANY citation, not #1 |
| Competitor still dominates | Add more specific Q&A for that competitor's strength |
| Citation has typo/paraphrase | Still counts! AI doesn't always quote verbatim |
| Baseline changed (AI model update) | Note the change, re-baseline if major shift |

---

## You're Ready

You now have:
1. ✅ AI Citation Baseline Document (30 questions to track)
2. ✅ Master Q&A Template (50 pages, batch-producible)
3. ✅ Schema Audit (fix gaps in 4–5 hours)
4. ✅ Quotable vs Not priorities (which 50 questions to create)
5. ✅ Monitoring setup (weekly tracking, automated option)

**Next action:** Start filling out the AI Citation Baseline this week, then begin Phase 2 content creation on Day 36.
