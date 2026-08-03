/**
 * Per-job tailored resume storage for the Chrome extension.
 *
 * POST  — persist the artifact the extension just generated for a posting.
 * GET   — hand back the artifact belonging to the page the user is on now.
 *
 * The extension keeps its short-lived in-memory artifact as the fast path; this
 * route is what makes "generate now, apply an hour later, or on another device"
 * work at all. Matching is delegated to the extension's own
 * `jobUrlsReferToSameJob`, so a stored resume is only ever returned for the
 * posting it was generated against.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth/getUserId';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { corsHeadersWebAndExtension } from '@/lib/api/cors-policy';
import rateLimit from '@/lib/auth/rate-limit';
import {
  buildArtifactRow,
  overflowArtifactIds,
  reviveStoredArtifact,
  selectMatchingArtifact,
  supersededArtifactIds,
  type StoredArtifactCandidate,
} from '@/lib/extension/resume-artifact-store';
import { validateGeneratedResumeArtifactV1 } from '../../../../../extension/src/resume-artifact-validator';
import { RESUME_ARTIFACT_TTL_MS } from '../../../../../extension/src/resume-artifact-lifecycle';
import type { GeneratedResumeArtifactV1 } from '../../../../../extension/src/resume-autofill-contract';

export const dynamic = 'force-dynamic';

const IDENTITY_COLUMNS = 'id, source_url, requisition_id, created_at, expires_at';
/** A compiled resume PDF is well under this; the cap stops absurd payloads. */
const MAX_REQUEST_BODY_CHARACTERS = 24 * 1024 * 1024;
/** Bounded so one signed-in token cannot sweep an account's whole history. */
const CANDIDATE_SCAN_LIMIT = 200;

const artifactWriteLimiter = rateLimit({
  interval: 60_000,
  name: 'extension-resume-artifact-write',
});

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeadersWebAndExtension(req) });
}

async function loadCandidates(userId: string): Promise<StoredArtifactCandidate[] | null> {
  const { data, error } = await getSupabaseAdminClient()
    .from('generated_resume_artifacts')
    .select(IDENTITY_COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(CANDIDATE_SCAN_LIMIT);
  if (error) return null;
  return (data ?? []) as StoredArtifactCandidate[];
}

export async function GET(req: NextRequest) {
  const headers = corsHeadersWebAndExtension(req);
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'not_signed_in' }, { status: 401, headers });
  }

  const jobUrl = (req.nextUrl.searchParams.get('jobUrl') || '').trim();
  if (!jobUrl) {
    return NextResponse.json({ ok: false, error: 'missing_job_url' }, { status: 400, headers });
  }

  const candidates = await loadCandidates(userId);
  if (!candidates) {
    return NextResponse.json({ ok: false, error: 'storage_failed' }, { status: 500, headers });
  }

  const match = selectMatchingArtifact(candidates, { jobUrl });
  if (!match) {
    return NextResponse.json({ ok: true, artifact: null }, { headers });
  }

  const { data, error } = await getSupabaseAdminClient()
    .from('generated_resume_artifacts')
    .select('artifact')
    .eq('user_id', userId)
    .eq('id', match.id)
    .maybeSingle();
  if (error || !data?.artifact) {
    return NextResponse.json({ ok: false, error: 'storage_failed' }, { status: 500, headers });
  }

  const stored = data.artifact as GeneratedResumeArtifactV1;
  // Storage keeps the resume for 30 days, but the extension's in-page contract
  // is still the short review window. Hand back a freshly stamped copy so the
  // client-side lifecycle checks behave identically to a new generation.
  const artifact = reviveStoredArtifact(stored, RESUME_ARTIFACT_TTL_MS);
  if (!(await validateGeneratedResumeArtifactV1(artifact, { validateCoverLetter: true }))) {
    // A stored row that no longer satisfies the contract is unusable; drop it
    // rather than serving something the extension will reject anyway.
    await getSupabaseAdminClient()
      .from('generated_resume_artifacts')
      .delete()
      .eq('user_id', userId)
      .eq('id', match.id);
    return NextResponse.json({ ok: true, artifact: null }, { headers });
  }

  return NextResponse.json({ ok: true, artifact }, { headers });
}

export async function POST(req: NextRequest) {
  const headers = corsHeadersWebAndExtension(req);
  const userId = await getUserId(req);
  if (!userId) {
    return NextResponse.json({ ok: false, error: 'not_signed_in' }, { status: 401, headers });
  }
  const { isRateLimited } = await artifactWriteLimiter.check(
    req,
    30,
    `resume-artifact:${userId}`,
  );
  if (isRateLimited) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429, headers });
  }

  const raw = await req.text().catch(() => '');
  if (!raw || raw.length > MAX_REQUEST_BODY_CHARACTERS) {
    return NextResponse.json({ ok: false, error: 'invalid_artifact' }, { status: 400, headers });
  }
  let body: { artifact?: unknown } | null = null;
  try {
    body = JSON.parse(raw) as { artifact?: unknown };
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_artifact' }, { status: 400, headers });
  }

  // Same strict structural check the extension applies before prefilling, so a
  // malformed or oversized artifact can never reach storage.
  if (!(await validateGeneratedResumeArtifactV1(body?.artifact, { validateCoverLetter: true }))) {
    return NextResponse.json({ ok: false, error: 'invalid_artifact' }, { status: 400, headers });
  }
  const artifact = body!.artifact as GeneratedResumeArtifactV1;

  const supabase = getSupabaseAdminClient();
  const candidates = await loadCandidates(userId);
  if (!candidates) {
    return NextResponse.json({ ok: false, error: 'storage_failed' }, { status: 500, headers });
  }

  const { error } = await supabase
    .from('generated_resume_artifacts')
    .insert(buildArtifactRow(userId, artifact));
  if (error) {
    return NextResponse.json({ ok: false, error: 'storage_failed' }, { status: 500, headers });
  }

  // Retire the previous resume for this posting and anything past the per-user
  // cap. Best-effort: the new row is already stored and usable either way.
  const stale = [
    ...supersededArtifactIds(candidates, artifact),
    ...overflowArtifactIds(candidates),
  ];
  if (stale.length > 0) {
    await supabase
      .from('generated_resume_artifacts')
      .delete()
      .eq('user_id', userId)
      .in('id', [...new Set(stale)]);
  }

  return NextResponse.json({ ok: true, stored: true }, { headers });
}
