"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Building2, GraduationCap, Megaphone, Users, Clock, Shield, BarChart3, Headphones, FileCheck, Check, ArrowRight, Quote, ChevronDown, Send, CheckCircle } from "lucide-react";
import { LandingNavbar } from "../../components/landing/LandingNavbar";
import { LandingFooter } from "../../components/landing/LandingFooter";
import { FeatureHero } from "../../components/features/FeatureHero";
import { FeatureCTA } from "../../components/features/FeatureCTA";
import { UniversityDashboardPreview } from "@/components/features/UniversityDashboardPreview";
import { CountUp } from "@/components/ui/count-up";

// Partnership Visual
function PartnershipVisual() {
    return (
        <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl blur-2xl opacity-20" />
            <div className="relative bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 p-8 shadow-2xl">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Partner Dashboard</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center"
                    >
                        <Building2 className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">50+</p>
                        <p className="text-xs text-purple-600 dark:text-purple-400">Universities</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center"
                    >
                        <GraduationCap className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">100+</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">Ambassadors</p>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-4 text-white text-center"
                >
                    <p className="text-sm opacity-80 mb-1">Students Helped</p>
                    <p className="text-3xl font-bold">2,500+</p>
                </motion.div>
            </div>
        </div>
    );
}

// Benefits Section
function PartnershipBenefits() {
    const benefits = [
        { icon: Clock, title: "Reduce DSO Workload", description: "Students self-track OPT timeline, reducing repetitive questions" },
        { icon: Shield, title: "Improve Compliance", description: "Automated reminders help students stay compliant" },
        { icon: BarChart3, title: "Analytics Dashboard", description: "Insights into student employment and OPT status" },
        { icon: Headphones, title: "Dedicated Support", description: "Priority support channel with <4h response" },
        { icon: FileCheck, title: "Document Management", description: "Students store I-20s, EADs in one secure place" },
        { icon: Users, title: "Student Success", description: "Resume tools and H-1B sponsor database access" },
    ];

    return (
        <section className="py-24 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
                        <Building2 className="w-4 h-4" />
                        Why Partner With Us
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Help Your International Students Succeed
                    </h2>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {benefits.map((benefit, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 hover:border-purple-500/50 transition-colors group"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <benefit.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{benefit.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{benefit.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// Program Types
function ProgramTypes() {
    const programs = [
        {
            icon: Building2,
            title: "DSO Partnership",
            subtitle: "For International Student Offices",
            features: ["Bulk student onboarding", "DSO admin dashboard", "Custom branding", "Analytics & reporting", "Priority support", "Training sessions"],
            cta: "Request Demo",
            highlight: true,
        },
        {
            icon: GraduationCap,
            title: "Campus Ambassador",
            subtitle: "For Student Leaders",
            features: ["Free Premium access", "Commission on referrals", "Leadership experience", "Networking events", "Resume boost", "Exclusive swag"],
            cta: "Apply Now",
            highlight: false,
        },
        {
            icon: Megaphone,
            title: "Career Services",
            subtitle: "For Career Centers",
            features: ["API integration", "White-label solutions", "Workshop materials", "Co-branded resources", "Joint webinars", "Placement tracking"],
            cta: "Learn More",
            highlight: false,
        },
    ];

    return (
        <section className="py-24 bg-gray-50 dark:bg-zinc-900/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Partnership Programs
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        Choose the program that fits your needs
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {programs.map((program, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative p-8 rounded-2xl border ${program.highlight
                                ? "bg-gradient-to-br from-purple-600 to-indigo-600 border-transparent text-white"
                                : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800"
                                }`}
                        >
                            {program.highlight && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-white text-purple-600 text-xs font-bold rounded-full shadow-lg">
                                    MOST POPULAR
                                </div>
                            )}

                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${program.highlight ? "bg-white/20" : "bg-gradient-to-br from-purple-500 to-indigo-600"
                                }`}>
                                <program.icon className="w-7 h-7 text-white" />
                            </div>

                            <h3 className={`text-xl font-bold mb-1 ${program.highlight ? "text-white" : "text-gray-900 dark:text-white"}`}>
                                {program.title}
                            </h3>
                            <p className={`text-sm mb-6 ${program.highlight ? "text-purple-100" : "text-gray-600 dark:text-gray-400"}`}>
                                {program.subtitle}
                            </p>

                            <ul className="space-y-3 mb-8">
                                {program.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm">
                                        <Check className={`w-4 h-4 ${program.highlight ? "text-green-300" : "text-green-600"}`} />
                                        <span className={program.highlight ? "text-white" : "text-gray-700 dark:text-gray-300"}>
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="#contact"
                                className={`block w-full text-center py-3 rounded-xl font-semibold transition-all ${program.highlight
                                    ? "bg-white text-purple-600 hover:bg-purple-50"
                                    : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg"
                                    }`}
                            >
                                {program.cta}
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// Testimonials
function PartnerTestimonials() {
    const testimonials = [
        { name: "Dr. Sarah Mitchell", role: "Director, ISS", university: "UC San Diego", quote: "TrackMyOPT has significantly reduced OPT-related questions. Students are more proactive about their deadlines." },
        { name: "James Rodriguez", role: "ISS Advisor", university: "NYU", quote: "The analytics dashboard helps us identify at-risk students before problems occur. Game-changer." },
        { name: "Emily Chen", role: "Campus Ambassador", university: "Carnegie Mellon", quote: "Being an ambassador helped me build leadership skills and help fellow international students." },
    ];

    return (
        <section className="py-24">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        What Our Partners Say
                    </h2>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6">
                    {testimonials.map((t, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6"
                        >
                            <Quote className="w-8 h-8 text-purple-500/20 mb-4" />
                            <p className="text-gray-900 dark:text-white text-sm leading-relaxed mb-4">
                                &ldquo;{t.quote}&rdquo;
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                                    {t.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white text-sm">{t.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.role}</p>
                                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">{t.university}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// Stats
function StatsSection() {
    const stats = [
        { value: 50, suffix: "+", label: "Partner Universities" },
        { value: 100, suffix: "+", label: "Campus Ambassadors" },
        { value: 2500, suffix: "+", label: "Students Helped" },
        { value: 98, suffix: "%", label: "DSO Satisfaction" },
    ];

    return (
        <section className="py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 md:p-12">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-8">
                        Trusted by Universities Nationwide
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center"
                            >
                                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                                    <CountUp value={stat.value} suffix={stat.suffix} />
                                </div>
                                <p className="text-purple-100 text-sm">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

// FAQ
function PartnershipFAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);
    const faqs = [
        { question: "How does institutional licensing work?", answer: "Institutional licensing provides TrackMyOPT Premium access to all F-1 students at your university. We offer annual licensing based on student count with bulk discounts." },
        { question: "What training do you provide for DSOs?", answer: "We provide comprehensive onboarding including live training sessions, documentation, and ongoing support with a dedicated account manager." },
        { question: "What are the requirements for campus ambassadors?", answer: "Ambassadors should be current F-1 students with good academic standing, strong communication skills, and passion for helping fellow international students." },
        { question: "Is there a cost for the campus ambassador program?", answer: "No! The campus ambassador program is completely free. Ambassadors receive free Premium access and earn commissions on referrals." },
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
                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 pb-4 text-gray-600 dark:text-gray-400">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// Contact Form
function ContactPartnership() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name"),
            email: formData.get("email"),
            university: formData.get("university"),
            role: formData.get("role"),
            message: formData.get("message"),
        };

        try {
            // Send data to the Next.js API Route we just discussed!
            const res = await fetch("/api/partnerships", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Failed to submit inquiry");
            
            setIsSubmitted(true);
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <section id="contact" className="py-24">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-8 text-center"
                    >
                        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 mx-auto mb-4">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Thank You!</h3>
                        <p className="text-gray-600 dark:text-gray-400">We'll be in touch within 1-2 business days.</p>
                    </motion.div>
                </div>
            </section>
        );
    }

    return (
        <section id="contact" className="py-24">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-8"
                >
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Get in Touch
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Tell us about your institution and how we can help
                    </p>
                </motion.div>

                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    onSubmit={handleSubmit}
                    className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 lg:p-8"
                >
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Name</label>
                            <input
                                type="text"
                                name="name"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Your name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Email</label>
                            <input
                                type="email"
                                name="email"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="your@university.edu"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">University</label>
                            <input
                                type="text"
                                name="university"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="University name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Role</label>
                            <input
                                type="text"
                                name="role"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="e.g., DSO, Student, Advisor"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Message</label>
                        <textarea
                            rows={4}
                            name="message"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                            placeholder="Tell us more about your needs..."
                        />
                    </div>

                    {error && (
                        <div className="mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                        {isSubmitting ? "Submitting..." : "Submit Inquiry"}
                    </button>
                </motion.form>
            </div>
        </section>
    );
}

export default function PartnershipsPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
            <LandingNavbar />

            {/* Hero */}
            <FeatureHero
                badge="University Partnerships"
                headline="Equip Your International Students for Career Success"
                subheadline="Partner with TrackMyOPT to provide your F-1 students with the tools they need to stay compliant, find jobs, and build successful careers in the US."
                ctaText="Schedule a Demo"
                ctaHref="#contact"
                secondaryCta={{
                    text: "Learn More",
                    href: "#benefits"
                }}
                gradient="from-purple-600 to-indigo-600"
                visual={<UniversityDashboardPreview />}
            />

            {/* Stats */}
            <StatsSection />

            {/* Benefits */}
            <div id="benefits">
                <PartnershipBenefits />
            </div>

            {/* Programs */}
            <ProgramTypes />

            {/* Testimonials */}
            <PartnerTestimonials />

            {/* FAQ */}
            <PartnershipFAQ />

            {/* Contact Form */}
            <ContactPartnership />

            {/* CTA */}
            <FeatureCTA
                headline="Ready to Support Your Students?"
                subheadline="Let's discuss how TrackMyOPT can help your international student office."
                primaryCTA={{
                    text: "Schedule a Demo",
                    href: "#contact",
                }}
                secondaryCTA={{
                    text: "Download Info Pack",
                    href: "#",
                }}
                gradient="purple"
                icon={<Building2 className="w-12 h-12 text-white" />}
            />

            <LandingFooter />
        </main>
    );
}
