"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { Menu, X, ArrowRight, LayoutDashboard, Settings, HelpCircle, LogOut, ChevronDown, Shield, Building2, Chrome, Briefcase, FileText, Users, Star, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOutWithAnalytics } from "@/lib/auth/signOutWithAnalytics";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { UserProfileMenu } from "@/components/layout/UserProfileMenu";
import { ResumePromoBanner } from "@/components/promo/ResumePromoBanner";

export function LandingNavbar() {
    const prefersReducedMotion = usePrefersReducedMotion();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
    const [isAboutOpen, setIsAboutOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    // Check auth state
    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // 2x2 grid features for dropdown
    const featureLinks = [
        { name: "OPT Compliance Hub", href: "/features/compliance", icon: Shield, description: "Track deadlines & stay legal" },
        { name: "H-1B Sponsor Intelligence", href: "/features/sponsors", icon: Building2, description: "Research 25,000+ sponsors" },
        { name: "Chrome Extension", href: "/features/extension", icon: Chrome, description: "Sponsor intel on LinkedIn" },
        { name: "Job Application Tracker", href: "/features/job-tracker", icon: Briefcase, description: "Track apps & unemployment" },
    ];

    const navLinks = [
        { name: "Blog", href: "/blog" },
        { name: "Contact Us", href: "/contact" },
    ];

    const aboutLinks = [
        { name: "About Us", href: "/about", icon: Users, description: "Our story & mission" },
        { name: "Success Stories", href: "/success-stories", icon: Star, description: "Student testimonials" },
    ];

    return (
        <>
        <ResumePromoBanner variant="marketing" />
        {/* ponytail: initial={false} — skip slide-in so SSR HTML matches client (hydration #418). */}
        <motion.nav
            initial={false}
            animate={{ y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : undefined}
            style={{ top: "var(--tmopt-marketing-promo, 0px)" }}
            className={`fixed left-0 right-0 z-50 transition-all duration-300 bg-white dark:bg-zinc-950 ${isScrolled
                ? "border-b border-border py-3 shadow-sm"
                : "py-4 shadow-sm"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-8 h-8 sm:w-10 sm:h-10 transition-transform duration-300 group-hover:scale-110">
                            <Image
                                src="/TrackMyOPT Logo/Favicon.png"
                                alt="TrackMyOPT Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <span className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                            TrackMyOPT
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        {/* Home */}
                        <Link
                            href="/"
                            className="text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            Home
                        </Link>

                        {/* AI Resume Doctor - Direct Link */}
                        <Link
                            href="/features/resume-ai"
                            className="text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            AI Resume Doctor
                        </Link>

                        {/* Features Dropdown */}
                        <div
                            className="relative"
                            onMouseEnter={() => setIsFeaturesOpen(true)}
                            onMouseLeave={() => setIsFeaturesOpen(false)}
                        >
                            <button
                                className="flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                            >
                                Features
                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isFeaturesOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isFeaturesOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[420px] bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-800 overflow-hidden z-50"
                                    >
                                        {/* 2x2 Grid */}
                                        <div className="p-3 grid grid-cols-2 gap-2">
                                            {featureLinks.map((feature) => (
                                                <Link
                                                    key={feature.name}
                                                    href={feature.href}
                                                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors group"
                                                >
                                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                                        <feature.icon className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                            {feature.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {feature.description}
                                                        </p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                        <div className="border-t border-gray-100 dark:border-zinc-800 p-2">
                                            <Link
                                                href="/features"
                                                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-sm font-medium text-blue-600 dark:text-blue-400"
                                            >
                                                View All Features
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* About Us Dropdown */}
                        <div
                            className="relative"
                            onMouseEnter={() => setIsAboutOpen(true)}
                            onMouseLeave={() => setIsAboutOpen(false)}
                        >
                            <button
                                className="flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                            >
                                About Us
                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isAboutOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isAboutOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-gray-200 dark:border-zinc-800 overflow-hidden z-50"
                                    >
                                        <div className="p-2">
                                            {aboutLinks.map((link) => (
                                                <Link
                                                    key={link.name}
                                                    href={link.href}
                                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors group"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-primary flex-shrink-0">
                                                        <link.icon className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                            {link.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {link.description}
                                                        </p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}

                        {/* For Orgs */}
                        <Link
                            href="/partnerships"
                            className="text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            For Orgs
                        </Link>
                    </div>

                    {/* Desktop CTAs */}
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white transition-all bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5"
                                >
                                    <LayoutDashboard className="w-4 h-4 mr-2" />
                                    Dashboard
                                </Link>

                                <UserProfileMenu
                                    userEmail={user.email}
                                    userName={user.user_metadata?.full_name || user.user_metadata?.name}
                                    isCollapsed={true}
                                    // We don't fetch subscription status on landing page to keep it light
                                    // passing default values
                                    isPremium={false}
                                    isLoading={false}
                                    side="top"
                                    align="end"
                                />
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href="/login"
                                    className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white transition-all bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        type="button"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden flex h-11 min-h-[44px] w-11 min-w-[44px] items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={prefersReducedMotion ? { duration: 0.15 } : undefined}
                        className="flex max-h-[min(85dvh,calc(100dvh-7rem))] flex-col overflow-hidden border-b border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 md:hidden"
                    >
                        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-4">
                            {/* Home */}
                            <Link
                                href="/"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex min-h-[44px] items-center rounded-lg px-2 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-zinc-800 dark:hover:text-blue-400"
                            >
                                Home
                            </Link>

                            {/* AI Resume Doctor */}
                            <Link
                                href="/features/resume-ai"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex min-h-[44px] items-center rounded-lg px-2 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-zinc-800 dark:hover:text-blue-400"
                            >
                                AI Resume Doctor
                            </Link>

                            {/* Features Section */}
                            <div className="pt-2 pb-2">
                                <p className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Features</p>
                                <div className="space-y-1">
                                    {featureLinks.map((feature) => (
                                        <Link
                                            key={feature.name}
                                            href={feature.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex min-h-[44px] items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-zinc-800 dark:hover:text-blue-400"
                                        >
                                            <feature.icon className="w-4 h-4 text-primary" />
                                            {feature.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* About Section */}
                            <div className="pt-2 pb-2">
                                <p className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">About</p>
                                <div className="space-y-1">
                                    {aboutLinks.map((link) => (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex min-h-[44px] items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-zinc-800 dark:hover:text-blue-400"
                                        >
                                            <link.icon className="w-4 h-4 text-primary" />
                                            {link.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Blog */}
                            <Link
                                href="/blog"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex min-h-[44px] items-center gap-3 rounded-lg px-2 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-zinc-800 dark:hover:text-blue-400"
                            >
                                <BookOpen className="w-4 h-4 text-primary" />
                                Blog
                            </Link>

                            {/* Contact Us */}
                            <Link
                                href="/contact"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex min-h-[44px] items-center rounded-lg px-2 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-zinc-800 dark:hover:text-blue-400"
                            >
                                Contact Us
                            </Link>

                            {/* For Orgs */}
                            <Link
                                href="/partnerships"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex min-h-[44px] items-center rounded-lg px-2 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-blue-600 dark:text-gray-200 dark:hover:bg-zinc-800 dark:hover:text-blue-400"
                            >
                                For Orgs
                            </Link>
                            <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 flex flex-col gap-3">
                                {user ? (
                                    <>
                                        <div className="flex items-center gap-3 px-2 py-2">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-sm">
                                                {(user.user_metadata?.full_name?.[0] || user.email?.[0] || "U").toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                    {user.user_metadata?.full_name || user.user_metadata?.name || "User"}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>

                                        <Link
                                            href="/dashboard"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700"
                                        >
                                            <LayoutDashboard className="w-4 h-4 mr-2" />
                                            Dashboard
                                        </Link>

                                        <div className="space-y-1 pt-2">
                                            <Link
                                                href="/dashboard/settings"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex min-h-[44px] items-center gap-3 rounded-lg px-2 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-zinc-800 dark:hover:text-blue-400"
                                            >
                                                <Settings className="w-4 h-4" />
                                                Settings
                                            </Link>
                                            <Link
                                                href="/dashboard/help"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex min-h-[44px] items-center gap-3 rounded-lg px-2 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-zinc-800 dark:hover:text-blue-400"
                                            >
                                                <HelpCircle className="w-4 h-4" />
                                                Help & Support
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    await signOutWithAnalytics("navbar");
                                                    setIsMobileMenuOpen(false);
                                                    setUser(null);
                                                    router.refresh();
                                                }}
                                                className="flex min-h-[44px] w-full items-center gap-3 rounded-lg px-2 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Sign out
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:bg-zinc-800 dark:text-gray-200 dark:hover:bg-zinc-700"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href="/login"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-md transition-all hover:from-blue-700 hover:to-indigo-700"
                                        >
                                            Get Started Free
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
        {/* Reserves space for fixed banner + navbar so page content is not hidden underneath */}
        <div
            className="h-[calc(5rem+var(--tmopt-marketing-promo,0px))] w-full shrink-0"
            aria-hidden
        />
        </>
    );
}
