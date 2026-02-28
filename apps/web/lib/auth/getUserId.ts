/**
 * Shared helper to extract user ID from either JWT token (extension) or Supabase session (web).
 *
 * Usage in API routes:
 *   import { getUserId } from '@/lib/auth/getUserId';
 *   const userId = await getUserId(req);
 */

import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { verifyToken } from '@/lib/auth/jwt';

export async function getUserId(req: NextRequest): Promise<string | null> {
    // 1. Try JWT token first (for Chrome extension)
    const authHeader = req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const decoded = await verifyToken(token);
        if (decoded) {
            return decoded.userId || decoded.sub;
        }
    }

    // 2. Fall back to Supabase session cookies (for web app)
    const cookieStore = cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    cookieStore.set({ name, value, ...options });
                },
                remove(name: string, options: CookieOptions) {
                    cookieStore.set({ name, value: '', ...options });
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
}
