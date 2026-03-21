"use client";

import { motion } from "framer-motion";
import { GlobalTalentGlobe } from "@/components/features/GlobalTalentGlobe";
import { ArrowRight, Users, Globe2, MessageSquare } from "lucide-react";
import Link from "next/link";

export function LandingGlobalReach() {
    return (
        <section className="py-24 bg-white dark:bg-zinc-950 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 dark:bg-blue-900/10 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen opacity-50" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left: Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative z-10 prose-longform"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 text-sm font-medium mb-6">
                            <Globe2 className="w-4 h-4" />
                            Global Network
                        </div>

                        <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                            Your Network is Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">
                                Net Worth
                            </span>
                        </h2>

                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                            We have over 50,000 HR, technical leads, and managers' company email IDs to contact. This helps for cold emailing to navigate the complex US job market. Get referrals, share interview intel, and stay compliant together.
                        </p>

                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div>
                                <h4 className="text-3xl font-bold text-gray-900 dark:text-white">50k+</h4>
                                <p className="text-sm text-gray-500">Active Company Emails</p>
                            </div>
                            <div>
                                <h4 className="text-3xl font-bold text-gray-900 dark:text-white">120+</h4>
                                <p className="text-sm text-gray-500">Companies Represented</p>
                            </div>
                        </div>

                        <Link href="/features/community" className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:gap-3 transition-all group">
                            Join the Community
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>

                    {/* Right: Globe Visual with Floating Companies */}
                    <div className="relative">
                        {/* Floating Logos - Left Column */}
                        <div className="absolute -left-12 top-0 bottom-0 flex flex-col justify-center gap-6 z-20 pointer-events-none hidden md:flex">
                            <FloatingBadge
                                icon={<GoogleLogo />}
                                name="Google"
                                delay={0}
                            />
                            <FloatingBadge
                                icon={<MicrosoftLogo />}
                                name="Microsoft"
                                delay={1.5}
                            />
                            <FloatingBadge
                                icon={<AmazonLogo />}
                                name="Amazon"
                                delay={3}
                            />
                        </div>

                        {/* Floating Logos - Right Column */}
                        <div className="absolute -right-12 top-0 bottom-0 flex flex-col justify-center gap-8 z-20 pointer-events-none hidden md:flex">
                            <FloatingBadge
                                icon={<MetaLogo />}
                                name="Meta"
                                delay={0.5}
                            />
                            <FloatingBadge
                                icon={<NetflixLogo />}
                                name="Netflix"
                                delay={2}
                            />
                            <FloatingBadge
                                icon={<TeslaLogo />}
                                name="Tesla"
                                delay={3.5}
                            />
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <GlobalTalentGlobe />
                        </motion.div>
                    </div>
                </div>
            </div>
        </section >
    );
}

function FloatingBadge({ icon, name, delay }: { icon: React.ReactNode, name: string, delay: number }) {
    return (
        <motion.div
            className="flex items-center gap-3 bg-white dark:bg-zinc-800 px-4 py-2.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 dark:border-zinc-700"
            animate={{
                y: [-10, 10, -10],
                rotate: [-2, 2, -2]
            }}
            transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: delay
            }}
        >
            <div className="w-8 h-8 flex items-center justify-center">
                {icon}
            </div>
            <span className="font-medium text-gray-700 dark:text-gray-200">{name}</span>
        </motion.div>
    );
}

// Brand Logos (Official Colors & Shapes)
const GoogleLogo = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const MicrosoftLogo = () => (
    <svg viewBox="0 0 23 23" className="w-5 h-5">
        <path fill="#f35325" d="M1 1h10v10H1z" />
        <path fill="#81bc06" d="M12 1h10v10H12z" />
        <path fill="#05a6f0" d="M1 12h10v10H1z" />
        <path fill="#ffba08" d="M12 12h10v10H12z" />
    </svg>
);

