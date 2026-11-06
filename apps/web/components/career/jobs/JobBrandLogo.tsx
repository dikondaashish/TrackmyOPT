'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ATS_DOMAINS, atsSourceName, companyLogoUrl, domainFromWebsite } from './JobBrandLogo.utils';

const logoGradients = [
  'bg-blue-600',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-amber-500',
  'bg-rose-500',
] as const;

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join('').toUpperCase() || '?';
}

function gradientFor(name: string) {
  const hash = [...name].reduce((total, character) => total + character.charCodeAt(0), 0);
  return logoGradients[hash % logoGradients.length];
}

function Logo({ name, domain, compact = false }: { name: string; domain: string | null; compact?: boolean }) {
  const [failed, setFailed] = useState(false);
  const src = companyLogoUrl(domain);
  const sizeClass = compact ? 'size-4 rounded' : 'size-10 rounded-lg';

  if (!src || failed) {
    return (
      <span
        className={`${sizeClass} inline-flex shrink-0 items-center justify-center ${gradientFor(name)} font-bold text-white shadow-sm ${compact ? 'text-[0.6rem]' : 'text-sm'}`}
        aria-label={`${name} logo unavailable`}
      >
        {initials(name)}
      </span>
    );
  }

  return (
    <span className={`${sizeClass} relative inline-flex shrink-0 overflow-hidden border border-slate-200 bg-white shadow-sm dark:border-slate-700`}>
      <Image
        src={src}
        alt={`${name} logo`}
        width={256}
        height={256}
        sizes={compact ? '16px' : '40px'}
        className={`size-full object-contain ${compact ? 'p-px' : 'p-1'}`}
        onError={() => setFailed(true)}
        unoptimized
      />
    </span>
  );
}

export function JobCompanyLogo({ companyName, website }: { companyName: string; website: string | null }) {
  return <Logo name={companyName} domain={domainFromWebsite(website)} />;
}

export function AtsSourceLogo({ sourceAts }: { sourceAts: string }) {
  const sourceName = atsSourceName(sourceAts);
  return <Logo name={sourceName} domain={ATS_DOMAINS[sourceAts.toLowerCase()] || null} compact />;
}
