'use client';

import Image from 'next/image';
import { useState } from 'react';

const ATS_DOMAINS: Record<string, string> = {
  ashby: 'ashbyhq.com',
  greenhouse: 'greenhouse.com',
};

const logoGradients = [
  'from-blue-600 to-indigo-700',
  'from-emerald-500 to-teal-700',
  'from-violet-500 to-purple-700',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-700',
] as const;

export function domainFromWebsite(website: string | null | undefined) {
  if (!website?.trim()) return null;
  try {
    const normalized = /^https?:\/\//i.test(website) ? website : `https://${website}`;
    return new URL(normalized).hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return null;
  }
}

export function companyLogoUrl(domain: string | null | undefined) {
  if (!domain) return null;
  return `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=256`;
}

export function atsSourceName(sourceAts: string) {
  return sourceAts.charAt(0).toUpperCase() + sourceAts.slice(1).toLowerCase();
}

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
  const sizeClass = compact ? 'size-5 rounded-md' : 'size-12 rounded-xl';

  if (!src || failed) {
    return (
      <span
        className={`${sizeClass} inline-flex shrink-0 items-center justify-center bg-gradient-to-br ${gradientFor(name)} font-bold text-white shadow-sm ${compact ? 'text-[0.6rem]' : 'text-sm'}`}
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
        sizes={compact ? '20px' : '48px'}
        className={`size-full object-contain ${compact ? 'p-0.5' : 'p-1.5'}`}
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