const AmazonLogo = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6">
        <path d="M15.5 16.63c-2.3 1.76-5 2.8-7.82 2.8-3.05 0-5.83-1.04-7.68-2.67l.86-1.5c1.78 1.48 4.14 2 6.82 2 2.37 0 4.67-.84 6.7-2.25l1.12 1.62z" fill="#FF9900" />
        <path d="M18.66 12.87c.2-1.93.3-3.62.3-5.06 0-3.18-.75-5.32-2.3-6.52-1.54-1.2-4.04-1.8-7.5-1.8-4.3 0-7.3 1.07-8.98 3.2l2.12 2.52c1.03-1.6 3-2.4 5.95-2.4 1.95 0 3.35.33 4.2.98.85.65 1.28 1.8 1.28 3.45 0 .28-.02.66-.05 1.13l-1.6-.1c-2.88-.17-5.03.23-6.42 1.2-1.4 1-2.1 2.38-2.1 4.17 0 1.63.6 3 1.77 4.08 1.18 1.1 2.76 1.64 4.75 1.64 2.5 0 4.38-.83 5.6-2.5l.3 2.15h3.3v-8.8l-.02-1.67-2.43 2.33zm-4.66 4.7c-1.03 0-1.85-.3-2.47-.9-.6-.62-.93-1.4-.93-2.33 0-1 .37-1.8 1.1-2.4.73-.6 1.82-.9 3.25-.9l1.45.1v1.68c0 1.58-.52 2.83-1.56 3.76-.23.2-.5.5-.84.9z" fill="#000000" className="dark:fill-white" />
    </svg>
);

const MetaLogo = () => (
    <svg viewBox="0 0 24 24" className="w-6 h-6">
        <defs>
            <linearGradient id="meta-gradient" x1="2.15" y1="17.61" x2="21.53" y2="6.67" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#0062E0" />
                <stop offset="0.5" stopColor="#19AFFF" />
                <stop offset="1" stopColor="#0062E0" />
            </linearGradient>
        </defs>
        <path d="M12 12.75c-2.43 0-3.95-1.29-5.18-2.62C5.9 9.17 5 8.23 4.03 8.23c-1.55 0-2.4 1.25-2.4 2.94 0 1.96 1.23 3.52 3.12 3.52 1.27 0 2.22-.84 3.07-1.74.88-1.03 1.6-1.87 3.32-1.87s3.57 2.06 4.54 3.17c1.32 1.34 2.45 2.1 4.58 2.1 2.7 0 3.73-2.06 3.73-3.83 0-2.03-1.07-3.69-3.73-3.69-2.06 0-3.26 1.19-4.24 2.15-.9.84-2.17 1.77-4.02 1.77zm0-6.17c2.6 0 4.19 1.41 5.48 2.76.99 1.03 1.93 1.84 3.02 1.84.88 0 1.35-.6 1.35-1.52 0-1.39-1-2.81-2.43-2.81-1.32 0-2.15.75-2.92 1.47-.94.88-1.85 1.93-3.64 1.93-2.08 0-3.15-1.25-4.23-2.33C7.45 6.72 6.35 6 4.96 6 2.08 6 .22 8.44.22 11.2c0 2.81 1.74 4.88 3.84 4.88 2.22 0 3.88-1.7 4.97-2.99 1.05-1.25 1.93-2.1 3.82-2.1z" fill="url(#meta-gradient)" />
    </svg>
);

const NetflixLogo = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path d="M6.3 3.5v17h3.8V10l6.2 10.5h3.8v-17h-3.8v10.5L10.1 3.5H6.3z" fill="#E50914" />
        <path d="M10.1 3.5l6.2 10.5v-10.5h3.8v-1" fill="rgba(0,0,0,0.1)" /> {/* Subtle Shadow Fold */}
    </svg>
);

const TeslaLogo = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path d="M12 1.5C6.1 1.5 1.9 2.6.2 3.8l1.4 1.8c.3-.3 4.2-2.5 10.4-2.5 6.2 0 10.1 2.2 10.4 2.5l1.4-1.8C22.1 2.6 17.9 1.5 12 1.5zM12 5.2c-3.3 0-6 .6-8 1.6l1.3 2.5c.3-.2 2.9-1.3 6.7-1.3 3.8 0 6.4 1.1 6.7 1.3l1.3-2.5c-2-1-4.7-1.6-8-1.6zm-1.8 3.8L9.1 22.5h5.8L13.8 9c-.5-.2-1.2-.2-1.8 0z" fill="#E31937" className="dark:fill-white" />
    </svg>
);
