# `lib/ai/`

Google Gemini integration for resume generation, ATS scanning, and Document Vault expiry extraction.

## Modules

| File | Purpose |
|---|---|
| `gemini-ai.ts` | Single Gemini client + `analyzeDocument`, `analyzeAtsGap`, `rewriteBulletPoints` |
| `prompts/` | Prompt templates kept out of route handlers for testability |

## Public API

```ts
import {
    analyzeDocument,
    analyzeAtsGap,
    rewriteBulletPoints,
    normalizeText,
} from '@/lib/ai/gemini-ai';

const result = await analyzeDocument(buffer, mimeType, fileName);
// → { documentType, expiryDate, issueDate, extractedFields, confidence, summary }
```

## Cost / safety guardrails

| Concern | Mitigation |
|---|---|
| Unauthenticated abuse | Every `/api/resume-generator/*` route now calls `getUserId(req)` and 401s without a session |
| Quota draining | Per-user rate limit on `/fix-latex` (10/min); upload limit on `/upload`; resume limit on `/generate` (free=5, pro=500 monthly) |
| Prompt injection | User-supplied resume/job text is wrapped in delimiter tags inside the prompt; we don't ship the raw model output as HTML |
| Cost runaway from large inputs | Max input size enforced server-side (resume PDF ≤ 10 MB, URL extracts ≤ 20 000 chars) |
| Model unavailability | Two-stage fallback: `gemini-3.1-pro-preview` → `gemini-2.5-pro`. If both fail, route returns clean error and the client gracefully degrades |

## Adding a new AI feature

1. Put the prompt in `lib/ai/prompts/<feature>.ts` so it can be unit-tested.
2. Add a function to `gemini-ai.ts` returning a typed object (NOT raw `any`).
3. Wrap the route with `getUserId(req)` auth.
4. Add a usage record via `lib/usage-limit.ts` if it's a paid feature.
5. Add at least one Vitest test for the prompt builder.

## Document Vault expiry detection

`analyzeDocument` returns a `confidence` score. If `confidence < 0.5` OR `expiryDate === null`, the upload route flags `needsManualExpiry: true` in the response so the UI can prompt the user to enter the expiry by hand. This was ISS-016 — never let the AI silently drop the date.
