'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { brandLogoCandidates } from '@/components/career/jobs/JobBrandLogo.utils';

const SIZE_CLASSES = {
    lg: 'size-14 rounded-xl p-2 text-sm',
    md: 'size-12 rounded-lg p-1.5 text-xs',
} as const;

const RENDER_PX = { lg: 112, md: 96 } as const;

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
    const candidates = useMemo(() => brandLogoCandidates(domain), [domain]);
    const [candidateIndex, setCandidateIndex] = useState(0);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        setCandidateIndex(0);
        setFailed(false);
    }, [domain]);

    const src = candidates[candidateIndex];

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

    const renderPx = RENDER_PX[size];

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
                width={512}
                height={512}
                sizes={`${renderPx}px`}
                className="size-full object-contain"
                onError={() => {
                    if (src.includes('clearbit') && typeof window !== 'undefined') {
                        localStorage.setItem('trackmyopt_clearbit_blocked', 'true');
                    }
                    if (candidateIndex < candidates.length - 1) {
                        setCandidateIndex((index) => index + 1);
                        return;
                    }
                    setFailed(true);
                }}
                unoptimized
            />
        </span>
    );
}
