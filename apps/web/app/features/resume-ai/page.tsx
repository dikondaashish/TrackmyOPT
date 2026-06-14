"use client";

import { motion } from "framer-motion";
import { CanonicalURL } from "@/components/CanonicalURL";
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
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";
import { FeatureHero } from "@/components/features/FeatureHero";
import { FeatureFAQ } from "@/components/features/FeatureFAQ";
import { FeatureServiceSchema } from "@/components/features/FeatureServiceSchema";
import { FeatureWhyMatters } from "@/components/features/FeatureWhyMatters";
import { FeatureTestimonial } from "@/components/features/FeatureTestimonial";
import { FeatureCTA } from "@/components/features/FeatureCTA";
import { ResumeScanner } from "@/components/features/ResumeScanner";
import { ResumeComparisonSlider } from "@/components/features/ResumeComparisonSlider";
import { H2, Lead, P } from "@/components/ui/typography";

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
                    <div className="relative z-10 w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 duration-300">
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
                    className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300 group"
                >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
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
        <>
            <CanonicalURL url="https://www.trackmyopt.com/features/resume-ai" />
            <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
            <FeatureServiceSchema
                name="Resume AI Optimizer for H-1B Job Seekers"
                description="AI-powered resume analysis that beats ATS systems and impresses recruiters. Get actionable feedback on ATS optimization, keyword improvements, and industry-specific recommendations in 60 seconds."
                featurePath="/features/resume-ai"
                faqItems={[
                  {question: "How does AI resume optimization work?", answer: "Our AI analyzes your resume against proven patterns from successful job seekers. It checks for ATS compatibility, keyword optimization, formatting issues, and content gaps compared to your target job descriptions."},
                  {question: "What AI model do you use?", answer: "We use the latest enterprise-grade AI models (Gemini Ultra / GPT-4) for analysis. Premium subscribers get access to our most advanced models for deeper analysis and job-specific tailoring."},
                  {question: "Can I upload my resume in any format?", answer: "Yes! We accept PDF, DOCX, and plain text formats. PDF is recommended as it preserves formatting while remaining ATS-friendly."},
                  {question: "How is this different from other resume tools?", answer: "We specifically optimize for the job market international students face—including H-1B-friendly company language, visa sponsorship keywords, and OPT/CPT terminology that recruiters search for."},
                  {question: "Is my resume data kept private?", answer: "Absolutely. Your resume is encrypted, never shared with third parties, and automatically deleted after 30 days of inactivity. We never use your data to train our models."},
                  {question: "How many times can I analyze my resume?", answer: "Free users get 3 analyses per month. Premium subscribers get unlimited analyses plus job-specific tailoring for each application."}
                ]}
            />
            {/* Hero */}
            <FeatureHero
                badge="AI Powered"
                headline="We cook your resume in 2 minutes — faster than Maggi."
                subheadline="Beat the ATS. Impress the Recruiter. Get 3x more callbacks."
                ctaText="Analyze My Resume"
                ctaHref="/dashboard/resume"
                secondaryCta={{
                    text: "See How It Works",
                    href: "#how-it-works"
                }}
                gradient="from-purple-500 to-pink-600"
                visual={<ResumeScanner />}
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
                        <H2 className="mb-6">How It Works</H2>
                        <Lead className="max-w-2xl mx-auto">
                            Get actionable feedback on your resume in under 30 seconds.
                        </Lead>
                    </motion.div>

                    <HowItWorks />
                </div>
            </section>

            {/* Interactive Before/After Demo */}
            <section className="py-24 bg-white/50 dark:bg-black/20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <H2>See the Difference</H2>
                        <Lead>Drag the slider to see how AI transforms a generic resume.</Lead>
                    </div>
                    <ResumeComparisonSlider />
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
                            <H2 className="mb-6">More Than Just Keywords</H2>
                            <div className="text-lg text-gray-600 dark:text-gray-300 mb-8 space-y-4">
                                <p>
                                    Our AI doesn't just count keywords—it understands context,
                                    analyzes structure, and provides human-quality feedback.
                                </p>
                            </div>
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
                    { value: "40%", label: "Increase in callbacks", icon: <TrendingUp className="w-5 h-5" /> },
                    { value: "50k+", label: "Resumes Scanned", icon: <Brain className="w-5 h-5" /> },
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
                        answer: "We use the latest enterprise-grade AI models (Gemini Ultra / GPT-4) for analysis. Premium subscribers get access to our most advanced models for deeper analysis and job-specific tailoring."
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
        </main>        </>    );
}

