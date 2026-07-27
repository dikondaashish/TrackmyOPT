"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { LEGAL_FOOTER_LINKS } from "@/lib/legal/legal-config";
import { requestOpenPrivacyChoices } from "@/lib/cookie-consent";
import { useClientYear } from "@/hooks/useClientDate";

// Custom SVG Logos for Trust Signals
const CloudflareLogo = () => (
    <svg viewBox="0 0 48 24" className="h-6 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32.5 4C28.4 4 25.1 7.3 25.1 11.4C25.1 11.6 25.1 11.8 25.1 12H25C20.6 12 17 15.6 17 20H42C45.3 20 48 17.3 48 14C48 10.7 45.3 8 42 8C41.8 8 41.6 8 41.4 8.1C40.3 5.7 37.9 4 35 4H32.5Z" fill="#F38020" />
        <path d="M17 20H6C2.7 20 0 17.3 0 14C0 10.7 2.7 8 6 8C6.2 8 6.4 8 6.6 8C7.7 5.7 10.1 4 13 4H15.5C19.6 4 22.9 7.3 22.9 11.4C22.9 11.6 22.9 11.8 22.9 12H23C27.4 12 31 15.6 31 20" fill="#FAAD3F" />
    </svg>
);

const StripeBadge = () => (
    <div className="flex items-center gap-1.5 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 px-2.5 py-1 rounded-full">
        <span className="text-[9px] font-semibold text-violet-800 dark:text-violet-200 uppercase tracking-wide">Payments by Stripe</span>
    </div>
);

const SslLogo = () => (
    <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-2 py-1 rounded-full">
        <svg viewBox="0 0 24 24" className="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
        </svg>
        <span className="text-[9px] font-bold text-green-700 dark:text-green-300 uppercase tracking-wide">SSL Secure</span>
    </div>
);

export function LandingFooter() {
    // ponytail: useClientYear — null on SSR/hydration so © year text cannot mismatch (#418).
    const currentYear = useClientYear();

    const footerLinks = {
        product: [
            { label: "Features", href: "/features" },
            { label: "Pricing", href: "/pricing" },
            { label: "How It Works", href: "/how-it-works" },
            { label: "About Us", href: "/about" },
            { label: "Success Stories", href: "/success-stories" },
            { label: "Chrome Extension", href: "https://chromewebstore.google.com/detail/hfljbefkccdmlnhclfojlafipjnjbajm", external: true },
        ] as Array<{ label: string; href: string; external?: boolean }>,
        guides: [
            { label: "90-Day Unemployment Rule", href: "/blog/90-day-unemployment-rule-opt" },
            { label: "STEM OPT Extension Guide", href: "/blog/stem-opt-extension-guide" },
            { label: "OPT to H-1B Transition", href: "/blog/opt-to-h1b-transition" },
            { label: "I-983 Training Plan Guide", href: "/blog/i-983-training-plan-guide" },
            { label: "OPT Processing Time 2026", href: "/blog/opt-processing-time-2026" },
            { label: "F-1 Tax Filing Guide", href: "/guides/f1-tax-filing" },
            { label: "OPT Career Guide", href: "/guides/opt-career" },
            { label: "Health Insurance Guide", href: "/guides/opt-health-insurance" },
        ],
        resources: [
            { label: "All Blog Posts", href: "/blog" },
            { label: "Glossary", href: "/glossary" },
            { label: "Answers (Q&A)", href: "/answers" },
            { label: "Comparisons", href: "/compare" },
            { label: "Immigration Facts", href: "/ai-facts" },
            { label: "FAQ", href: "/faq" },
            { label: "Help Center", href: "/dashboard/help" },
            { label: "Contact", href: "/contact" },
            { label: "Report Fraud", href: "/resources/report-fraud" },
        ],
        legal: [...LEGAL_FOOTER_LINKS],
    };

    return (
        <footer className="bg-gray-50 dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 gap-10 md:grid-cols-5 md:gap-8 lg:gap-12">
                    {/* Brand */}
                    <div className="md:col-span-1 prose-longform">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                                <svg
                                    className="w-5 h-5 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                                TrackMyOPT
                            </span>
                        </Link>
                        <p className="max-w-xs text-base text-gray-600 dark:text-gray-400 md:text-sm">
                            The #1 OPT timeline tracker trusted by 2,500+ international students worldwide.
                        </p>
                    </div>

                    {/* Product */}
                    <div>
                        <h4 className="mb-4 font-semibold text-gray-900 dark:text-white">
                            Product
                        </h4>
                        <ul className="space-y-1 md:space-y-3">
                            {footerLinks.product.map((link, index) => (
                                <li key={index}>
                                    {link.external ? (
                                        <a
                                            href={link.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex min-h-[44px] items-center text-base text-gray-600 transition-colors hover:text-gray-900 max-md:py-1 md:min-h-0 md:inline md:text-sm dark:text-gray-400 dark:hover:text-white"
                                        >
                                            {link.label}
                                        </a>
                                    ) : (
                                        <Link
                                            href={link.href}
                                            className="inline-flex min-h-[44px] items-center text-base text-gray-600 transition-colors hover:text-gray-900 max-md:py-1 md:min-h-0 md:inline md:text-sm dark:text-gray-400 dark:hover:text-white"
                                        >
                                            {link.label}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Guides */}
                    <div>
                        <h4 className="mb-4 font-semibold text-gray-900 dark:text-white">
                            Guides
                        </h4>
                        <ul className="space-y-1 md:space-y-3">
                            {footerLinks.guides.map((link, index) => (
                                <li key={index}>
                                    <Link
                                        href={link.href}
                                        className="inline-flex min-h-[44px] items-center text-base text-gray-600 transition-colors hover:text-gray-900 max-md:py-1 md:min-h-0 md:inline md:text-sm dark:text-gray-400 dark:hover:text-white"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="mb-4 font-semibold text-gray-900 dark:text-white">
                            Resources
                        </h4>
                        <ul className="space-y-1 md:space-y-3">
                            {footerLinks.resources.map((link, index) => (
                                <li key={index}>
                                    <Link
                                        href={link.href}
                                        className="inline-flex min-h-[44px] items-center text-base text-gray-600 transition-colors hover:text-gray-900 max-md:py-1 md:min-h-0 md:inline md:text-sm dark:text-gray-400 dark:hover:text-white"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="mb-4 font-semibold text-gray-900 dark:text-white">
                            Legal
                        </h4>
                        <ul className="space-y-1 md:space-y-3">

                            {footerLinks.legal.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="inline-flex min-h-[44px] items-center text-base text-gray-600 transition-colors hover:text-gray-900 max-md:py-1 md:min-h-0 md:inline md:text-sm dark:text-gray-400 dark:hover:text-white"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <button
                                    type="button"
                                    onClick={requestOpenPrivacyChoices}
                                    className="inline-flex min-h-[44px] items-center text-base text-gray-600 transition-colors hover:text-gray-900 max-md:py-1 md:min-h-0 md:inline md:text-sm dark:text-gray-400 dark:hover:text-white"
                                >
                                    Privacy choices
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center md:justify-start gap-1">
                        © {currentYear ?? ""} TrackMyOPT. Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" aria-hidden /> for international students.
                    </p>

                    <div className="flex flex-wrap justify-center items-center gap-4 opacity-90">
                        <SslLogo />
                        <StripeBadge />
                        <div title="CDN / edge protection may be used" className="opacity-80">
                            <CloudflareLogo />
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
