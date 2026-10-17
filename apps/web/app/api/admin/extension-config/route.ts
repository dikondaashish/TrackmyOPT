import { withSentryApiErrors } from '@/lib/sentry/api-errors';
import { NextRequest, NextResponse } from 'next/server';
import { safeEqual } from '@/lib/api/secure-compare';
import { adminSupabase, isMissingTable } from '@/lib/extension/remote-config-store';
import { validateRemoteConfig } from '../../../../../extension/src/platform-config/remote-config';

export const dynamic = 'force-dynamic';

const MAX_BODY_CHARACTERS = 40_000;
const VERSION_RE = /^\d{4}-\d{2}-\d{2}\.\d{1,3}$/;

function authorized(req: NextRequest): boolean {
  const auth = req.headers.get('authorization');
  const secret = process.env.ADMIN_SECRET;
  return Boolean(secret && auth && safeEqual(auth, `Bearer ${secret}`));
}

const noStore = { 'Cache-Control': 'no-store' };

/**
 * GET /api/admin/extension-config — list versions (newest first).
 * Authorization: Bearer ADMIN_SECRET (operators only).
 */
async function handleGET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  const { data, error } = await adminSupabase()
    .from('extension_remote_configs')
    .select('version, status, created_by, notes, created_at, activated_at')
    .order('created_at', { ascending: false })
    .limit(50);
  if (isMissingTable(error)) return NextResponse.json({ error: 'Migration not applied' }, { status: 503, headers: noStore });
  if (error) return NextResponse.json({ error: 'Could not list configs' }, { status: 500, headers: noStore });
  return NextResponse.json({ versions: data }, { headers: noStore });
}

/**
 * POST /api/admin/extension-config
 *   { action: "publish", config, created_by, notes? } → stores an inactive version
 *   { action: "activate", version }                   → activates it (also rollback)
 * Publishing validates with the same bundled schema the extension enforces.
 */
async function handlePOST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noStore });
  const raw = await req.text();
  if (raw.length > MAX_BODY_CHARACTERS) return NextResponse.json({ error: 'Request body too large' }, { status: 413, headers: noStore });
  let body: Record<string, unknown>;
  try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers: noStore }); }
  const supabase = adminSupabase();

  if (body.action === 'publish') {
    const validation = validateRemoteConfig(body.config);
    if (!validation.ok) return NextResponse.json({ error: validation.error, code: 'invalid_config' }, { status: 400, headers: noStore });
    const createdBy = typeof body.created_by === 'string' ? body.created_by.trim().slice(0, 120) : '';
    if (!createdBy) return NextResponse.json({ error: 'created_by is required' }, { status: 400, headers: noStore });
    const notes = typeof body.notes === 'string' ? body.notes.trim().slice(0, 500) : null;
    const { error } = await supabase.from('extension_remote_configs').insert({
      version: validation.config.version,
      schema_version: validation.config.schemaVersion,
      config: validation.config,
      created_by: createdBy,
      notes,
    });
    if (error?.code === '23505') return NextResponse.json({ error: 'Version already exists' }, { status: 409, headers: noStore });
    if (isMissingTable(error)) return NextResponse.json({ error: 'Migration not applied' }, { status: 503, headers: noStore });
    if (error) return NextResponse.json({ error: 'Could not publish config' }, { status: 500, headers: noStore });
    return NextResponse.json({ ok: true, version: validation.config.version, status: 'inactive' }, { headers: noStore });
  }

  if (body.action === 'activate') {
    if (typeof body.version !== 'string' || !VERSION_RE.test(body.version)) {
      return NextResponse.json({ error: 'Invalid version' }, { status: 400, headers: noStore });
    }
    const { error } = await supabase.rpc('activate_extension_remote_config', { p_version: body.version });
    if (error?.code === 'P0002') return NextResponse.json({ error: 'Unknown version' }, { status: 404, headers: noStore });
    if (error) return NextResponse.json({ error: 'Could not activate config' }, { status: 500, headers: noStore });
    return NextResponse.json({ ok: true, version: body.version, status: 'active' }, { headers: noStore });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400, headers: noStore });
}

export const GET = withSentryApiErrors(handleGET, '/api/admin/extension-config', 'GET');
export const POST = withSentryApiErrors(handlePOST, '/api/admin/extension-config', 'POST');
