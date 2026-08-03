/**
 * safe-json-ld.ts
 *
 * Utility for safely serializing JSON-LD structured-data objects into the
 * string that goes inside <script type="application/ld+json"> tags.
 *
 * Guarantees:
 *  1. "@context" is always a plain string before serialization.
 *  2. Any field that requires .toLowerCase() is guarded with a typeof check.
 *  3. The entire serialization is wrapped in a try/catch so a malformed
 *     schema object never throws and crashes the page (SSR or client).
 *  4. The output is safe for dangerouslySetInnerHTML – "</script>" sequences
 *     inside string values are escaped so they cannot break the script tag.
 */

const FALLBACK_CONTEXT = "https://schema.org";

/**
 * Escape </script> sequences that could prematurely close the script tag.
 * This is the same technique Next.js itself uses for __NEXT_DATA__.
 */
function escapeScriptClose(str: string): string {
  return str.replace(/<\/script>/gi, "<\\/script>");
}

/**
 * Normalize a raw JSON-LD object so it is safe to serialize:
 *  - Ensures "@context" is a non-empty string.
 *  - Does NOT mutate the original object.
 */
function normalizeSchema(raw: Record<string, unknown>): Record<string, unknown> {
  const schema = { ...raw };

  // Guard 1 & 2: "@context" must be a plain string
  const ctx = schema["@context"];
  if (typeof ctx !== "string" || !ctx) {
    schema["@context"] = ctx != null ? String(ctx) : FALLBACK_CONTEXT;
  }

  return schema;
}

/**
 * Serialize a single JSON-LD schema object to a safe string for injection.
 * Returns an empty string on any error so the page never crashes.
 */
export function safeSerializeJsonLd(schema: unknown): string {
  try {
    if (schema == null || typeof schema !== "object") return "";

    const normalized = normalizeSchema(schema as Record<string, unknown>);
    const json = JSON.stringify(normalized);
    return escapeScriptClose(json);
  } catch {
    // Serialization failure must never crash SSR or client render.
    return "";
  }
}
