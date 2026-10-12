'use client';

import Image from 'next/image';
import { useState } from 'react';
import * as Sentry from '@sentry/nextjs';

const FALLBACK = '/blog/international-student-guidance-library-2026.png';

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
        Sentry.captureException(new Error('Blog cover image failed to load'), {
          tags: { feature: 'blog-cover-image' },
        });
        setFailure({
          src,
          stage:
            stage === 'optimized'
              ? 'original'
              : stage === 'original' && src !== FALLBACK
                ? 'fallback'
                : 'unavailable',
        });
      }}
    />
  );
}
