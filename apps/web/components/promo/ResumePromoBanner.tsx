"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const MARKETING_KEY = "trackmyopt_promo_resume_marketing_v1";
const DASHBOARD_KEY = "trackmyopt_promo_resume_dashboard_v1";
const VAR_MARKETING = "--tmopt-marketing-promo";
const VAR_DASHBOARD = "--tmopt-dashboard-promo";
const RESUME_HUB_PREFIX = "/dashboard/career/resume-generator";

const DEFAULT_HEIGHTS = {
  marketing: "52px",
  dashboard: "52px",
} as const;

type Variant = "marketing" | "dashboard";

interface ResumePromoBannerProps {
  variant: Variant;
}

const COPY = {
  dashboard: {
    desktop:
      "Paste a job description. Get an ATS-ready resume in minutes — built for F-1 & OPT job search.",
    mobile: "ATS resume in minutes — paste any job link",
    cta: "Build resume",
    href: "/dashboard/career/resume-generator",
  },
  marketing: {
    desktop:
      "AI Resume Generator for international students — tailor every application, beat the ATS filter.",
    mobile: "AI resumes for F-1 job search",
    cta: "Try free",
    ctaLoggedIn: "Build resume",
    hrefLoggedOut: "/login?redirect=%2Fdashboard%2Fcareer%2Fresume-generator",
    hrefLoggedIn: "/dashboard/career/resume-generator",
  },
} as const;

export function ResumePromoBanner({ variant }: ResumePromoBannerProps) {
  const pathname = usePathname();
  const storageKey = variant === "marketing" ? MARKETING_KEY : DASHBOARD_KEY;
  const cssVar = variant === "marketing" ? VAR_MARKETING : VAR_DASHBOARD;
  const bannerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [usageChecked, setUsageChecked] = useState(variant !== "dashboard");

  const onResumeRoute =
    pathname?.startsWith(RESUME_HUB_PREFIX) ?? false;

  const evaluateVisibility = useCallback(async () => {
    const hide = () => {
      setVisible(false);
      if (variant === "dashboard") {
        setUsageChecked(true);
      }
    };

    if (onResumeRoute) {
      hide();
      return;
    }

    try {
      if (localStorage.getItem(storageKey) === "1") {
        hide();
        return;
      }
    } catch {
      /* ignore */
    }

    if (variant === "dashboard") {
      try {
        const res = await fetch("/api/user/usage", { credentials: "include" });
        if (res.ok) {
          const data = (await res.json()) as { resumeUsage?: number };
          if ((data.resumeUsage ?? 0) > 0) {
            hide();
            return;
          }
        }
      } catch {
        /* show banner if usage check fails */
      } finally {
        setUsageChecked(true);
      }
    }

    setVisible(true);
  }, [onResumeRoute, storageKey, variant]);

  useEffect(() => {
    setMounted(true);
    void evaluateVisibility();
  }, [evaluateVisibility]);

  useEffect(() => {
    if (variant !== "marketing") return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session?.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, [variant]);

  useEffect(() => {
    if (!mounted) return;

    if (!visible) {
      document.documentElement.style.setProperty(cssVar, "0px");
      return;
    }

    document.documentElement.style.setProperty(cssVar, DEFAULT_HEIGHTS[variant]);

    if (!bannerRef.current) return;

    const updateHeight = () => {
      if (bannerRef.current) {
        const height = bannerRef.current.getBoundingClientRect().height;
        document.documentElement.style.setProperty(cssVar, `${height}px`);
      }
    };

    const observer = new ResizeObserver(updateHeight);
    observer.observe(bannerRef.current);
    updateHeight();

    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty(cssVar);
    };
  }, [visible, cssVar, variant, mounted]);

  const dismiss = () => {
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!mounted || !visible || (variant === "dashboard" && !usageChecked)) {
    return null;
  }

  const copy = COPY[variant];
  const ctaHref =
    variant === "dashboard"
      ? COPY.dashboard.href
      : isLoggedIn
        ? COPY.marketing.hrefLoggedIn
        : COPY.marketing.hrefLoggedOut;
  const ctaLabel =
    variant === "dashboard"
      ? COPY.dashboard.cta
      : isLoggedIn
        ? COPY.marketing.ctaLoggedIn
        : COPY.marketing.cta;

  return (
    <div
      ref={bannerRef}
      className="fixed top-0 left-0 right-0 z-[60] flex min-h-10 w-full items-center justify-center gap-2 border-b border-white/10 px-3 py-2 sm:gap-4 sm:px-4"
      style={{
        background:
          "linear-gradient(90deg, #3b0764 0%, #5b21b6 35%, #92400e 100%)",
      }}
    >
      <p className="flex-1 text-center text-xs font-medium leading-snug text-white sm:text-sm">
        <span className="hidden sm:inline">{copy.desktop}</span>
        <span className="sm:hidden">{copy.mobile}</span>
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
