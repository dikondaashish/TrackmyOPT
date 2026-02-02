"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
    ArrowRight,
    FileText,
    Sparkles,
    CheckCircle2,
    Target,
    Zap,
    Award,
    Brain,
    Upload,
    ClipboardList,
    MessageSquare,
    XCircle,
    TrendingUp,
    AlertTriangle
} from "lucide-react";
import { FeatureHero } from "@/components/features/FeatureHero";
import { FeatureFAQ } from "@/components/features/FeatureFAQ";
import { FeatureWhyMatters } from "@/components/features/FeatureWhyMatters";
import { FeatureTestimonial } from "@/components/features/FeatureTestimonial";
import { FeatureCTA } from "@/components/features/FeatureCTA";


// Resume Mockup Component
function ResumeMockup() {
    return (
        <div className="relative">
            {/* Glowing background */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl blur-2xl opacity-20" />

            <motion.div
                className="relative bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 p-6 shadow-2xl"
                initial={{ rotateY: -5 }}
                whileHover={{ rotateY: 0, scale: 1.02 }}
                transition={{ duration: 0.3 }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">resume_v3.pdf</p>
                            <p className="text-xs text-gray-500">Analyzing...</p>
                        </div>
                    </div>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-bold"
                    >
                        <Sparkles className="w-4 h-4" />
                        Score: 94/100
                    </motion.div>
                </div>

                {/* Analysis Items */}
                <div className="space-y-3">
                    {[
                        { label: "ATS Compatibility", score: 98, color: "emerald" },
                        { label: "Keyword Match", score: 92, color: "blue" },
                        { label: "Sponsorship Keywords", score: 88, color: "purple" },
                        { label: "Action Verbs", score: 95, color: "amber" },
                    ].map((item, i) => (
                        <motion.div
                            key={item.label}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + i * 0.1 }}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl"
                        >
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                            <div className="flex items-center gap-3">
                                <div className="w-24 h-2 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.score}%` }}
                                        transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
                                        className={`h-full bg-gradient-to-r from-${item.color}-500 to-${item.color}-600 rounded-full`}
                                    />
                                </div>
                                <span className="text-sm font-bold text-gray-900 dark:text-white w-8">{item.score}%</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* AI Suggestions */}
                <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">AI Suggestion</span>
                    </div>
                    <p className="text-sm text-purple-600 dark:text-purple-400">
                        Add "visa sponsorship available" to your objective to attract H-1B friendly employers.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

// How It Works Steps
function HowItWorks() {
    const steps = [
        { icon: Upload, title: "Upload Resume", description: "Drop your PDF or paste text" },
        { icon: ClipboardList, title: "Paste Job Description", description: "Add the role you're targeting" },
        { icon: MessageSquare, title: "Get AI Feedback", description: "Receive tailored suggestions" },
    ];

    return (
        <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
                <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                    className="relative text-center"
                >
                    {/* Connector line */}
                    {i < steps.length - 1 && (
                        <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 opacity-30" />
                    )}

                    {/* Step number */}
                    <div className="relative z-10 w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                        <step.icon className="w-9 h-9 text-white" />
                    </div>

                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{step.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
                </motion.div>
            ))}
        </div>
    );
}

// Feature Cards
function FeatureCards() {
    const features = [
        { icon: Target, title: "ATS Optimization", description: "Pass automated screening systems with optimized formatting and keywords." },
        { icon: Zap, title: "Instant Analysis", description: "Get results in seconds, not hours. Our AI processes your resume instantly." },
        { icon: Award, title: "Industry Benchmarking", description: "Compare your resume against successful candidates in your field." },
        { icon: Brain, title: "Smart Suggestions", description: "AI-powered recommendations tailored to each job description." },
    ];

    return (
        <div className="grid sm:grid-cols-2 gap-6">
            {features.map((feature, i) => (
                <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 hover:shadow-lg transition-shadow"
                >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4">
                        <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                </motion.div>
            ))}
        </div>
    );
}

export default function ResumeAIPage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
            {/* Hero */}
            <FeatureHero
                badge="AI Powered"
                headline="Beat the ATS. Impress the Recruiter."
                subheadline="Our AI analyzes your resume against job descriptions and optimizes it for both automated screening systems and human recruiters."
                ctaText="Analyze My Resume"
                ctaHref="/dashboard/resume"
                secondaryCta={{
                    text: "See How It Works",
                    href: "#how-it-works"
                }}
                gradient="from-purple-500 to-pink-600"
                visual={<ResumeMockup />}
            />

            {/* How It Works */}
            <section id="how-it-works" className="py-24 relative overflow-hidden">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
                            <Sparkles className="w-4 h-4" />
                            3 Simple Steps
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                            How It Works
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            Get actionable feedback on your resume in under 30 seconds.
                        </p>
                    </motion.div>

                    <HowItWorks />
                </div>
            </section>

            {/* Features */}
            <section className="py-24 bg-gray-50 dark:bg-zinc-900/50 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
                                <Brain className="w-4 h-4" />
                                Powered by Top AI
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                                More Than Just Keywords
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                                Our AI doesn't just count keywords—it understands context,
                                analyzes structure, and provides human-quality feedback.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Optimized for H-1B friendly roles",
                                    "Industry-specific recommendations",
                                    "Action verb enhancement",
                                    "Formatting & structure analysis"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                        <CheckCircle2 className="w-5 h-5 text-purple-500 flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <FeatureCards />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Why This Matters Section */}
            <FeatureWhyMatters
                headline="75% of Resumes Never Get Seen by Humans"
                description="Applicant Tracking Systems (ATS) filter out most resumes before a recruiter ever sees them. Our AI analyzes your resume against the same algorithms used by top companies."
                accentColor="purple"
                stats={[
                    { value: "75%", label: "Resumes rejected by ATS", icon: <XCircle className="w-5 h-5" /> },
                    { value: "6 sec", label: "Average recruiter scan time", icon: <AlertTriangle className="w-5 h-5" /> },
                    { value: "40%", label: "Increase in callbacks with optimization", icon: <TrendingUp className="w-5 h-5" /> },
                    { value: "AI-Powered", label: "Using latest LLMs", icon: <Brain className="w-5 h-5" /> },
                ]}
            />

            {/* Testimonial */}
            <FeatureTestimonial
                quote="After using the AI Resume Doctor, I went from zero callbacks to 5 interview requests in one week. The keyword suggestions were exactly what ATS systems wanted to see."
                author={{
                    name: "Sarah Chen",
                    role: "Product Manager",
                    university: "Stanford",
                }}
                accentColor="purple"
            />

            {/* FAQ Section */}
            <FeatureFAQ
                title="Resume AI FAQ"
                subtitle="Common questions about optimizing your resume"
                accentColor="purple"
                items={[
                    {
                        question: "How does AI resume optimization work?",
                        answer: "Our AI analyzes your resume against proven patterns from successful job seekers. It checks for ATS compatibility, keyword optimization, formatting issues, and content gaps compared to your target job descriptions."
                    },
                    {
                        question: "What AI model do you use?",
                        answer: "We use the latest enterprise-grade AI models for analysis. Premium subscribers get access to our most advanced models for deeper analysis and job-specific tailoring."
                    },
                    {
                        question: "Can I upload my resume in any format?",
                        answer: "Yes! We accept PDF, DOCX, and plain text formats. PDF is recommended as it preserves formatting while remaining ATS-friendly."
                    },
                    {
                        question: "How is this different from other resume tools?",
                        answer: "We specifically optimize for the job market international students face—including H-1B-friendly company language, visa sponsorship keywords, and OPT/CPT terminology that recruiters search for."
                    },
                    {
                        question: "Is my resume data kept private?",
                        answer: "Absolutely. Your resume is encrypted, never shared with third parties, and automatically deleted after 30 days of inactivity. We never use your data to train our models."
                    },
                    {
                        question: "How many times can I analyze my resume?",
                        answer: "Free users get 3 analyses per month. Premium subscribers get unlimited analyses plus job-specific tailoring for each application."
                    },
                ]}
            />

            {/* Final CTA */}
            <FeatureCTA
                headline="Ready to Beat the ATS?"
                subheadline="Upload your resume and get AI-powered feedback in 60 seconds. See exactly what's holding your resume back."
                primaryCTA={{
                    text: "Analyze My Resume Free",
                    href: "/login",
                }}
                secondaryCTA={{
                    text: "See Sample Analysis",
                    href: "/features/resume-ai#sample",
                }}
                gradient="purple"
                icon={<FileText className="w-12 h-12 text-white" />}
                badge="AI-Powered"
            />
        </main>
    );
}
