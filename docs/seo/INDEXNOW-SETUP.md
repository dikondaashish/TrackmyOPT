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
   https://www.trackmyopt.com/300fa2533a6f482aa589db8617927d1c.txt
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
    "https://www.trackmyopt.com/blog/article-1",
    "https://www.trackmyopt.com/blog/article-2"
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

## Helper scripts

Both scripts submit directly to `https://api.indexnow.org/IndexNow` (they do not call `/api/indexnow` and do not need `CRON_SECRET`).

| Script | Purpose | Commands |
|--------|---------|----------|
| `scripts/submit-to-indexnow.js` | Bulk-submits a hardcoded list of blog articles, feature pages, guides, other pages and the home page. Update the lists in the script when content is added | Root or `apps/web`: `pnpm submit:indexnow` (root delegates to `pnpm --filter web submit:indexnow`) |
| `scripts/submit-urls-indexnow.js` | Submits specific URLs: full URLs, `/paths`, `--slug <post>` (maps to `/blog/<post>`) or bare slugs | Root: `pnpm submit:indexnow:url -- --slug my-new-post`; `apps/web` has the same `submit:indexnow:url` script |

Key caveat: both scripts read `INDEXNOW_KEY` but fall back to `trackmyopt2026indexnow` and send `keyLocation` `https://www.trackmyopt.com/indexnow-key.txt` (file `apps/web/public/indexnow-key.txt`). The API route instead requires `INDEXNOW_KEY` (returns 500 if unset) and uses `https://www.trackmyopt.com/<INDEXNOW_KEY>.txt`. Keep the key and verification file consistent for whichever path you use.

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

## Monitoring

Check Bing Webmaster Tools to see:
- URLs submitted via IndexNow
- Indexing status  
- Any indexing errors
- Coverage reports
