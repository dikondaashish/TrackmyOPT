"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MessageCircle, Clock, Send, CheckCircle, HelpCircle, FileText, CreditCard, Bug, ChevronDown } from "lucide-react";
import { LandingNavbar } from "../../components/landing/LandingNavbar";
import { LandingFooter } from "../../components/landing/LandingFooter";
import { FeatureHero } from "../../components/features/FeatureHero";
import { FeatureCTA } from "../../components/features/FeatureCTA";
import { SmartContactForm } from "@/components/features/SmartContactForm";

// Contact Visual
function ContactVisual() {
    return (
        <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl blur-2xl opacity-20" />
            <div className="relative bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 p-8 shadow-2xl">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Support Team Online</span>
                </div>

                <div className="space-y-4 mb-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gray-100 dark:bg-zinc-800 rounded-2xl rounded-bl-sm p-4"
                    >
                        <p className="text-sm text-gray-900 dark:text-white">Hi! How can we help you today?</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-blue-600 rounded-2xl rounded-br-sm p-4 ml-8"
                    >
                        <p className="text-sm text-white">I have a question about my OPT timeline...</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-gray-100 dark:bg-zinc-800 rounded-2xl rounded-bl-sm p-4"
                    >
                        <p className="text-sm text-gray-900 dark:text-white">Of course! I'd be happy to help. Let me check that for you.</p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
                        <Clock className="w-5 h-5 text-green-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-green-700 dark:text-green-300">&lt;4h</p>
                        <p className="text-xs text-green-600 dark:text-green-400">Response Time</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                        <CheckCircle className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                        <p className="text-lg font-bold text-blue-700 dark:text-blue-300">98%</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">Resolution Rate</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Support Channels
function SupportChannels() {
    const channels = [
        { icon: Mail, title: "Email Support", description: "support@trackmyopt.com", detail: "Response within 4 hours", color: "blue" },
        { icon: MessageCircle, title: "Live Chat", description: "Chat with our team", detail: "Available 9am-6pm EST", color: "green" },
        { icon: HelpCircle, title: "Help Center", description: "Browse FAQs & guides", detail: "24/7 self-service", color: "purple" },
    ];

    return (
        <section className="py-24 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
                        <Mail className="w-4 h-4" />
                        Support Channels
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
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
                            className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 hover:border-blue-500/50 transition-colors text-center"
                        >
                            <div className={`w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center ${channel.color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                                channel.color === 'green' ? 'bg-gradient-to-br from-green-500 to-teal-600' :
                                    'bg-gradient-to-br from-purple-500 to-pink-600'
                                }`}>
                                <channel.icon className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{channel.title}</h3>
                            <p className="text-blue-600 dark:text-blue-400 font-medium mb-1">{channel.description}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{channel.detail}</p>
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
        { icon: FileText, title: "OPT & Compliance", description: "Questions about tracking, deadlines, and status" },
        { icon: CreditCard, title: "Billing & Premium", description: "Subscription, payments, and refunds" },
        { icon: Bug, title: "Technical Issues", description: "Bugs, errors, and feature requests" },
        { icon: HelpCircle, title: "Account & Settings", description: "Login, profile, and preferences" },
    ];

    return (
        <section className="py-24 bg-gray-50 dark:bg-zinc-900/50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
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
                            className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-5 hover:border-blue-500/50 transition-colors cursor-pointer"
                        >
                            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-primary mb-3">
                                <cat.icon className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{cat.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{cat.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// Contact Form
function ContactForm() {
    const [isSubmitted, setIsSubmitted] = useState(false);

    if (isSubmitted) {
        return (
            <section className="py-24">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-8 text-center"
                    >
                        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 mx-auto mb-4">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Message Sent!</h3>
                        <p className="text-gray-600 dark:text-gray-400">We'll get back to you within 4 hours.</p>
                    </motion.div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-24">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-8"
                >
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Send Us a Message
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Fill out the form and we'll get back to you shortly
                    </p>
                </motion.div>

                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    onSubmit={(e) => { e.preventDefault(); setIsSubmitted(true); }}
                    className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 lg:p-8"
                >
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Name</label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Your name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Email</label>
                            <input
                                type="email"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="your@email.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Topic</label>
                        <select className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>OPT & Compliance</option>
                            <option>Billing & Premium</option>
                            <option>Technical Issues</option>
                            <option>Account & Settings</option>
                            <option>Other</option>
                        </select>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Message</label>
                        <textarea
                            rows={5}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            placeholder="How can we help?"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all"
                    >
                        <Send className="w-5 h-5" />
                        Send Message
                    </button>
                </motion.form>
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
        <section className="py-24 bg-gray-50 dark:bg-zinc-900/50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                        Frequently Asked Questions
                    </h2>
                </motion.div>

                <div className="space-y-3">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
                            >
                                <span className="font-medium text-gray-900 dark:text-white">{faq.question}</span>
                                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
                            </button>
                            {openIndex === index && (
                                <div className="px-6 pb-4 text-gray-600 dark:text-gray-400">
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
        <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
            <LandingNavbar />

            {/* Hero */}
            <FeatureHero
                badge="Contact Us"
                headline="We're Here to Help"
                subheadline="Have a question or need assistance? Our team is ready to help you get the most out of TrackMyOPT. Response time under 4 hours."
                ctaText="Email Us"
                ctaHref="mailto:support@trackmyopt.com"
                secondaryCta={{
                    text: "Help Center",
                    href: "/help"
                }}
                gradient="from-blue-600 to-indigo-600"
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
                subheadline="Join thousands of students managing their OPT journey with TrackMyOPT."
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
