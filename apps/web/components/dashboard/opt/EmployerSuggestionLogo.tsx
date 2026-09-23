'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'CO'
  );
}

export function employerSuggestionLogoUrl(domain: string) {
  try {
    const normalizedDomain = domain.trim();
    const hostname = new URL(
      /^https?:\/\//i.test(normalizedDomain)
        ? normalizedDomain
        : `https://${normalizedDomain}`
    ).hostname.replace(
      /^www\./,
      ''
    );
    if (!hostname) return null;

    const url = new URL('https://t1.gstatic.com/faviconV2');
    url.searchParams.set('client', 'SOCIAL');
    url.searchParams.set('type', 'FAVICON');
    url.searchParams.set('fallback_opts', 'TYPE,SIZE,URL');
    url.searchParams.set('url', `https://${hostname}`);
    url.searchParams.set('size', '256');
    return url.toString();
  } catch {
    return null;
  }
}

export function EmployerSuggestionLogo({
  name,
  domain,
  className,
}: {
  name: string;
  domain: string;
  className?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const src = employerSuggestionLogoUrl(domain);

  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-white text-[11px] font-semibold text-primary shadow-sm dark:bg-slate-950',
        className
      )}
    >
      {src && !imageFailed ? (
        // The public favicon endpoint is a dynamic, third-party response; do
        // not proxy each autocomplete result through the Next.js image loader.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          width={36}
          height={36}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-full w-full object-contain p-1"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className="bg-gradient-to-br from-primary/15 to-cyan-100 bg-clip-text text-transparent dark:to-cyan-950">
          {initials(name)}
        </span>
      )}
    </span>
  );
}
