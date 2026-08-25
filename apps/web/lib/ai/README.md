# `lib/ai/`

Google Vertex AI integration for resume generation, ATS scanning, and Document Vault expiry extraction.

## Modules

| File | Purpose |
|---|---|
| `google-ai.ts` | Vertex client, task model policies, controlled fallback, and usage/cost telemetry |
| `gemini-ai.ts` | Typed feature functions: `analyzeDocument`, `analyzeAtsGap`, `rewriteBulletPoints` |
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
| Grant routing | Vertex AI is the default; Developer API fallback requires `GOOGLE_GENAI_USE_VERTEXAI=false` explicitly |
| Cost control | Task policy routes generation to Gemini 3.7 Flash and structured extraction to Gemini 3.5 Flash-Lite |
| Model unavailability | Only retryable provider errors use the task's fallback model; invalid/auth requests fail immediately |
| Observability | Every successful request logs model, backend, latency, tokens, estimated cost, and fallback status without prompt contents |

## Vertex AI configuration

Required:

- `GOOGLE_GENAI_USE_VERTEXAI=true`
- `GOOGLE_CLOUD_PROJECT=<project-id>`
- `GOOGLE_CLOUD_LOCATION=global`

Authentication uses Application Default Credentials on Google Cloud. For a
non-Google host such as Vercel, set `GOOGLE_SERVICE_ACCOUNT_JSON` to the full
service-account key JSON as a protected server-side environment variable.

## Adding a new AI feature

1. Put the prompt in `lib/ai/prompts/<feature>.ts` so it can be unit-tested.
2. Add a function to `gemini-ai.ts` returning a typed object (NOT raw `any`).
3. Wrap the route with `getUserId(req)` auth.
4. Add a usage record via `lib/usage-limit.ts` if it's a paid feature.
5. Add at least one Vitest test for the prompt builder.

## Document Vault expiry detection

`analyzeDocument` returns a `confidence` score. If `confidence < 0.5` OR `expiryDate === null`, the upload route flags `needsManualExpiry: true` in the response so the UI can prompt the user to enter the expiry by hand. This was ISS-016 — never let the AI silently drop the date.
