import { z } from 'zod';

/**
 * Client-side environment variables schema
 * Only includes NEXT_PUBLIC_ prefixed variables
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

/**
 * Server-side environment variables schema
 * Includes both public and private variables
 */
const serverEnvSchema = clientEnvSchema.extend({
  JWT_SIGNING_SECRET: z.string().min(32),
});

/**
 * Validates client-side environment variables
 */
function getClientEnv() {
  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  if (!parsed.success) {
    console.error('❌ Invalid client environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid client environment variables');
  }

  return parsed.data;
}

/**
 * Validates server-side environment variables
 * Only call this on the server!
 */
function getServerEnv() {
  // Check if we're on the server
  if (typeof window !== 'undefined') {
    throw new Error('getServerEnv() can only be called on the server');
  }

  const parsed = serverEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    JWT_SIGNING_SECRET: process.env.JWT_SIGNING_SECRET,
  });

  if (!parsed.success) {
    console.error('❌ Invalid server environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid server environment variables');
  }

  return parsed.data;
}

/**
 * Client-safe environment variables (can be used in browser)
 * Use this in client components
 */
export const clientEnv = getClientEnv();

/**
 * Server-side environment variables (includes secrets)
 * Only use this in server components, API routes, or server actions
 */
export function getServerSideEnv() {
  return getServerEnv();
}

