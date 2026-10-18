import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import {
  validateRemoteConfig,
  type RemoteConfigV1,
} from '../../../extension/src/platform-config/remote-config';

/** Shared by the extension config route and the admin publishing route. */
export function adminSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

/** Before the migration is applied the table does not exist yet. */
export function isMissingTable(error: { code?: string } | null | undefined): boolean {
  return error?.code === '42P01' || error?.code === 'PGRST205';
}

export type ActiveConfigResult =
  | { kind: 'config'; config: RemoteConfigV1; body: string; etag: string }
  | { kind: 'none' }
  | { kind: 'invalid' };

export function configResponseBody(config: RemoteConfigV1): { body: string; etag: string } {
  const body = JSON.stringify({ config });
  return { body, etag: `"${createHash('sha256').update(body).digest('hex').slice(0, 32)}"` };
}

/** True when an If-None-Match header names the current entity tag. */
export function etagMatches(header: string | null, etag: string): boolean {
  if (!header) return false;
  return header.split(',').map((value) => value.trim().replace(/^W\//, '')).includes(etag);
}

export async function loadActiveRemoteConfig(): Promise<ActiveConfigResult> {
  const { data, error } = await adminSupabase()
    .from('extension_remote_configs')
    .select('version, config')
    .eq('status', 'active')
    .maybeSingle();
  if (isMissingTable(error)) return { kind: 'none' };
  if (error) throw error;
  if (!data) return { kind: 'none' };
  // Re-validate on the way out: a row edited outside the admin route can
  // never reach extensions unless it still satisfies the bundled schema.
  const validation = validateRemoteConfig(data.config);
  if (!validation.ok || validation.config.version !== data.version) return { kind: 'invalid' };
  return { kind: 'config', config: validation.config, ...configResponseBody(validation.config) };
}
