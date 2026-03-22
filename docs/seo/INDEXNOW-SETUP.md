# IndexNow Configuration

## Setup Instructions

1. **IndexNow API Key**: Already registered
   - Key: `300fa2533a6f482aa589db8617927d1c`
   - Ownership verification file: `/public/300fa2533a6f482aa589db8617927d1c.txt`

2. **Environment Variable**
   Add to your `.env.local` (DO NOT commit to git):
   ```
   INDEXNOW_KEY=300fa2533a6f482aa589db8617927d1c
   ```

3. **Verification**
   Bing will verify domain ownership by fetching:
   ```
   https://trackmyopt.com/300fa2533a6f482aa589db8617927d1c.txt
   ```
   This file exists at `/public/300fa2533a6f482aa589db8617927d1c.txt`

## API Usage

### Submit Single URL
```typescript
import { submitToIndexNow } from '@/lib/indexnow';

// Client-side or server-side
const result = await submitToIndexNow('https://trackmyopt.com/blog/my-article');
console.log(result.success); // true if submitted
```

### Submit Multiple URLs (Batch)
```typescript
import { submitToIndexNowBatch } from '@/lib/indexnow';

const urls = [
  'https://trackmyopt.com/blog/article-1',
  'https://trackmyopt.com/blog/article-2',
  'https://trackmyopt.com/features/case-status',
];

const result = await submitToIndexNowBatch(urls);
```

### Submit Blog Category
```typescript
import { submitBlogCategoryToIndexNow } from '@/lib/indexnow';

const articles = [
  '90-day-unemployment-rule-opt',
  'ats-resume-international-students',
  'can-you-travel-on-opt',
];

const result = await submitBlogCategoryToIndexNow('opt-basics', articles);
```

## Endpoint Details

**POST** `/api/indexnow`

Request body:
```json
{
  "urlList": [
    "https://trackmyopt.com/blog/article-1",
    "https://trackmyopt.com/blog/article-2"
  ]
}
```

Success response (200 or 202):
```json
{
  "success": true,
  "message": "Successfully submitted 2 URL(s) to IndexNow",
  "submittedCount": 2
}
```

## Key Security Notes

⚠️ **IMPORTANT**: The `INDEXNOW_KEY` is sensitive:
- ✅ Store in `.env.local` (Git-ignored)
- ✅ Never commit to repository
- ✅ Only available to server-side code
- ❌ Do NOT expose to client-side code
- ❌ Do NOT hardcode in source files

## IndexNow Documentation

- Official Docs: https://www.indexnow.org/documentation
- Bing Developer: https://www.bing.com/webmaster/
- Register Key: https://www.bing.com/webmaster/configure/home

## Indexing Timeline

After submitting URLs to IndexNow:
- **Expected**: Content indexed within 24-48 hours
- **Compare**: Sitemap.xml typically takes 1-2 weeks
- **Benefit**: 10-14x faster indexing than waiting for crawl

## Monitoring

Check Bing Webmaster Tools to see:
- URLs submitted via IndexNow
- Indexing status  
- Any indexing errors
- Coverage reports

---

**Setup Date**: March 12, 2026
**Status**: ✅ Ready to use
