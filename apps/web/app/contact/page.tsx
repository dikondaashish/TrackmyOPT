"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MessageCircle, HelpCircle, FileText, CreditCard, Bug, ChevronDown } from "lucide-react";
import { LandingNavbar } from "../../components/landing/LandingNavbar";
import { LandingFooter } from "../../components/landing/LandingFooter";
import { FeatureHero } from "../../components/features/FeatureHero";
import { FeatureCTA } from "../../components/features/FeatureCTA";
import { SmartContactForm } from "@/components/features/SmartContactForm";

// Contact Visual
function ContactVisual() {
    return (
        <div className="relative">
            <div className="relative rounded-xl border border-border bg-card p-8 shadow-elevated">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-sm font-medium text-muted-foreground">Support Team Online</span>
                </div>

                <div className="space-y-4 mb-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-muted rounded-xl rounded-bl-sm p-4"
                    >
                        <p className="text-sm text-foreground">Hi! How can we help you today?</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-blue-600 rounded-xl rounded-br-sm p-4 ml-8"
                    >
                        <p className="text-sm text-white">I have a question about my OPT timeline...</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-muted rounded-xl rounded-bl-sm p-4"
                    >
                        <p className="text-sm text-foreground">Of course! I'd be happy to help. Let me check that for you.</p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4 text-center dark:border-emerald-900 dark:bg-emerald-950">
                        <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">&lt;4h</p>
                        <p className="text-xs text-emerald-700 dark:text-emerald-300">Response Time</p>
                    </div>
                    <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-center dark:border-blue-900 dark:bg-blue-950">
                        <p className="text-lg font-bold text-blue-700 dark:text-blue-300">98%</p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">Resolution Rate</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Support Channels
function SupportChannels() {
    const channels = [
        { icon: Mail, title: "Email Support", description: "support@trackmyopt.com", detail: "Response within 4 hours", tile: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300" },
        { icon: MessageCircle, title: "Live Chat", description: "Chat with our team", detail: "Available 9am-6pm EST", tile: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300" },
        { icon: HelpCircle, title: "Help Center", description: "Browse FAQs & guides", detail: "24/7 self-service", tile: "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300" },
    ];

    return (
        <section className="py-24 relative bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                        Multiple Ways to Reach Us
                    </h2>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6">
                    {channels.map((channel, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="surface-card p-6 text-center"
                        >
                            <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${channel.tile}`}>
                                <channel.icon className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-1">{channel.title}</h3>
                            <p className="text-foreground font-medium mb-1 break-words">{channel.description}</p>
                            <p className="text-sm text-muted-foreground">{channel.detail}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// Help Categories
function HelpCategories() {
    const categories = [
        { icon: FileText, title: "OPT & Compliance", description: "Questions about tracking, deadlines, and status", tile: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300" },
        { icon: CreditCard, title: "Billing & Premium", description: "Subscription, payments, and refunds", tile: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300" },
        { icon: Bug, title: "Technical Issues", description: "Bugs, errors, and feature requests", tile: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300" },
        { icon: HelpCircle, title: "Account & Settings", description: "Login, profile, and preferences", tile: "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300" },
    ];

    return (
        <section className="py-24 bg-surface border-y border-border">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                        What Can We Help With?
                    </h2>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {categories.map((cat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            className="surface-card p-5"
                        >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${cat.tile}`}>
                                <cat.icon className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-foreground mb-1">{cat.title}</h3>
                            <p className="text-sm leading-6 text-muted-foreground">{cat.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// FAQ Section
function ContactFAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const faqs = [
        { question: "What are your support hours?", answer: "Our team is available Monday-Friday, 9am-6pm EST. We respond to all emails within 4 hours during business hours." },
        { question: "How do I reset my password?", answer: "Click 'Forgot Password' on the login page. You'll receive an email with a reset link within a few minutes." },
        { question: "How do I upgrade to Premium?", answer: "Go to Settings > Subscription in your dashboard. You can upgrade with a credit card or use our student discount code." },
        { question: "Can I get a refund?", answer: "For eligible Pro accounts, only the $0.99 introductory charge is refundable during the first 7 days; regular Pro renewal charges are not refundable for change of mind. Dedicated includes a 3-day money-back guarantee on its first subscription charge only. See our Refund Policy for legally required exceptions, billing errors, or unauthorized charges." },
    ];

    return (
        <section className="py-24 bg-surface border-y border-border">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                        Frequently Asked Questions
                    </h2>
                </motion.div>

                <div className="surface-card divide-y divide-border overflow-hidden">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="overflow-hidden"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full min-h-14 px-6 py-4 flex items-center justify-between gap-4 text-left hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                            >
                                <span className="font-semibold text-foreground">{faq.question}</span>
                                <ChevronDown className={`w-5 h-5 shrink-0 text-muted-foreground transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
                            </button>
                            {openIndex === index && (
                                <div className="px-6 pb-5 leading-7 text-muted-foreground">
                                    {faq.answer}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-background">
            <LandingNavbar />

            {/* Hero */}
            <FeatureHero
                headline="We're Here to Help"
                subheadline="Have a question or need assistance? Our team is ready to help you get the most out of TrackMyOPT. Response time under 4 hours."
                ctaText="Email Us"
                ctaHref="mailto:support@trackmyopt.com"
                secondaryCta={{
                    text: "Help Center",
                    href: "/help"
                }}
                gradient="bg-blue-600"
                visual={<ContactVisual />}
            />

            {/* Support Channels */}
            <SupportChannels />

            {/* Help Categories */}
            <HelpCategories />

            {/* Contact Form */}
            <SmartContactForm />

            {/* FAQ */}
            <ContactFAQ />

            {/* CTA */}
            <FeatureCTA
                headline="Ready to Get Started?"
                subheadline="Use TrackMyOPT to plan and manage your OPT journey."
                primaryCTA={{
                    text: "Start Free Today",
                    href: "/login",
                }}
                secondaryCTA={{
                    text: "See Features",
                    href: "/features",
                }}
                gradient="blue"
                icon={<Mail className="w-12 h-12 text-white" />}
            />

            <LandingFooter />
        </main>
    );
}
