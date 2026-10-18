import 'server-only';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

// Who may review automatic blog posts in Settings (BLOG_ADMIN_EMAILS,
// comma-separated; same default account as the LinkedIn admin).

const DEFAULT_ADMIN_EMAILS = ['dikondaashish@gmail.com'];

function adminEmails(): string[] {
  const configured = process.env.BLOG_ADMIN_EMAILS?.split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  return configured?.length ? configured : DEFAULT_ADMIN_EMAILS;
}

/** Only a confirmed, allow-listed account may review posts. */
export function isBlogAdmin(user: Pick<User, 'email' | 'email_confirmed_at' | 'is_anonymous'>): boolean {
  const email = user.email?.trim().toLowerCase();
  return Boolean(email && user.email_confirmed_at && user.is_anonymous !== true && adminEmails().includes(email));
}

export type BlogAdmin = { status: 'admin'; email: string } | { status: 'signed_out' | 'forbidden' };

export async function getBlogAdmin(): Promise<BlogAdmin> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { status: 'signed_out' };
  if (!isBlogAdmin(user)) return { status: 'forbidden' };
  return { status: 'admin', email: (user.email as string).toLowerCase() };
}
