"use client";

import Link from "next/link";

// Custom SVG Logos for Trust Signals
const CloudflareLogo = () => (
    <svg viewBox="0 0 48 24" className="h-6 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32.5 4C28.4 4 25.1 7.3 25.1 11.4C25.1 11.6 25.1 11.8 25.1 12H25C20.6 12 17 15.6 17 20H42C45.3 20 48 17.3 48 14C48 10.7 45.3 8 42 8C41.8 8 41.6 8 41.4 8.1C40.3 5.7 37.9 4 35 4H32.5Z" fill="#F38020" />
        <path d="M17 20H6C2.7 20 0 17.3 0 14C0 10.7 2.7 8 6 8C6.2 8 6.4 8 6.6 8C7.7 5.7 10.1 4 13 4H15.5C19.6 4 22.9 7.3 22.9 11.4C22.9 11.6 22.9 11.8 22.9 12H23C27.4 12 31 15.6 31 20" fill="#FAAD3F" />
    </svg>
);

const PciDssLogo = () => (
    <div className="flex flex-col items-center bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 px-2 py-1 rounded shadow-sm">
        <span className="text-[10px] font-black tracking-tighter leading-none text-gray-900 dark:text-gray-100">PCI DSS</span>
        <span className="text-[6px] font-medium tracking-wide uppercase text-gray-500 dark:text-gray-400">Compliant</span>
    </div>
);

const Soc2Logo = () => (
    <div className="flex flex-col items-center justify-center bg-gray-900 text-white px-2 py-1 rounded w-auto shadow-sm">
        <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
            <span className="text-[10px] font-bold tracking-tight leading-none">SOC 2</span>
        </div>
        <span className="text-[6px] font-medium uppercase tracking-wider opacity-80">Type II</span>
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
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        product: [
            { label: "Features", href: "/features" },
            { label: "Pricing", href: "/pricing" },
            { label: "About Us", href: "/about" },
            { label: "Success Stories", href: "/success-stories" },
        ],
        resources: [
            { label: "Blog", href: "/blog" },
            { label: "Glossary", href: "/glossary" },
            { label: "Answers (Q&A)", href: "/answers" },
            { label: "Comparisons", href: "/compare" },
            { label: "Immigration Facts", href: "/ai-facts" },
            { label: "Help Center", href: "/dashboard/help" },
            { label: "H-1B Sponsors", href: "/dashboard/career/h1b-sponsors" },
            { label: "Contact", href: "/contact" },
            { label: "Tax Guide", href: "/dashboard/tax-filing" },
            { label: "Report Fraud", href: "/resources/report-fraud" },
        ],
        legal: [
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms of Service", href: "/terms" },
        ],
    };

    return (
        <footer className="bg-gray-50 dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
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
                        <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                            The #1 OPT timeline tracker trusted by 2,500+ international students worldwide.
                        </p>
                    </div>

                    {/* Product */}
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                            Product
                        </h4>
                        <ul className="space-y-3">
                            {footerLinks.product.map((link, index) => (
                                <li key={index}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                            Resources
                        </h4>
                        <ul className="space-y-3">
                            {footerLinks.resources.map((link, index) => (
                                <li key={index}>
                                    <a
                                        href={link.href}
                                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                            Legal
                        </h4>
                        <ul className="space-y-3">

                            {footerLinks.legal.map((link, index) => (
                                <li key={index}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <Link
                                    href="/refund-policy"
                                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    Refund Policy
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/disclaimer"
                                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    Disclaimer
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/cookie-policy"
                                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    Cookie Policy
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        © {currentYear} TrackMyOPT. Made with ❤️ for international students.
                    </p>

                    {/* Trust Badges - Real Brand Logos */}
                    <div className="flex flex-wrap justify-center items-center gap-6 opacity-90 grayscale hover:grayscale-0 transition-all duration-300">
                        <div title="SSL Secured" className="hover:scale-105 transition-transform">
                            <SslLogo />
                        </div>
                        <div title="PCI DSS Compliant" className="hover:scale-105 transition-transform">
                            <PciDssLogo />
                        </div>
                        <div title="SOC 2 Type II" className="hover:scale-105 transition-transform">
                            <Soc2Logo />
                        </div>
                        <div title="Protected by Cloudflare" className="hover:scale-105 transition-transform">
                            <CloudflareLogo />
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
