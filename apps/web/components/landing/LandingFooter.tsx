"use client";

import Link from "next/link";
import { Lock, Shield, CreditCard, Database } from "lucide-react";

export function LandingFooter() {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        product: [
            { label: "Features", href: "#features" },
            { label: "Pricing", href: "#pricing" },
            { label: "FAQ", href: "#faq" },
            { label: "Dashboard", href: "/login" },
        ],
        resources: [
            { label: "Help Center", href: "/dashboard/help" },
            { label: "H-1B Sponsors", href: "/dashboard/career/h1b-sponsors" },
            { label: "Tax Guide", href: "/dashboard/tax-filing" },
            { label: "Contact", href: "mailto:support@trackmyopt.com" },
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
                            The #1 OPT timeline tracker trusted by 15,000+ international students worldwide.
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

                    {/* Trust Badges */}
                    <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 opacity-80 hover:opacity-100 transition-opacity">
                            <Lock className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                            <span>SSL Secured</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 opacity-80 hover:opacity-100 transition-opacity">
                            <CreditCard className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            <span>PCI DSS Compliant</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 opacity-80 hover:opacity-100 transition-opacity">
                            <Database className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                            <span>SOC2 Standard</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 opacity-80 hover:opacity-100 transition-opacity">
                            <Shield className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                            <span>Cloudflare Protected</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
