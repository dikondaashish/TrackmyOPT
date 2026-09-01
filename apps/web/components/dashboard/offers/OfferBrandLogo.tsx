'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { companyLogoUrl } from '@/components/career/jobs/JobBrandLogo.utils';

const SIZE_CLASSES = {
    lg: 'size-12 rounded-xl p-1.5 text-sm',
    md: 'size-10 rounded-lg p-1 text-xs',
} as const;

function initials(name: string) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join('')
        .toUpperCase() || '?';
}

interface OfferBrandLogoProps {
    name: string;
    domain: string;
    size?: keyof typeof SIZE_CLASSES;
    className?: string;
}

export function OfferBrandLogo({ name, domain, size = 'md', className }: OfferBrandLogoProps) {
    const [failed, setFailed] = useState(false);
    const src = companyLogoUrl(domain);

    if (!src || failed) {
        return (
            <span
                className={cn(
                    SIZE_CLASSES[size],
                    'inline-flex shrink-0 items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600 font-bold text-white',
                    className,
                )}
                aria-label={`${name} logo unavailable`}
            >
                {initials(name)}
            </span>
        );
    }

    return (
        <span
            className={cn(
                SIZE_CLASSES[size],
                'relative inline-flex shrink-0 overflow-hidden border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800',
                className,
            )}
        >
            <Image
                src={src}
                alt={`${name} logo`}
                width={256}
                height={256}
                className="size-full object-contain"
                onError={() => setFailed(true)}
                unoptimized
            />
        </span>
    );
}
