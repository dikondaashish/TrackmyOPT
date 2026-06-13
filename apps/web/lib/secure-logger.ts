/**
 * Secure Logger Utility
 *
 * Sanitizes sensitive data (tokens, secrets, credentials) before logging.
 * Compliant with NIST SP 800-53 AU-9 (Protection of Audit Information).
 *
 * NEVER log: Authorization headers, Bearer tokens, API keys, client secrets,
 * OAuth tokens, session tokens, or any credential material.
 */

const SENSITIVE_KEYS = new Set([
  'authorization',
  'token',
  'access_token',
  'refresh_token',
  'id_token',
  'bearer',
  'apikey',
  'api_key',
  'x-api-key',
  'secret',
  'client_secret',
  'client_id',
  'password',
  'credential',
  'cookie',
  'set-cookie',
  'stripe-signature',
  'webhook_secret',
  'session',
  'jwt',
]);

const SENSITIVE_PATTERNS = [
  /Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi,
  /eyJ[A-Za-z0-9\-_]+\.eyJ[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_.+/=]*/g, // JWTs
  /(?:api[_-]?key|apikey|secret|token|password|credential)["\s:=]+["']?[A-Za-z0-9\-._~+/]{8,}["']?/gi,
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, // emails
  /\b[A-Z]{3}\d{10}\b/g, // USCIS receipt numbers (IOE1234567890)
  /\bpi_[A-Za-z0-9]+\b/g, // Stripe payment_intent
  /\bcus_[A-Za-z0-9]+\b/g, // Stripe customer
  /\bsub_[A-Za-z0-9]+\b/g, // Stripe subscription
  /\binv_[A-Za-z0-9]+\b/g, // Stripe invoice
  /\bcs_[A-Za-z0-9]+\b/g, // Stripe checkout session
];

const SENSITIVE_OBJECT_KEYS = new Set([
  ...SENSITIVE_KEYS,
  "receipt_number",
  "receiptnumber",
  "email",
  "toemail",
  "previous_email",
  "previousemail",
  "passport",
  "date_of_birth",
  "dateofbirth",
  "address",
  "street",
  "payment_method",
  "card",
]);

function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase().replace(/[-_]/g, '');
  for (const sensitiveKey of SENSITIVE_OBJECT_KEYS) {
    const normalized = sensitiveKey.replace(/[-_]/g, '');
    if (lower.includes(normalized)) return true;
  }
  return false;
}

function redactString(value: string): string {
  let result = value;
  for (const pattern of SENSITIVE_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.source.includes('A-Z]{3}')) {
      result = result.replace(pattern, (match) => redactReceiptNumber(match));
    } else {
      result = result.replace(pattern, '[REDACTED]');
    }
  }
  return result;
}

/** Log-safe USCIS receipt: 3-letter prefix + `***` (e.g. IOE***). */
export function redactReceiptNumber(receipt: string | null | undefined): string {
  if (!receipt || typeof receipt !== "string") return "(none)";
  const trimmed = receipt.trim().toUpperCase();
  if (trimmed.length < 3) return "***";
  return `${trimmed.slice(0, 3)}***`;
}

/**
 * Deep-sanitize a value for safe logging.
 * Removes tokens, secrets, and credentials from objects, arrays, and strings.
 */
export function sanitize(value: unknown, depth = 0): unknown {
  if (depth > 10) return '[MAX_DEPTH]';

  if (value === null || value === undefined) return value;

  if (typeof value === 'string') {
    return redactString(value);
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: redactString(value.message),
      ...(value.stack ? { stack: redactString(value.stack) } : {}),
    };
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitize(item, depth + 1));
  }

  if (typeof value === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (isSensitiveKey(key)) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof val === 'string') {
        sanitized[key] = redactString(val);
      } else {
        sanitized[key] = sanitize(val, depth + 1);
      }
    }
    return sanitized;
  }

  return String(value);
}

/**
 * Sanitize error for logging - extracts only safe, non-sensitive information.
 */
export function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    return redactString(error.message);
  }
  if (typeof error === 'string') {
    return redactString(error);
  }
  if (typeof error === 'object' && error !== null) {
    const safeObj = sanitize(error);
    return JSON.stringify(safeObj);
  }
  return String(error);
}

/** Short prefix for logs (Stripe ids, UUIDs) — avoids logging full identifiers. */
export function logIdPrefix(id: string | null | undefined, keep = 12): string {
  if (id == null || id === '') return '(none)';
  const s = String(id);
  return s.length <= keep ? s : `${s.slice(0, keep)}…`;
}

/**
 * Secure console wrapper. All arguments are sanitized before output.
 */
export const secureLog = {
  log(...args: unknown[]) {
    console.log(...args.map((a) => (typeof a === 'string' ? redactString(a) : sanitize(a))));
  },
  error(...args: unknown[]) {
    console.error(...args.map((a) => (typeof a === 'string' ? redactString(a) : sanitize(a))));
  },
  warn(...args: unknown[]) {
    console.warn(...args.map((a) => (typeof a === 'string' ? redactString(a) : sanitize(a))));
  },
  info(...args: unknown[]) {
    console.info(...args.map((a) => (typeof a === 'string' ? redactString(a) : sanitize(a))));
  },
};
