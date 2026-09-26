'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { employerSuggestionLogoUrl } from '@/components/dashboard/opt/EmployerSuggestionLogo';
import { trackerLogoDomain } from './CompanyLogo.utils';

interface CompanyLogoProps {
  companyName: string;
  jobUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-12 text-base',
};

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'CO'
  );
}

export function CompanyLogo({
  companyName,
  jobUrl,
  size = 'md',
  className,
}: CompanyLogoProps) {
  const domain = trackerLogoDomain(companyName, jobUrl);
  const src = domain ? employerSuggestionLogoUrl(domain) : null;
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (src && failedSrc !== src) {
    return (
      <span
        className={cn(
          'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-white shadow-sm',
          SIZE_CLASSES[size],
          className
        )}
      >
        <Image
          src={src}
          alt={`${companyName} logo`}
          width={256}
          height={256}
          sizes={size === 'sm' ? '32px' : size === 'md' ? '40px' : '48px'}
          className="size-full object-contain p-1"
          onError={() => setFailedSrc(src)}
          unoptimized
        />
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 font-bold text-white shadow-inner',
        SIZE_CLASSES[size],
        className
      )}
      aria-label={`${companyName} logo unavailable`}
    >
      {initials(companyName)}
    </span>
  );
}
