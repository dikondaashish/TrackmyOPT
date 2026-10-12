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
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      priority={priority}
      preload={preload}
      className={className}
      sizes={sizes}
      onError={() => {
        Sentry.captureException(new Error('Blog cover image failed to load'), {
          tags: { feature: 'blog-cover-image' },
        });
        if (imgSrc !== FALLBACK) setImgSrc(FALLBACK);
      }}
    />
  );
}
