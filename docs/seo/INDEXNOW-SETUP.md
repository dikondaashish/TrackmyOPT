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

Submit URLs via the authenticated API route (`POST /api/indexnow` with `Authorization: Bearer $CRON_SECRET`):

```bash
curl -X POST "https://www.trackmyopt.com/api/indexnow" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"urlList":["https://www.trackmyopt.com/blog/my-article"]}'
```

### Submit Multiple URLs (Batch)

```bash
curl -X POST "https://www.trackmyopt.com/api/indexnow" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"urlList":[
    "https://www.trackmyopt.com/blog/article-1",
    "https://www.trackmyopt.com/blog/article-2",
    "https://www.trackmyopt.com/features/case-status"
  ]}'
```

Implementation: `apps/web/app/api/indexnow/route.ts`

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

## Key handling

An IndexNow ownership key is intentionally public: crawlers must fetch its
verification file from the site. It is not an authentication secret. Keep the
configured value consistent between the environment, submitted payload, and
public verification file.

The **route authentication secret is `CRON_SECRET`**. That value is sensitive,
server-only, and must never be placed in the verification file or client code.

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
