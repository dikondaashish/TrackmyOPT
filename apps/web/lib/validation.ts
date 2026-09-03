/**
 * Input Validation Schemas
 * 
 * SECURITY: Schema-based validation prevents:
 * - SQL/NoSQL injection
 * - XSS attacks
 * - Type confusion attacks
 * - Buffer overflow (via length limits)
 * 
 * Uses Zod for runtime type validation with TypeScript inference
 * 
 * OWASP Reference: Input validation is the first line of defense
 */

import { z } from 'zod';

// ============================================================================
// COMMON SCHEMAS
// ============================================================================

/**
 * SECURITY: Email validation with strict format
 */
export const emailSchema = z
    .string()
    .email('Invalid email format')
    .max(254, 'Email too long') // RFC 5321 limit
    .transform((email) => email.toLowerCase().trim());

/**
 * SECURITY: Password validation with minimum requirements
 * Note: Actual password hashing is handled by Supabase Auth
 */
export const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long');

/**
 * SECURITY: UUID validation for database IDs
 * Prevents injection via malformed IDs
 */
export const uuidSchema = z
    .string()
    .uuid('Invalid ID format');

/**
 * SECURITY: USCIS Receipt Number validation
 * Format: 3 letters + 10 digits (e.g., IOE1234567890)
 *
 * Normalises *before* matching. A trailing `.transform(toUpperCase)` would run
 * after the regex had already rejected the input, so `ioe1234567890` — which
 * callers do send, and which the routes accept — would fail.
 */
export const receiptNumberSchema = z
    .string()
    .transform((rn) => rn.toUpperCase().trim())
    .pipe(
        z
            .string()
            .length(13, 'Receipt number must be exactly 13 characters')
            .regex(
                /^[A-Z]{3}[0-9]{10}$/,
                'Invalid receipt number format. Expected: 3 letters + 10 digits (e.g., IOE1234567890)'
            )
    );

/**
 * SECURITY: Date validation (ISO 8601 format)
 */
export const dateSchema = z
    .string()
    .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        'Invalid date format. Use YYYY-MM-DD'
    )
    .refine((date) => !isNaN(Date.parse(date)), 'Invalid date');

/**
 * SECURITY: Optional date that can be null or empty
 */
export const optionalDateSchema = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
    .nullable()
    .optional()
    .transform((val) => val || null);

// ============================================================================
// API REQUEST SCHEMAS
// ============================================================================

/**
 * Login request schema
 */
export const loginRequestSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

/**
 * Signup request schema
 */
export const signupRequestSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    full_name: z
        .string()
        .min(1, 'Name is required')
        .max(100, 'Name too long')
        .optional(),
});
export type SignupRequest = z.infer<typeof signupRequestSchema>;

/**
 * Case status request schema — `POST /api/case-status`.
 *
 * Covers every field the route reads. `label`, `case_type` and `set_primary`
 * previously reached the database with no validation at all.
 *
 * Deliberately NOT `.strict()`: callers send extra keys the route ignores
 * (SettingsSection posts `auto_check_frequency` and `notify_on_change`), and
 * rejecting those would turn a silent no-op into a 400.
 */
export const caseStatusRequestSchema = z.object({
    receipt_number: receiptNumberSchema,
    notifications_enabled: z.boolean().optional().default(true),
    label: z.string().max(100, 'Label too long').nullable().optional().default(null),
    case_type: z.string().max(20, 'Case type too long').optional().default('I-765'),
    filing_category: z.enum([
        'initial_opt',
        'stem_extension',
        'h1b',
        'h4',
        'h4_ead',
        'i485',
        'i130',
        'i140',
        'i131',
        'other',
    ]).optional(),
    set_primary: z.boolean().optional().default(false),
});
export type CaseStatusRequest = z.infer<typeof caseStatusRequestSchema>;

/**
 * OPT dates request schema.
 *
 * ⚠️ NOT wired to `POST /api/opt/calculator`, and it does not currently match
 * that route's contract. Do not connect it without reconciling all three:
 *
 *   1. Format — this expects ISO `YYYY-MM-DD`; the route receives US
 *      `M/D/YYYY` and pads single digits itself, so `1/5/2026` is valid today
 *      and would be rejected here.
 *   2. Cardinality — this requires `program_end_date`; the route accepts any
 *      one date ("at least one date is required") and also takes a
 *      `_lastModifiedField` hint this schema does not model.
 *   3. Clients — the route is called from five Chrome-extension modules as
 *      well as the dashboard. Extensions update on Google's schedule, not
 *      ours, so tightening the contract can 400 versions already installed.
 */
export const optDatesRequestSchema = z.object({
    program_end_date: dateSchema,
    opt_start_date: dateSchema.optional(),
    opt_ead_end_date: dateSchema.optional(),
    stem_start_date: optionalDateSchema,
    stem_ead_end_date: optionalDateSchema,
    dso_recommendation_date: optionalDateSchema,
});
export type OptDatesRequest = z.infer<typeof optDatesRequestSchema>;

/**
 * Email notification request schema — `POST /api/user/notification-email`.
 *
 * `toolType` is camelCase to match what the route and its callers actually
 * send, and stays a free string: the route accepts any non-empty value and
 * persists it, so an enum here would silently drop unlisted tools.
 */
export const emailNotificationRequestSchema = z.object({
    email: emailSchema,
    toolType: z
        .string()
        .max(50, 'Tool type too long')
        .nullable()
        .optional()
        .transform((value) => {
            const trimmed = value?.trim();
            return trimmed ? trimmed : null;
        }),
});
export type EmailNotificationRequest = z.infer<typeof emailNotificationRequestSchema>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate request body against a schema
 * 
 * @param body - Request body (parsed JSON)
 * @param schema - Zod schema to validate against
 * @returns Validated data or error object
 * 
 * Usage:
 * ```ts
 * const result = validateRequest(body, loginRequestSchema);
 * if (!result.success) {
 *   return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
 * }
 * const { email, password } = result.data;
 * ```
 */
export function validateRequest<T>(
    body: unknown,
    schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: string; details?: z.ZodIssue[] } {
    try {
        const data = schema.parse(body);
        return { success: true, data };
    } catch (error) {
        if (error instanceof z.ZodError) {
            // Return first error message for user-friendly display
            const firstError = error.errors[0];
            const errorMessage = firstError.path.length > 0
                ? `${firstError.path.join('.')}: ${firstError.message}`
                : firstError.message;

            return {
                success: false,
                error: errorMessage,
                details: error.errors,
            };
        }
        return { success: false, error: 'Invalid request data' };
    }
}

/**
 * SECURITY: Sanitize string input to prevent XSS
 * Removes HTML tags and trims whitespace
 */
export function sanitizeString(input: string): string {
    return input
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/[<>]/g, '')    // Remove any remaining angle brackets
        .trim();
}

/**
 * SECURITY: Validate and sanitize query parameters
 */
export function sanitizeQueryParam(param: string | null): string | null {
    if (!param) return null;
    return sanitizeString(param).substring(0, 1000); // Limit length
}
