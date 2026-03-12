"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
    ArrowRight,
    Chrome,
    CheckCircle2,
    Zap,
    Shield,
    Eye,
    Linkedin,
    Globe,
    Lock,
    Download,
    Monitor,
    Smartphone,
    Clock,
    XCircle,
    TrendingUp
} from "lucide-react";
import Image from "next/image";
import { FeatureHero } from "@/components/features/FeatureHero";
import { FeatureFAQ } from "@/components/features/FeatureFAQ";
import { FeatureServiceSchema } from "@/components/features/FeatureServiceSchema";
import { FeatureWhyMatters } from "@/components/features/FeatureWhyMatters";
import { FeatureTestimonial } from "@/components/features/FeatureTestimonial";
import { FeatureCTA } from "@/components/features/FeatureCTA";


import { ExtensionOverlayVisual } from "@/components/features/ExtensionOverlayVisual";
import { ExtensionDemo } from "@/components/features/ExtensionDemo";
import { VerificationBadgePopup } from "@/components/features/VerificationBadgePopup";
import { H2, Lead, P } from "@/components/ui/typography";

// Browser Overlay (Replacing previous mockup)
function BrowserVisual() {
    return <ExtensionOverlayVisual />;
}

// Platform Grid
function PlatformGrid() {
    const platforms = [
        { name: "LinkedIn", icon: Linkedin, status: "live" },
        { name: "Indeed", icon: Globe, status: "live" },
        { name: "Glassdoor", icon: Globe, status: "coming" },
        { name: "Handshake", icon: Globe, status: "coming" },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {platforms.map((platform, i) => (
                <motion.div
                    key={platform.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="relative bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 text-center hover:shadow-lg transition-shadow group"
                >
                    {platform.status === 'coming' && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs rounded-full font-medium">
                            Soon
                        </span>
                    )}
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${platform.status === 'live'
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/20'
                        : 'bg-gray-200 dark:bg-zinc-700'
                        }`}>
                        <platform.icon className={`w-6 h-6 ${platform.status === 'live' ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white">{platform.name}</p>
                </motion.div>
            ))}
        </div>
    );
}

// Privacy Checklist
function PrivacyChecklist() {
    const items = [
        "No data collection or tracking",
        "Works entirely in your browser",
        "No account required to use",
        "Open source & auditable",
    ];

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Lock className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Privacy First</h4>
                    <p className="text-sm text-gray-500">Your data stays yours</p>
                </div>
            </div>
            <div className="space-y-3">
                {items.map((item, i) => (
                    <motion.div
                        key={item}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl"
                    >
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{item}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

export default function ExtensionPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
            <FeatureServiceSchema
                name="H-1B Sponsor Intel Chrome Extension"
                description="See H-1B sponsorship history, E-Verify enrollment status, and fraud alerts directly on LinkedIn and Indeed job listings. Make informed job search decisions without leaving your browser."
                featurePath="/features/extension"
                faqItems={[
                  {question: "Which job sites does the extension work on?", answer: "Currently LinkedIn and Indeed, with Glassdoor coming soon. We show sponsor badges and H-1B filing history directly on job listings."},
                  {question: "What data does the extension access?", answer: "The extension only reads job listing page content to identify company names. It never accesses your personal data, messages, or login credentials."},
                  {question: "Is the extension really free?", answer: "Yes, forever! The extension is completely free with no premium version. We believe job seekers shouldn't pay for this essential information."},
                  {question: "Where does the H-1B data come from?", answer: "We use official Department of Labor LCA filings, USCIS data, and E-Verify records. Data is updated quarterly to ensure accuracy."},
                  {question: "Does it slow down my browser?", answer: "No, the extension is lightweight and only activates on job sites. It uses minimal resources and won't affect your browsing speed."},
                  {question: "Can I trust this extension with my data?", answer: "Absolutely. We collect zero personal data, have no analytics, and never track your browsing. The extension is open for security audits."}
                ]}
            />
            {/* Hero */}
            <FeatureHero
                badge="Free"
                headline="Sponsor Intel. Right on LinkedIn."
                subheadline="See H-1B history, E-Verify status, and fraud alerts directly on job listings—without leaving your job search."
                ctaText="Add to Chrome - Free"
                ctaHref="https://chromewebstore.google.com/detail/hfljbefkccdmlnhclfojlafipjnjbajm?utm_source=item-share-cb"
                secondaryCta={{
                    text: "See Demo",
                    href: "#demo"
                }}
                visual={<ExtensionDemo />}
            />

            {/* Features */}
            <section id="demo" className="py-24 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
                                <Zap className="w-4 h-4" />
                                Instant Intel
                            </div>
                            <H2>Make Smarter Applications</H2>
                            <P>
                                See sponsor data right where you need it—on job listings.
                                No more switching tabs or manual research.
                            </P>
                            <ul className="space-y-4 mb-8">
                                {[
                                    "E-Verify enrollment status",
                                    "Historical H-1B sponsorship count",
                                    "Approval rate trends",
                                    "Virtual office warnings"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                        <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            {/* Interactive Mini-Demo (Badge Hover) */}
                            <div className="p-6 bg-white dark:bg-zinc-900/50 rounded-2xl border border-gray-100 dark:border-zinc-800">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Try hovering over the badge:</p>
                                <div className="flex justify-center py-4">
                                    <VerificationBadgePopup />
                                </div>
                            </div>

                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            {/* Decorative elements behind visual */}
                            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-20 blur-2xl rounded-full" />
                            <ExtensionOverlayVisual />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Platforms */}
            <section className="py-24 bg-gray-50 dark:bg-zinc-900/50 relative overflow-hidden">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
                            <Globe className="w-4 h-4" />
                            Works Everywhere
                        </div>
                        <H2>Supported Platforms</H2>
                        <Lead>
                            Get sponsor intel on the job boards you already use.
                        </Lead>
                    </motion.div>

                    <PlatformGrid />
                </div>
            </section>

            {/* Privacy */}
            <section className="py-24 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <PrivacyChecklist />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-4">
                                <Shield className="w-4 h-4" />
                                Privacy First
                            </div>
                            <H2>Your Data Stays Private</H2>
                            <P>
                                We don't track your browsing, store your data, or sell your information.
                                The extension works entirely in your browser.
                            </P>
                            <ul className="space-y-4">
                                {[
                                    "No analytics or tracking",
                                    "Data fetched on-demand only",
                                    "Minimal permissions required",
                                    "Regular security audits"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Why This Matters Section */}
            <FeatureWhyMatters
                headline="Job Searching Without Data is Guessing"
                description="Most job seekers waste hours applying to companies that don't sponsor visas. Our extension puts H-1B data directly on job listings so you know before you apply."
                accentColor="cyan"
                stats={[
                    { value: "3+ hrs", label: "Saved per week on research", icon: <Clock className="w-5 h-5" /> },
                    { value: "Free", label: "Forever—no hidden costs", icon: <Shield className="w-5 h-5" /> },
                    { value: "5 sec", label: "To see sponsor history", icon: <Zap className="w-5 h-5" /> },
                    { value: "100%", label: "Privacy focused", icon: <Lock className="w-5 h-5" /> },
                ]}
            />

            {/* Testimonial */}
            <FeatureTestimonial
                quote="I used to spend 30 minutes researching each company before applying. Now I just look at the badge on LinkedIn and know instantly if they sponsor. Game changer."
                author={{
                    name: "Amit Patel",
                    role: "Frontend Developer, OPT",
                    university: "NYU",
                }}
                accentColor="cyan"
            />

            {/* FAQ Section */}
            <FeatureFAQ
                title="Chrome Extension FAQ"
                subtitle="Common questions about the TrackMyOPT extension"
                accentColor="cyan"
                items={[
                    {
                        question: "Which job sites does the extension work on?",
                        answer: "Currently LinkedIn and Indeed, with Glassdoor coming soon. We show sponsor badges and H-1B filing history directly on job listings."
                    },
                    {
                        question: "What data does the extension access?",
                        answer: "The extension only reads job listing page content to identify company names. It never accesses your personal data, messages, or login credentials."
                    },
                    {
                        question: "Is the extension really free?",
                        answer: "Yes, forever! The extension is completely free with no premium version. We believe job seekers shouldn't pay for this essential information."
                    },
                    {
                        question: "Where does the H-1B data come from?",
                        answer: "We use official Department of Labor LCA filings, USCIS data, and E-Verify records. Data is updated quarterly to ensure accuracy."
                    },
                    {
                        question: "Does it slow down my browser?",
                        answer: "No, the extension is lightweight and only activates on job sites. It uses minimal resources and won't affect your browsing speed."
                    },
                    {
                        question: "Can I trust this extension with my data?",
                        answer: "Absolutely. We collect zero personal data, have no analytics, and never track your browsing. The extension is open for security audits."
                    },
                ]}
            />

            {/* Final CTA */}
            <FeatureCTA
                headline="Make Smarter Career Moves"
                subheadline="See which companies sponsor H-1B visas right on LinkedIn and Indeed. No more wasted applications."
                primaryCTA={{
                    text: "Add to Chrome—Free Forever",
                    href: "https://chromewebstore.google.com/detail/hfljbefkccdmlnhclfojlafipjnjbajm?utm_source=item-share-cb",
                }}
                secondaryCTA={{
                    text: "See Demo",
                    href: "/features/extension#demo",
                }}
                gradient="cyan"
                icon={<Chrome className="w-12 h-12 text-white" />}
                badge="Free Forever"
            />
        </main>
    );
}
