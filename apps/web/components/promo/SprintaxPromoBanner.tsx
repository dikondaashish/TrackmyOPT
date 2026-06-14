"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ChevronRight, X } from "lucide-react";

const MARKETING_KEY = "trackmyopt_promo_sprintax_marketing_v1";
const DASHBOARD_KEY = "trackmyopt_promo_sprintax_dashboard_v1";
const VAR_MARKETING = "--tmopt-marketing-promo";
const VAR_DASHBOARD = "--tmopt-dashboard-promo";

// Default heights to prevent CLS before ResizeObserver kicks in
const DEFAULT_HEIGHTS = {
  marketing: "52px", // Approx height including padding
  dashboard: "52px",
};

type Variant = "marketing" | "dashboard";

interface SprintaxPromoBannerProps {
  variant: Variant;
}

export function SprintaxPromoBanner({ variant }: SprintaxPromoBannerProps) {
  const storageKey = variant === "marketing" ? MARKETING_KEY : DASHBOARD_KEY;
  const cssVar = variant === "marketing" ? VAR_MARKETING : VAR_DASHBOARD;
  const bannerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    try {
      // Set initial default height to minimize CLS
      document.documentElement.style.setProperty(cssVar, DEFAULT_HEIGHTS[variant]);

      if (typeof window !== "undefined" && localStorage.getItem(storageKey) === "1") {
        setVisible(false);
        document.documentElement.style.setProperty(cssVar, "0px");
      }
    } catch {
      /* ignore */
    }
  }, [storageKey, cssVar, variant]);

  useEffect(() => {
    if (!visible) {
      if (typeof document !== "undefined") {
        document.documentElement.style.setProperty(cssVar, "0px");
      }
      return;
    }

    if (!bannerRef.current) return;

    const updateHeight = () => {
      if (bannerRef.current) {
        const height = bannerRef.current.getBoundingClientRect().height;
        document.documentElement.style.setProperty(cssVar, `${height}px`);
      }
    };

    const observer = new ResizeObserver(updateHeight);
    observer.observe(bannerRef.current);

    // Initial measure
    updateHeight();

    return () => {
      observer.disconnect();
      if (typeof document !== "undefined") {
        document.documentElement.style.removeProperty(cssVar);
      }
    };
  }, [visible, cssVar]);

  const dismiss = () => {
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  const ctaHref = variant === "marketing" ? "/login" : "/dashboard/tax-filing";
  const ctaLabel = variant === "marketing" ? "Sign up" : "Get coupon";

  return (
    <div
      ref={bannerRef}
      className="fixed top-0 left-0 right-0 z-[60] flex min-h-10 w-full items-center justify-center gap-2 border-b border-white/10 px-3 py-2 sm:gap-4 sm:px-4"
      style={{
        background: "linear-gradient(90deg, #3b0764 0%, #5b21b6 35%, #92400e 100%)",
      }}
    >
      <p className="flex-1 text-center text-xs font-medium leading-snug text-white sm:text-sm">
        <span className="hidden sm:inline">
          Grab your free <span className="font-semibold">$150 Sprintax</span> coupon code — partner offer for TrackMyOPT users.
        </span>
        <span className="sm:hidden">
          Free <span className="font-semibold">$150 Sprintax</span> coupon — TrackMyOPT partner offer.
        </span>
      </p>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-1 rounded-md bg-black px-3 py-2 max-md:min-h-11 text-xs font-semibold text-white transition hover:bg-zinc-900 sm:px-4 sm:text-sm"
        >
          {ctaLabel}
          <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
        </Link>
        <button
          type="button"
          onClick={dismiss}
          className="rounded max-md:min-h-11 max-md:min-w-11 max-md:flex max-md:items-center max-md:justify-center p-1 text-white/80 transition hover:bg-white/10 hover:text-white"
          aria-label="Dismiss promotion"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>
    </div>
  );
}
