"use client";

import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface CompanyLogoProps {
    companyName: string;
    jobUrl?: string | null;
    size?: "sm" | "md" | "lg";
    className?: string;
}

// In-memory cache for logo URLs
const logoCache = new Map<string, string | null>();

// Generate consistent gradient color based on company name
const getAvatarGradient = (name: string) => {
    const gradients = [
        "from-violet-500 to-purple-600",
        "from-blue-500 to-indigo-600",
        "from-cyan-500 to-teal-600",
        "from-emerald-500 to-green-600",
        "from-rose-500 to-pink-600",
        "from-amber-500 to-orange-600",
        "from-fuchsia-500 to-pink-600",
        "from-sky-500 to-blue-600",
    ];
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
};

// Get company initials
const getInitials = (name: string) => {
    return name
        .split(" ")
        .map(word => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
};

// Extract domain from URL
const extractDomain = (url: string): string | null => {
    try {
        const parsed = new URL(url);
        // Remove www. prefix
        return parsed.hostname.replace(/^www\./, "");
    } catch {
        return null;
    }
};

const SIZE_CLASSES = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
};

export function CompanyLogo({ companyName, jobUrl, size = "md", className }: CompanyLogoProps) {
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [hasError, setHasError] = useState(false);

    const domain = useMemo(() => {
        if (!jobUrl) return null;
        return extractDomain(jobUrl);
    }, [jobUrl]);

    useEffect(() => {
        if (!domain) {
            setLogoUrl(null);
            return;
        }

        // Check cache first
        if (logoCache.has(domain)) {
            const cached = logoCache.get(domain);
            setLogoUrl(cached || null);
            if (!cached) setHasError(true);
            return;
        }

        // Construct Clearbit logo URL
        const clearbitUrl = `https://logo.clearbit.com/${domain}`;

        // Test if image loads
        const img = new window.Image();
        img.onload = () => {
            logoCache.set(domain, clearbitUrl);
            setLogoUrl(clearbitUrl);
        };
        img.onerror = () => {
            logoCache.set(domain, null);
            setHasError(true);
        };
        img.src = clearbitUrl;
    }, [domain]);

    const sizeClass = SIZE_CLASSES[size];
    const gradient = getAvatarGradient(companyName);
    const initials = getInitials(companyName);

    // Show company logo if available
    if (logoUrl && !hasError) {
        return (
            <div className={cn(
                "rounded-xl overflow-hidden bg-white dark:bg-gray-700 flex items-center justify-center flex-shrink-0 shadow-sm",
                sizeClass,
                className
            )}>
                <Image
                    src={logoUrl}
                    alt={`${companyName} logo`}
                    width={size === "lg" ? 48 : size === "md" ? 40 : 32}
                    height={size === "lg" ? 48 : size === "md" ? 40 : 32}
                    className="object-contain p-1"
                    onError={() => setHasError(true)}
                    unoptimized // Clearbit doesn't support Next.js image optimization
                />
            </div>
        );
    }

    // Fallback to initials avatar
    return (
        <div className={cn(
            "rounded-xl flex items-center justify-center text-white font-bold shadow-inner bg-gradient-to-br flex-shrink-0",
            sizeClass,
            gradient,
            className
        )}>
            {initials}
        </div>
    );
}
