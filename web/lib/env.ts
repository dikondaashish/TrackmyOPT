import { z } from 'zod';

/**
 * Environment variables schema
 * Client-side vars must be prefixed with NEXT_PUBLIC_
 */
const envSchema = z.object({
  // Public (client-side) variables
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  
  // Server-side only variables
  JWT_SIGNING_SECRET: z.string().min(32),
});

/**
 * Validates and returns environment variables
 * Throws an error if required variables are missing or invalid
 */
function getEnv() {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    JWT_SIGNING_SECRET: process.env.JWT_SIGNING_SECRET,
  });

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}

/**
 * Validated environment variables
 * Access with: env.NEXT_PUBLIC_SUPABASE_URL
 */
export const env = getEnv();

/**
 * Client-safe environment variables (can be used in browser)
 */
export const clientEnv = {
  NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
} as const;

