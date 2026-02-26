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
 */
export const receiptNumberSchema = z
    .string()
    .length(13, 'Receipt number must be exactly 13 characters')
    .regex(
        /^[A-Z]{3}[0-9]{10}$/,
        'Invalid receipt number format. Expected: 3 letters + 10 digits (e.g., IOE1234567890)'
    )
    .transform((rn) => rn.toUpperCase());

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
 * Case status request schema
 */
export const caseStatusRequestSchema = z.object({
    receipt_number: receiptNumberSchema,
    notifications_enabled: z.boolean().optional().default(true),
});
export type CaseStatusRequest = z.infer<typeof caseStatusRequestSchema>;

/**
 * OPT dates request schema
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
 * Email notification request schema
 */
export const emailNotificationRequestSchema = z.object({
    email: emailSchema,
    tool_type: z.enum(['case-status', 'documents', 'opt-apply']).optional(),
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
