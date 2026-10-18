import { NextRequest, NextResponse } from 'next/server';
import { withSentryApiErrors } from '@/lib/sentry/api-errors';
import { loadCoverImage } from '@/lib/policy-news/store';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ file: string }> };

/** GET /blog-covers/<slug>.webp — AI-generated cover of an automatic policy-news post. */
async function handleGET(_req: NextRequest, { params }: RouteContext) {
  const { file } = await params;
  const slug = /^(.+)\.webp$/.exec(file)?.[1];
  const image = slug ? await loadCoverImage(slug) : null;
  if (!image) return new NextResponse(null, { status: 404 });

  return new NextResponse(new Uint8Array(image), {
    headers: {
      'Content-Type': 'image/webp',
      'Content-Length': String(image.length),
      // Covers never change for a slug; the CDN keeps them for a week.
      'Cache-Control': 'public, max-age=86400, s-maxage=604800',
    },
  });
}

export const GET = withSentryApiErrors(handleGET, '/blog-covers/[file]', 'GET');
