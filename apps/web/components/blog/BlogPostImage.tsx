'use client';

import Image from 'next/image';
import { useState } from 'react';

const FALLBACK = '/blog/international-student-guidance-library-2026.png';

type BlogPostImageProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

export function BlogPostImage({ src, alt, className, sizes, priority }: BlogPostImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      priority={priority}
      className={className}
      sizes={sizes}
      onError={() => {
        if (imgSrc !== FALLBACK) setImgSrc(FALLBACK);
      }}
    />
  );
}
