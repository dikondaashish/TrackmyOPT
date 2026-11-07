"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Building2, GraduationCap, Megaphone, Users, Clock, Shield, BarChart3, Headphones, FileCheck, Check, ChevronDown, Send, CheckCircle, Quote } from "lucide-react";
import { LandingNavbar } from "../../components/landing/LandingNavbar";
import { LandingFooter } from "../../components/landing/LandingFooter";
import { FeatureHero } from "../../components/features/FeatureHero";
import { FeatureCTA } from "../../components/features/FeatureCTA";
import { UniversityDashboardPreview } from "@/components/features/UniversityDashboardPreview";
import { CountUp } from "@/components/ui/count-up";

// Benefits Section
function PartnershipBenefits() {
    const benefits = [
        { icon: Clock, title: "Reduce DSO Workload", description: "Students self-track OPT timeline, reducing repetitive questions", tile: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300" },
        { icon: Shield, title: "Improve Compliance", description: "Automated reminders help students stay compliant", tile: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300" },
        { icon: BarChart3, title: "Analytics Dashboard", description: "Insights into student employment and OPT status", tile: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300" },
        { icon: Headphones, title: "Dedicated Support", description: "Priority support channel with <4h response", tile: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300" },
        { icon: FileCheck, title: "Document Management", description: "Students store I-20s, EADs in one secure place", tile: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300" },
        { icon: Users, title: "Student Success", description: "Resume tools and H-1B sponsor database access", tile: "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300" },
    ];

    return (
        <section className="py-24 relative bg-surface border-y border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
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
                            className="surface-card p-6"
                        >
                            <div className={`mb-5 flex h-10 w-10 items-center justify-center rounded-lg ${benefit.tile}`}>
                                <benefit.icon className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">{benefit.title}</h3>
                            <p className="text-sm leading-6 text-muted-foreground">{benefit.description}</p>
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
        <section className="py-24 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                        Partnership Programs
                    </h2>
                    <p className="text-lg text-muted-foreground">
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
                            className={`flex flex-col p-8 rounded-xl border bg-card ${program.highlight
                                ? "border-primary-muted ring-1 ring-primary shadow-elevated"
                                : "border-border shadow-card"
                                }`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${program.highlight ? "bg-primary text-primary-foreground" : "bg-primary-soft text-primary"}`}>
                                    <program.icon className="h-5 w-5" />
                                </div>
                                {program.highlight && (
                                    <span className="text-sm font-semibold text-primary">Most popular</span>
                                )}
                            </div>

                            <h3 className="text-xl font-bold mb-1 text-foreground">
                                {program.title}
                            </h3>
                            <p className="text-sm mb-6 text-muted-foreground">
                                {program.subtitle}
                            </p>

                            <ul className="space-y-3 mb-8 flex-1 border-t border-border pt-6">
                                {program.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm">
                                        <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                        <span className="text-foreground">
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="#contact"
                                className={`flex min-h-11 w-full items-center justify-center rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${program.highlight
                                    ? "bg-primary text-primary-foreground shadow-button hover:bg-primary-hover"
                                    : "border border-border bg-background text-foreground shadow-card hover:bg-muted"
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
        <section className="py-24 bg-surface border-y border-border">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
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
                            className="surface-card flex flex-col p-6"
                        >
                            <Quote className="mb-4 h-6 w-6 text-primary-muted" aria-hidden="true" />
                            <p className="flex-1 text-foreground text-base leading-relaxed mb-6">
                                &ldquo;{t.quote}&rdquo;
                            </p>
                            <div className="flex items-center gap-3 border-t border-border pt-4">
                                <div className="w-10 h-10 shrink-0 rounded-full bg-primary-soft flex items-center justify-center text-primary font-semibold">
                                    {t.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground text-sm">{t.name}</p>
                                    <p className="text-xs text-muted-foreground">{t.role}</p>
                                    <p className="text-xs text-primary font-medium">{t.university}</p>
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
        { value: 50, suffix: "+", label: "Partner Universities", color: "text-blue-600 dark:text-blue-400", accent: "border-t-blue-600" },
        { value: 100, suffix: "+", label: "Campus Ambassadors", color: "text-violet-600 dark:text-violet-400", accent: "border-t-violet-600" },
        { value: 3000, suffix: "+", label: "Users Signed Up", color: "text-blue-600 dark:text-blue-400", accent: "border-t-blue-600" },
        { value: 98, suffix: "%", label: "DSO Satisfaction", color: "text-emerald-600 dark:text-emerald-400", accent: "border-t-emerald-600" },
    ];

    return (
        <section className="py-24 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-center mb-12">
                        Trusted by Universities Nationwide
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className={`surface-card border-t-[3px] p-6 text-center ${stat.accent}`}
                            >
                                <div className={`text-3xl md:text-5xl font-bold mb-2 ${stat.color}`}>
                                    <CountUp value={stat.value} suffix={stat.suffix} />
                                </div>
                                <p className="text-muted-foreground text-sm">{stat.label}</p>
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
        <section className="py-24 bg-background">
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
                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 pb-5 leading-7 text-muted-foreground">
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
        } catch (_err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <section id="contact" className="py-24 bg-surface border-t border-border">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="surface-card p-8 text-center"
                    >
                        <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-300 mx-auto mb-4">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">Thank You!</h3>
                        <p className="text-muted-foreground">We'll be in touch within 1-2 business days.</p>
                    </motion.div>
                </div>
            </section>
        );
    }

    return (
        <section id="contact" className="py-24 bg-surface border-t border-border">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-8"
                >
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                        Get in Touch
                    </h2>
                    <p className="text-muted-foreground">
                        Tell us about your institution and how we can help
                    </p>
                </motion.div>

                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    onSubmit={handleSubmit}
                    className="surface-card p-6 lg:p-8"
                >
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Name</label>
                            <input
                                type="text"
                                name="name"
                                className="w-full px-4 py-3 bg-background text-foreground border border-input rounded-lg shadow-card placeholder:text-muted-foreground transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring"
                                placeholder="Your name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                            <input
                                type="email"
                                name="email"
                                className="w-full px-4 py-3 bg-background text-foreground border border-input rounded-lg shadow-card placeholder:text-muted-foreground transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring"
                                placeholder="your@university.edu"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">University</label>
                            <input
                                type="text"
                                name="university"
                                className="w-full px-4 py-3 bg-background text-foreground border border-input rounded-lg shadow-card placeholder:text-muted-foreground transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring"
                                placeholder="University name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Role</label>
                            <input
                                type="text"
                                name="role"
                                className="w-full px-4 py-3 bg-background text-foreground border border-input rounded-lg shadow-card placeholder:text-muted-foreground transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring"
                                placeholder="e.g., DSO, Student, Advisor"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-foreground mb-2">Message</label>
                        <textarea
                            rows={4}
                            name="message"
                            className="w-full px-4 py-3 bg-background text-foreground border border-input rounded-lg shadow-card placeholder:text-muted-foreground transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring resize-none"
                            placeholder="Tell us more about your needs..."
                        />
                    </div>

                    {error && (
                        <div className="mb-4 text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950 border-l-4 border-l-red-500 p-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full min-h-12 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg shadow-button hover:bg-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-blue-300 border-t-white rounded-full animate-spin" />
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
        <main className="min-h-screen bg-background">
            <LandingNavbar />

            {/* Hero */}
            <FeatureHero
                headline="Equip Your International Students for Career Success"
                subheadline="Partner with TrackMyOPT to provide your F-1 students with the tools they need to stay compliant, find jobs, and build successful careers in the US."
                ctaText="Schedule a Demo"
                ctaHref="#contact"
                secondaryCta={{
                    text: "Learn More",
                    href: "#benefits"
                }}
                gradient="bg-purple-600"
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
