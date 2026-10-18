import 'server-only';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_LINKEDIN_SCOPES, type LinkedInAppConfig } from './api';

/** Public origin used in post links, whatever host served the request. */
export const LINKEDIN_SITE_ORIGIN = 'https://www.trackmyopt.com';

const DEFAULT_ADMIN_EMAILS = ['dikondaashish@gmail.com'];

/** Null until LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET are set. */
export function linkedInAppConfig(): LinkedInAppConfig | null {
  const clientId = process.env.LINKEDIN_CLIENT_ID?.trim();
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return null;
  const apiVersion = process.env.LINKEDIN_API_VERSION?.trim();
  const organizationId = process.env.LINKEDIN_ORGANIZATION_ID?.trim();
  const scopes = (process.env.LINKEDIN_SCOPES ?? '').split(/[\s,]+/).filter((scope) => /^[a-z_]+$/.test(scope));
  return {
    clientId,
    clientSecret,
    apiVersion: apiVersion && /^\d{6}$/.test(apiVersion) ? apiVersion : '202609',
    organizationId: organizationId && /^\d+$/.test(organizationId) ? organizationId : null,
    scopes: scopes.length > 0 ? scopes : DEFAULT_LINKEDIN_SCOPES,
  };
}

export function linkedInRedirectUri(requestOrigin: string): string {
  return process.env.LINKEDIN_REDIRECT_URI?.trim() || `${requestOrigin}/api/admin/linkedin/callback`;
}

function adminEmails(): string[] {
  const configured = process.env.LINKEDIN_ADMIN_EMAILS?.split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  return configured?.length ? configured : DEFAULT_ADMIN_EMAILS;
}

/** Only a confirmed, allow-listed account may manage the company page. */
export function isLinkedInAdmin(
  user: Pick<User, 'email' | 'email_confirmed_at' | 'is_anonymous'>,
): boolean {
  const email = user.email?.trim().toLowerCase();
  return Boolean(email && user.email_confirmed_at && user.is_anonymous !== true && adminEmails().includes(email));
}

export type LinkedInAdmin =
  | { status: 'admin'; email: string }
  | { status: 'signed_out' | 'forbidden' };

export async function getLinkedInAdmin(): Promise<LinkedInAdmin> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: 'signed_out' };
  if (!isLinkedInAdmin(user)) return { status: 'forbidden' };
  return { status: 'admin', email: (user.email as string).toLowerCase() };
}

/** US Eastern calendar date (YYYY-MM-DD) and hour, which set the post day. */
export function easternDateParts(now: Date): { date: string; hour: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? '';
  return { date: `${part('year')}-${part('month')}-${part('day')}`, hour: Number(part('hour')) };
}
