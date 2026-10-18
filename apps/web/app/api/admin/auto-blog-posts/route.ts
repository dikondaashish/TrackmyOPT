import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withSentryApiErrors } from '@/lib/sentry/api-errors';
import { getBlogAdmin } from '@/lib/policy-news/admin';
import { listAutoPostsForAdmin, PolicyNewsStoreError, setAutoPostReview } from '@/lib/policy-news/store';

export const dynamic = 'force-dynamic';

const noStore = { 'Cache-Control': 'no-store' };

async function adminOrDenied() {
  const admin = await getBlogAdmin();
  if (admin.status === 'admin') return { admin };
  return {
    denied: NextResponse.json(
      { admin: false },
      { status: admin.status === 'signed_out' ? 401 : 403, headers: noStore }
    ),
  };
}

/** The 500 is reported to Sentry by withSentryApiErrors. */
function storeFailure(error: unknown) {
  const code = error instanceof PolicyNewsStoreError ? error.code : 'unexpected_error';
  return NextResponse.json({ ok: false, error: code }, { status: 500, headers: noStore });
}

/** GET /api/admin/auto-blog-posts — automatic posts with their review state. */
async function handleGET() {
  const { denied } = await adminOrDenied();
  if (denied) return denied;
  try {
    const posts = await listAutoPostsForAdmin();
    return NextResponse.json({ ok: true, posts }, { headers: noStore });
  } catch (error) {
    return storeFailure(error);
  }
}

const ReviewBody = z.object({
  slug: z.string().min(1).max(120),
  byline: z.enum(['news_desk', 'vinay_kumar']),
});

/**
 * POST /api/admin/auto-blog-posts — { slug, byline }. "vinay_kumar" records
 * the admin's review and switches the post to the standard Vinay Kumar byline.
 */
async function handlePOST(req: NextRequest) {
  const { admin, denied } = await adminOrDenied();
  if (denied) return denied;
  const parsed = ReviewBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 400, headers: noStore });
  }
  const { slug, byline } = parsed.data;
  try {
    const updated = await setAutoPostReview(slug, byline === 'vinay_kumar' ? admin.email : null, new Date());
    if (!updated) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404, headers: noStore });
  } catch (error) {
    return storeFailure(error);
  }
  revalidatePath(`/blog/${slug}`);
  revalidatePath('/blog');
  return NextResponse.json({ ok: true }, { headers: noStore });
}

export const GET = withSentryApiErrors(handleGET, '/api/admin/auto-blog-posts', 'GET');
export const POST = withSentryApiErrors(handlePOST, '/api/admin/auto-blog-posts', 'POST');
