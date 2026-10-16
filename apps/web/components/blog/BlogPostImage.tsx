'use client';

import Image from 'next/image';
import { useState } from 'react';
import * as Sentry from '@sentry/nextjs';

const FALLBACK = '/blog/international-student-guidance-library-2026.png';

// Set once this browser has failed to show a cover the server does serve (images
// blocked by the client, crawlers, data saver) or has no connection, so a page
// of covers does not probe every image again.
let skipCoverProbes = false;
export function resetCoverFailureProbe() {
  skipCoverProbes = false;
}

/**
 * Every source failed in the browser. Ask the server whether the original cover
 * exists: only a broken asset (non-OK or non-image response) is a TrackMyOPT
 * failure. `stage=network` follows Sentry's shared dropped-connection policy.
 */
export async function reportUnavailableCover(src: string) {
  return reportUnavailableBlogImage(src, 'Blog cover image', 'blog-cover-image');
}

/** Same server check for any blog image; `label` and `feature` name it in Sentry. */
export async function reportUnavailableBlogImage(
  src: string,
  label: string,
  feature: string
) {
  if (skipCoverProbes) return;
  let stage = 'network';
  let status: number | 'none' = 'none';
  try {
    const res = await fetch(src, { method: 'HEAD', cache: 'no-store' });
    status = res.status;
    stage = 'http';
    if (res.ok) {
      stage = 'payload';
      if (res.headers.get('content-type')?.startsWith('image/')) {
        skipCoverProbes = true;
        return;
      }
    }
  } catch {
    skipCoverProbes = true;
  }
  Sentry.captureException(
    new Error(
      `${label} failed to load (stage=${stage}, status=${status})`
    ),
    { tags: { feature } }
  );
}

type BlogPostImageProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  preload?: boolean;
};

export function BlogPostImage({
  src,
  alt,
  className,
  sizes,
  priority,
  preload,
}: BlogPostImageProps) {
  const [failure, setFailure] = useState<{
    src: string;
    stage: 'original' | 'fallback' | 'unavailable';
  } | null>(null);
  const stage = failure?.src === src ? failure.stage : 'optimized';
  const imgSrc = stage === 'fallback' ? FALLBACK : src;

  if (stage === 'unavailable') {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`absolute inset-0 flex items-center justify-center bg-gray-100 text-sm text-gray-500 dark:bg-zinc-800 dark:text-gray-400 ${className ?? ''}`}
      >
        Cover unavailable
      </div>
    );
  }

  return (
    <Image
      key={`${src}:${stage}`}
      src={imgSrc}
      alt={alt}
      fill
      priority={priority}
      preload={preload}
      className={className}
      sizes={sizes}
      unoptimized={stage !== 'optimized'}
      onError={() => {
        const next =
          stage === 'optimized'
            ? 'original'
            : stage === 'original' && src !== FALLBACK
              ? 'fallback'
              : 'unavailable';
        // A single dropped request recovers through the next stage; report
        // only when every source failed and the server confirms the cause.
        if (next === 'unavailable') void reportUnavailableCover(src);
        setFailure({ src, stage: next });
      }}
    />
  );
}
