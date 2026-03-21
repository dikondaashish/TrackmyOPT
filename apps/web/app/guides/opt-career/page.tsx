import { Metadata } from "next";
import Link from "next/link";
import {
    Clock, ArrowRight, CheckCircle2, AlertTriangle, Briefcase, BookOpen,
    GraduationCap, Search, FileText, Users, DollarSign, TrendingUp,
    Shield, XCircle, Wrench, Globe, Award, Target, ChevronRight,
    Building2, Scale, Lightbulb, MessageSquare, Star,
} from "lucide-react";
import { AuthorBio } from "@/components/blog/AuthorBio";
import { BreadcrumbSchema } from "@/components/BreadcrumbSchema";

export const metadata: Metadata = {
    title: "OPT Career Guide: From Job Search to H-1B Sponsorship | TrackMyOPT",
    description: "Complete career guide for F-1 students on OPT. Job search strategies, H-1B sponsor companies, salary negotiation, and navigating the visa transition.",
    alternates: {
        canonical: "https://www.trackmyopt.com/guides/opt-career",
    },
};

const tocSections = [
    { id: "career-landscape", label: "The F-1 Career Landscape" },
    { id: "work-authorization", label: "Understanding Work Authorization" },
    { id: "ats-resume", label: "Building an ATS-Optimized Resume" },
    { id: "job-search-strategy", label: "Job Search Strategy" },
    { id: "h1b-sponsors", label: "Finding H-1B Sponsor Companies" },
    { id: "interview-prep", label: "Interview Preparation" },
    { id: "salary-negotiation", label: "Salary Negotiation" },
    { id: "opt-to-h1b", label: "The OPT to H-1B Pipeline" },
    { id: "alternative-visas", label: "Beyond H-1B: Alternative Visas" },
    { id: "permanent-residency", label: "Path to Permanent Residency" },
    { id: "common-mistakes", label: "Common Career Mistakes" },
    { id: "tools-resources", label: "Tools & Resources" },
];

const faqItems = [
    { q: "When should F-1 students start job searching?", a: "Start at least 6 months before graduation. Begin with networking and researching H-1B sponsor companies, then ramp up applications 3-4 months out. Your OPT unemployment clock starts on your EAD start date, so having a job lined up early is critical." },
    { q: "Do I need to disclose my visa status on my resume?", a: "No. Never include visa status on your resume. Most career advisors recommend waiting until an interview or offer stage to discuss work authorization. You are legally authorized to work on OPT — lead with that." },
    { q: "How do I find companies that sponsor H-1B visas?", a: "Use the Department of Labor H-1B disclosure data, USCIS H-1B Employer Data Hub, or TrackMyOPT's H-1B Sponsor Database which indexes 25,000+ companies with approval rates, salary data, and fraud alerts." },
    { q: "What is the H-1B lottery selection rate?", a: "For FY2026, approximately 25-30% of registrations were selected in the H-1B lottery. With STEM OPT, you get up to 3 attempts at the lottery before your work authorization expires." },
    { q: "Can I negotiate salary as an international student?", a: "Absolutely. The DOL prevailing wage for your occupation and location is a public baseline. Employers must pay at least this amount for H-1B workers. Use it as a floor and negotiate based on your skills, market data, and competing offers." },
    { q: "What happens if I'm not selected in the H-1B lottery?", a: "If you have a STEM degree, apply for the 24-month STEM OPT extension for additional lottery attempts. Other options include cap-exempt employers (universities, nonprofits), O-1 visa for extraordinary ability, or employer-sponsored green card (EB-2/EB-3)." },
    { q: "Is it worth applying to companies that don't sponsor H-1B?", a: "Generally no, unless you have another path to long-term work authorization. Focus your energy on confirmed sponsors. Some companies that say 'no sponsorship' may still consider exceptional candidates — but this is rare." },
    { q: "How long does the OPT to green card process take?", a: "The timeline varies significantly by country of birth. For most countries, the EB-2/EB-3 PERM process takes 1-3 years from filing to green card. For India and China, priority date backlogs can add 5-15+ years." },
    { q: "What is the prevailing wage and why does it matter?", a: "The prevailing wage is the DOL-determined minimum salary an employer must pay an H-1B worker in a specific occupation and location. It protects both you and US workers. Check wages at foreignlaborcert.doleta.gov." },
    { q: "Can I start my own company on OPT?", a: "Yes, with restrictions. On OPT you must work in a position directly related to your major. Self-employment is allowed if it meets this requirement. On STEM OPT, self-employment is not permitted — you must work for an E-Verify employer." },
];

export default function OPTCareerPillarGuide() {
    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Schema Markup */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": "F-1 Career Guide 2026: From OPT Application to H-1B and Beyond",
                "description": "The definitive career resource for F-1 international students. Everything you need to land a job, navigate sponsorship, negotiate your worth, and build a long-term career in the United States.",
                "image": "https://www.trackmyopt.com/og-f1-career-guide.jpg",
                "datePublished": "2026-03-12",
                "dateModified": "2026-03-12",
                "author": {
                    "@type": "Organization",
                    "name": "TrackMyOPT Team",
                    "url": "https://www.trackmyopt.com"
                },
                "publisher": {
                    "@type": "Organization",
                    "name": "TrackMyOPT",
                    "url": "https://www.trackmyopt.com",
                    "logo": {
                        "@type": "ImageObject",
                        "url": "https://www.trackmyopt.com/logo.png"
                    }
                },
                "articleBody": "Complete career guide for F-1 students covering job search, OPT, H-1B sponsorship, salary negotiation, and immigration pathways."
            })}} />

            <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "HowTo",
                "name": "How to Build an F-1 Career and Secure H-1B Sponsorship",
                "description": "Complete guide for F-1 students to land a job, secure H-1B sponsorship, and build a lasting career in the United States.",
                "step": [
                    {
                        "@type": "HowToStep",
                        "name": "Understand the F-1 Career Landscape",
                        "text": "Recognize that over 200,000 F-1 students apply for OPT annually, competing for H-1B sponsorship roles. The H-1B lottery selects only 25–30% of registrants, making targeted job search critical."
                    },
                    {
                        "@type": "HowToStep",
                        "name": "Know Your Work Authorization Options",
                        "text": "Understand three main pathways: CPT (while enrolled), OPT (12 months post-graduation), and STEM OPT extension (24 months for STEM degrees). Each has different employer requirements and unemployment limits."
                    },
                    {
                        "@type": "HowToStep",
                        "name": "Build an ATS-Optimized Resume",
                        "text": "Create a resume that passes Applicant Tracking Systems used by 98% of Fortune 500 companies. Use standard fonts, mirror job description keywords, avoid graphics, and structure bullets with the XYZ formula (quantified achievements)."
                    },
                    {
                        "@type": "HowToStep",
                        "name": "Launch a Phased Job Search",
                        "text": "Start 6+ months before graduation. Phase 1 (6 months out): Build target list of H-1B sponsors. Phase 2 (4 months out): Submit 5–10 high-quality applications weekly. Phase 3: Network with alumni. Phase 4: Follow up consistently."
                    },
                    {
                        "@type": "HowToStep",
                        "name": "Identify H-1B Sponsor Companies",
                        "text": "Use Department of Labor H-1B disclosure data, USCIS H-1B Employer Data Hub, or TrackMyOPT's H-1B Sponsor Database to research companies by approval rate, average salary, and sponsorship history."
                    },
                    {
                        "@type": "HowToStep",
                        "name": "Prepare for Technical and Behavioral Interviews",
                        "text": "Practice coding problems, system design, and behavioral questions using STAR method. Prepare answers about work authorization that emphasize you are legally authorized on OPT and understand the H-1B process."
                    },
                    {
                        "@type": "HowToStep",
                        "name": "Negotiate Your Salary",
                        "text": "Research DOL prevailing wage for your occupation and location—this is the minimum an employer must pay H-1B workers. Negotiate based on market data, your skills, and competing offers. Prevailing wage serves as your baseline, not your ceiling."
                    },
                    {
                        "@type": "HowToStep",
                        "name": "Navigate the OPT to H-1B Pipeline",
                        "text": "Understand the H-1B registration and lottery process. If selected, your employer begins the H-1B petition process. If not selected, apply for 24-month STEM OPT extension (if eligible) for additional lottery attempts."
                    },
                    {
                        "@type": "HowToStep",
                        "name": "Evaluate Alternative Visa Options",
                        "text": "If H-1B selection fails, explore alternatives: Cap-exempt employers (universities, nonprofits, government), O-1 visa for extraordinary ability, L-1 visa through employer transfer, or employer-sponsored green card (EB-2/EB-3)."
                    },
                    {
                        "@type": "HowToStep",
                        "name": "Plan Your Path to Permanent Residency",
                        "text": "Understand the EB-2/EB-3 green card process timeline. For most countries, PERM takes 1–3 years. For India and China, be prepared for 5–15+ year priority date backlogs. Start green card planning early."
                    }
                ]
            })}} />

            <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "When should F-1 students start job searching?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Start at least 6 months before graduation. Begin with networking and researching H-1B sponsor companies, then ramp up applications 3-4 months out. Your OPT unemployment clock starts on your EAD start date, so having a job lined up early is critical."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Do I need to disclose my visa status on my resume?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "No. Never include visa status on your resume. Most career advisors recommend waiting until an interview or offer stage to discuss work authorization. Lead with the fact that you are legally authorized to work on OPT."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "How do I find companies that sponsor H-1B visas?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Use the Department of Labor H-1B disclosure data, USCIS H-1B Employer Data Hub, or TrackMyOPT's H-1B Sponsor Database which indexes 25,000+ companies with approval rates, salary data, and fraud alerts."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "What is the H-1B lottery selection rate?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "For FY2026, approximately 25-30% of registrations were selected in the H-1B lottery. With STEM OPT, you get up to 3 attempts at the lottery before your work authorization expires."
                        }
                    },
                    {
                        "@type": "Question",
                        "name": "Can I negotiate salary as an international student?",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "Absolutely. The DOL prevailing wage for your occupation and location is a public baseline. Employers must pay at least this amount for H-1B workers. Use it as a floor and negotiate based on your skills, market data, and competing offers."
                        }
                    }
                ]
            })}} />

            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                <Link href="/" className="hover:text-blue-600">Home</Link><span>/</span>
                <Link href="/blog" className="hover:text-blue-600">Guides</Link><span>/</span>
                <span className="text-gray-900 dark:text-white">F-1 Career Guide</span>
            </nav>

            {/* Hero */}
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold">Pillar Guide</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold">2026 Edition</span>
                    <span className="text-sm text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" />35 min read</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    F-1 Career Guide 2026: From OPT Application to H-1B and Beyond
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    The definitive career resource for F-1 international students. Everything you need to land a job, navigate sponsorship,
                    negotiate your worth, and build a long-term career in the United States.
                </p>
                <div className="mt-6 text-sm text-gray-500">Last updated: March 12, 2026 • Written by TrackMyOPT Team</div>
            </header>

            {/* Key Takeaway */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
                <h2 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2"><BookOpen className="w-5 h-5" />Key Takeaway</h2>
                <p className="text-blue-800 dark:text-blue-200 font-medium">
                    Over <strong>200,000 F-1 students</strong> apply for OPT each year, all competing for positions at companies willing to sponsor H-1B visas. Your career success depends on <strong>three things</strong>: starting early (6+ months before graduation), targeting the right employers (confirmed H-1B sponsors), and presenting yourself strategically (ATS-optimized resume, confident interview answers about work authorization).
                </p>
            </div>

            {/* Table of Contents */}
            <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 mb-12">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><FileText className="w-5 h-5" />In This Guide</h2>
                <div className="grid sm:grid-cols-2 gap-2">
                    {tocSections.map((s, i) => (
                        <a key={s.id} href={`#${s.id}`} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-1">
                            <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-300 text-xs font-bold flex-shrink-0">{i + 1}</span>
                            {s.label}
                        </a>
                    ))}
                </div>
            </div>

            <div className="prose prose-lg prose-longform dark:prose-invert max-w-none">

                {/* Section 1 */}
                <section id="career-landscape" className="mb-16 scroll-mt-20">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                        <Globe className="w-7 h-7 text-blue-500 flex-shrink-0" />The F-1 Student Career Landscape
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Every year, more than <strong>200,000 F-1 students</strong> apply for Optional Practical Training (OPT) — making it one of the largest pools of early-career talent in the United States. These students bring advanced degrees, multilingual ability, and global perspective. Yet they face challenges that domestic graduates never encounter: work authorization timelines, employer sponsorship requirements, and immigration uncertainty.
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        The reality is stark. Only a subset of US employers sponsor H-1B visas, and the annual H-1B lottery selects roughly 25-30% of registrants. If you're an F-1 student, your career strategy can't be the same as everyone else's. You need a targeted, informed approach — and you need to start early.
                    </p>
                    <div className="grid sm:grid-cols-3 gap-4 my-6">
                        {[
                            { stat: "200K+", label: "OPT applications per year", icon: GraduationCap },
                            { stat: "~25%", label: "H-1B lottery selection rate", icon: Target },
                            { stat: "3-6 mo", label: "Recommended job search lead time", icon: Clock },
                        ].map((item, i) => (
                            <div key={i} className="text-center p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <item.icon className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">{item.stat}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.label}</div>
                            </div>
                        ))}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        But here's the upside: international students are among the most resourceful, adaptable professionals in the workforce. Employers who hire F-1 students consistently report high performance and retention. The key is positioning yourself correctly — and this guide will show you how.
                    </p>
                </section>

                {/* Section 2 */}
                <section id="work-authorization" className="mb-16 scroll-mt-20">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                        <Shield className="w-7 h-7 text-indigo-500 flex-shrink-0" />Understanding Your Work Authorization
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                        Before you start job searching, you must understand the three main work authorization pathways available to F-1 students. Each has different eligibility requirements, durations, and employer obligations.
                    </p>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-zinc-800">
                                    {["", "CPT", "OPT (Post-Completion)", "STEM OPT Extension"].map(h => (
                                        <th key={h} className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ["Eligibility", "Enrolled students (1+ academic year)", "Completed degree program", "STEM degree holders on OPT"],
                                    ["Duration", "Varies (part-time or full-time)", "12 months", "24 months (total 36 with OPT)"],
                                    ["Employer Requirement", "Must be related to major", "Must be related to major", "E-Verify employer required"],
                                    ["Unemployment Limit", "N/A", "90 days cumulative", "150 days cumulative (incl. OPT)"],
                                    ["Application", "DSO authorization", "USCIS I-765 filing", "USCIS I-765 filing"],
                                    ["Multiple Employers", "Yes, with DSO approval", "Yes", "Yes, with I-983 for each"],
                                ].map(([label, ...cols], i) => (
                                    <tr key={i} className={i % 2 === 0 ? "bg-gray-50 dark:bg-zinc-900" : ""}>
                                        <td className="p-3 border dark:border-zinc-700 font-medium text-gray-900 dark:text-white">{label}</td>
                                        {cols.map((c, j) => (
                                            <td key={j} className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{c}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mt-6">
                        <p className="text-amber-800 dark:text-amber-200 text-sm flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span><strong>Unemployment limits are strict.</strong> Exceeding 90 days (OPT) or 150 days (STEM OPT) of cumulative unemployment means your OPT automatically terminates and you must leave the US. Track every day with <Link href="/dashboard/opt-tools/opt-clock" className="text-amber-700 dark:text-amber-300 underline font-medium">TrackMyOPT's Unemployment Clock</Link>.</span>
                        </p>
                    </div>
                </section>

                {/* Section 3 */}
                <section id="ats-resume" className="mb-16 scroll-mt-20">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                        <FileText className="w-7 h-7 text-green-500 flex-shrink-0" />Building an ATS-Optimized Resume
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Over 98% of Fortune 500 companies use Applicant Tracking Systems (ATS) to screen resumes before a human ever sees them. For F-1 students, getting past the ATS is even more critical — you're competing with domestic candidates who don't face work authorization questions.
                    </p>
                    <div className="space-y-4 mb-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">ATS Formatting Rules</h3>
                        <div className="grid sm:grid-cols-2 gap-3">
                            {[
                                { do: true, text: "Use standard section headings (Education, Experience, Skills)" },
                                { do: true, text: "Stick to .docx or .pdf format — avoid images or infographic resumes" },
                                { do: true, text: "Use standard fonts (Arial, Calibri, Times New Roman) at 10-12pt" },
                                { do: true, text: "Include keywords from the job description verbatim" },
                                { do: false, text: "Don't use tables, text boxes, columns, or headers/footers" },
                                { do: false, text: "Don't include photos, logos, or graphics" },
                                { do: false, text: "Don't put critical info in headers/footers (ATS often skips them)" },
                                { do: false, text: "Don't list visa status, nationality, or immigration details" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-2 text-sm">
                                    {item.do
                                        ? <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        : <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />}
                                    <span className="text-gray-700 dark:text-gray-300">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-5 mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">The XYZ Bullet Formula</h3>
                        <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">Structure every bullet point as: <strong>Accomplished [X] as measured by [Y], by doing [Z]</strong></p>
                        <div className="space-y-2">
                            {[
                                "Reduced API response time by 40% (from 800ms to 480ms) by implementing Redis caching for frequently queried endpoints",
                                "Increased user retention by 15% across 50K+ users by designing and A/B testing a personalized onboarding flow",
                                "Automated monthly reporting pipeline saving 20 analyst-hours/month by building Python ETL scripts with Airflow orchestration",
                            ].map((b, i) => (
                                <div key={i} className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800 rounded-lg p-3 flex items-start gap-2">
                                    <Star className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                                    {b}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link href="/blog/ats-resume-international-students" className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
                            Complete ATS Resume Guide for F-1 Students <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                        <Link href="/features/resume-ai" className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
                            Try TrackMyOPT AI Resume Builder <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </section>

                {/* Section 4 */}
                <section id="job-search-strategy" className="mb-16 scroll-mt-20">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                        <Search className="w-7 h-7 text-teal-500 flex-shrink-0" />Job Search Strategy for International Students
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                        A successful job search for F-1 students isn't about spraying 500 applications. It's a phased strategy that starts months before graduation and combines research, targeted applications, and networking.
                    </p>
                    <div className="space-y-4">
                        {[
                            {
                                phase: "Phase 1: Research (6 Months Before Graduation)",
                                icon: Search,
                                color: "blue",
                                tips: [
                                    "Build a target list of 30-50 companies with confirmed H-1B sponsorship history",
                                    "Research each company's approval rate, average salary, and filing trends using TrackMyOPT's sponsor database",
                                    "Identify 3-5 industries where your degree qualifies for both OPT and H-1B specialty occupation",
                                    "Map your skills to in-demand job titles — use LinkedIn job postings to identify keyword patterns",
                                ],
                            },
                            {
                                phase: "Phase 2: Apply (4-5 Months Before Graduation)",
                                icon: FileText,
                                color: "green",
                                tips: [
                                    "Customize your resume for each application — mirror the job description's keywords",
                                    "Submit 5-10 high-quality, targeted applications per week (quality over volume)",
                                    "Apply through company career pages directly (not just aggregators) for higher visibility",
                                    "Track every application with dates, follow-ups, and status — use TrackMyOPT's Job Tracker",
                                ],
                            },
                            {
                                phase: "Phase 3: Network (Ongoing)",
                                icon: Users,
                                color: "purple",
                                tips: [
                                    "Reach out to alumni at target companies via LinkedIn — ask for informational interviews, not jobs",
                                    "Attend university career fairs and company info sessions (many recruit OPT-eligible candidates)",
                                    "Join professional associations in your field — many offer student memberships and job boards",
                                    "Engage in LinkedIn content (comment on posts, share insights) to build visibility with recruiters",
                                ],
                            },
                            {
                                phase: "Phase 4: Follow Up (After Each Application)",
                                icon: MessageSquare,
                                color: "amber",
                                tips: [
                                    "Send a follow-up email 7-10 days after applying if no response",
                                    "After interviews, send personalized thank-you notes within 24 hours",
                                    "If rejected, ask for feedback — it builds relationships for future openings",
                                    "Keep networking contacts warm with quarterly check-ins even after landing a job",
                                ],
                            },
                        ].map((item, i) => (
                            <div key={i} className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-300 text-sm font-bold">{i + 1}</div>
                                    {item.phase}
                                </h3>
                                <ul className="space-y-1.5">
                                    {item.tips.map((tip, j) => (
                                        <li key={j} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />{tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                        Read more: <Link href="/blog/f1-visa-jobs-guide" className="text-blue-600 dark:text-blue-400 hover:underline">F-1 Visa Jobs 2026: Complete Job Search Guide</Link>
                    </p>
                </section>

                {/* Section 5 */}
                <section id="h1b-sponsors" className="mb-16 scroll-mt-20">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                        <Building2 className="w-7 h-7 text-amber-500 flex-shrink-0" />Finding H-1B Sponsor Companies
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Not all employers sponsor H-1B visas, and among those who do, approval rates vary dramatically. Your job search must be data-driven. Here's how to find and evaluate potential sponsors.
                    </p>
                    <div className="space-y-4 mb-6">
                        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">How to Research H-1B Sponsors</h3>
                            <ul className="space-y-1.5">
                                {[
                                    "Department of Labor (DOL) LCA disclosure data — shows every H-1B filing by employer, job title, and salary",
                                    "USCIS H-1B Employer Data Hub — official approval/denial counts by employer and fiscal year",
                                    "TrackMyOPT H-1B Sponsor Database — 25,000+ employers indexed with approval rates, fraud alerts, and salary ranges",
                                    "LinkedIn job posts — filter for 'visa sponsorship available' in job descriptions",
                                    "MyVisaJobs.com — aggregates H-1B data with job listings and green card sponsor info",
                                ].map((tip, i) => (
                                    <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />{tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">H-1B Sponsorship by Industry</h3>
                    <div className="grid sm:grid-cols-2 gap-3 mb-6">
                        {[
                            { industry: "Technology", examples: "Google, Amazon, Microsoft, Meta, Apple", rate: "Very High", approx: "~60% of all H-1B filings" },
                            { industry: "Finance & Banking", examples: "JPMorgan, Goldman Sachs, Citi, Morgan Stanley", rate: "High", approx: "~8% of filings" },
                            { industry: "Consulting", examples: "Deloitte, EY, PwC, McKinsey, Accenture", rate: "High", approx: "~10% of filings" },
                            { industry: "Healthcare & Biotech", examples: "Pfizer, Johnson & Johnson, Mayo Clinic, Genentech", rate: "Moderate-High", approx: "~6% of filings" },
                            { industry: "Academia & Research", examples: "Universities, research labs, teaching hospitals", rate: "Cap-Exempt", approx: "No lottery required" },
                            { industry: "Manufacturing & Energy", examples: "Intel, GM, ExxonMobil, Caterpillar, Boeing", rate: "Moderate", approx: "~4% of filings" },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Briefcase className="w-4 h-4 text-amber-500" />{item.industry}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.examples}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">Sponsorship: {item.rate}</span>
                                    <span className="text-xs text-gray-400">{item.approx}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                        <p className="text-blue-800 dark:text-blue-200 text-sm flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span><strong>Pro tip:</strong> Cap-exempt employers (universities, nonprofit research organizations, government research labs) can sponsor H-1B visas year-round — no lottery required. If you're in STEM or research, this path bypasses lottery risk entirely.</span>
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-4">
                        <Link href="/blog/top-h1b-sponsor-companies-2026" className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
                            Top H-1B Sponsor Companies 2026 <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                        <Link href="/blog/h1b-approval-rates-by-company" className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
                            H-1B Approval Rates by Company <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                        <Link href="/features/sponsors" className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
                            Search TrackMyOPT Sponsor Database <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </section>

                {/* Section 6 */}
                <section id="interview-prep" className="mb-16 scroll-mt-20">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                        <MessageSquare className="w-7 h-7 text-rose-500 flex-shrink-0" />Interview Preparation for F-1 Students
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                        As an international student, you'll face the same technical and behavioral interviews as everyone else — plus questions about work authorization. How you handle these questions can make or break an offer.
                    </p>
                    <div className="space-y-4 mb-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Work Authorization Questions: What to Say</h3>
                        <div className="space-y-3">
                            {[
                                {
                                    question: "\"Are you authorized to work in the United States?\"",
                                    answer: "\"Yes, I am authorized to work in the US through OPT (Optional Practical Training). I have [12/36] months of work authorization and am available to start immediately.\"",
                                    note: "Confident, factual, forward-looking.",
                                },
                                {
                                    question: "\"Will you require sponsorship now or in the future?\"",
                                    answer: "\"I currently have work authorization through OPT. For long-term employment, I would eventually need H-1B sponsorship, which I know [Company] has successfully sponsored in the past.\"",
                                    note: "Honest, but frames it positively by referencing their track record.",
                                },
                                {
                                    question: "\"How long can you legally work here?\"",
                                    answer: "\"My current OPT authorization provides [12/36] months. With STEM OPT extension, that extends to 3 years total, and H-1B sponsorship would provide long-term authorization.\"",
                                    note: "Shows you understand the timeline and have a path forward.",
                                },
                            ].map((item, i) => (
                                <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white italic mb-1">{item.question}</p>
                                    <p className="text-sm text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mb-2">{item.answer}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.note}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                        <h3 className="font-bold text-red-900 dark:text-red-100 text-sm mb-2 flex items-center gap-2"><XCircle className="w-4 h-4" />What NOT to Say in Interviews</h3>
                        <ul className="space-y-1">
                            {[
                                "\"I desperately need sponsorship\" — never signal desperation",
                                "\"I'll lose my status if I don't get a job\" — frames you as a risk",
                                "\"My visa expires on [date]\" — too much detail; keep it positive",
                                "\"I don't know how work authorization works\" — always be prepared",
                                "Details about lottery odds, processing times, or political uncertainty",
                            ].map((item, i) => (
                                <li key={i} className="text-sm text-red-800 dark:text-red-200 flex items-start gap-2">
                                    <XCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />{item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Technical & Behavioral Prep</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                        {[
                            { type: "Technical", tips: ["Practice on LeetCode/HackerRank (2+ months)", "Study system design for senior roles", "Prepare 2-3 project deep-dives with metrics", "Know your tech stack inside and out"] },
                            { type: "Behavioral", tips: ["Use STAR method (Situation, Task, Action, Result)", "Prepare 8-10 stories covering leadership, conflict, failure, teamwork", "Practice with mock interviews (Pramp, Interviewing.io)", "Research company values and weave them into answers"] },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{item.type} Preparation</h4>
                                <ul className="space-y-1">
                                    {item.tips.map((t, j) => (
                                        <li key={j} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />{t}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section 7 */}
                <section id="salary-negotiation" className="mb-16 scroll-mt-20">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                        <DollarSign className="w-7 h-7 text-emerald-500 flex-shrink-0" />Salary Negotiation as an International Student
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        Many F-1 students accept the first offer they receive because they feel they can't negotiate — they need sponsorship and don't want to jeopardize it. This is a costly mistake. Employers who sponsor H-1B visas are investing $5,000-$10,000+ in legal fees; they want you to accept and stay. You have more leverage than you think.
                    </p>
                    <div className="space-y-4 mb-6">
                        {[
                            {
                                title: "Know the Prevailing Wage Floor",
                                desc: "The DOL prevailing wage is the legal minimum an employer must pay an H-1B worker for your occupation and location. Look it up at foreignlaborcert.doleta.gov. This is your absolute floor — not your target.",
                            },
                            {
                                title: "Research Market Rates",
                                desc: "Use Levels.fyi (tech), Glassdoor, Payscale, and LinkedIn Salary Insights to find the market range. Target the 50th-75th percentile for your role, experience level, and city.",
                            },
                            {
                                title: "Don't Anchor Low Because of Sponsorship",
                                desc: "Sponsorship is a normal business cost — like relocation or signing bonuses. Companies budget for it. Never say 'I'll accept less because you're sponsoring me.' Frame it as mutual investment.",
                            },
                            {
                                title: "Negotiate the Full Package",
                                desc: "If base salary is firm, negotiate sign-on bonus, stock/RSUs, relocation assistance, start date flexibility, PTO, or professional development budget. Total compensation matters more than base.",
                            },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-300 text-xs font-bold">{i + 1}</div>
                                    {item.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                        <h3 className="font-bold text-emerald-900 dark:text-emerald-100 text-sm mb-2">Sample Negotiation Script</h3>
                        <p className="text-emerald-800 dark:text-emerald-200 text-sm italic">
                            "Thank you for the offer — I'm excited about this opportunity. Based on my research of market rates for [role] in [city], and the value I'd bring with [specific skill/experience], I was hoping we could discuss a base salary closer to $[X]. I've also seen that the prevailing wage for this position is $[Y], which supports this range. Is there flexibility here?"
                        </p>
                    </div>
                </section>

                {/* Section 8 */}
                <section id="opt-to-h1b" className="mb-16 scroll-mt-20">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                        <TrendingUp className="w-7 h-7 text-purple-500 flex-shrink-0" />The OPT to H-1B Pipeline
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                        The most common long-term path for F-1 students is OPT → STEM OPT Extension → H-1B. Here's the timeline and what to expect at each stage.
                    </p>
                    <div className="space-y-4 mb-6">
                        {[
                            { period: "Year 1: Initial OPT", desc: "12 months of work authorization after graduation. Start working immediately. Your employer should begin planning H-1B registration by fall if lottery is in March.", color: "blue" },
                            { period: "Month 10-11: Apply for STEM OPT", desc: "If you have a STEM degree, file for the 24-month STEM OPT extension before your initial OPT expires. You can file up to 90 days before expiration.", color: "indigo" },
                            { period: "Year 1 March: First H-1B Lottery", desc: "Employer registers you for the H-1B lottery (registration period: early-to-mid March). Results arrive late March. If selected, employer files full petition by June.", color: "purple" },
                            { period: "Year 2 March: Second Attempt (if needed)", desc: "If not selected in Year 1, your STEM OPT keeps you working legally. Enter the lottery again with the same or different employer.", color: "violet" },
                            { period: "Year 3 March: Third Attempt (if needed)", desc: "Final lottery attempt while on STEM OPT. With 3 shots at ~25-30% odds, the cumulative probability of being selected at least once is roughly 58-66%.", color: "fuchsia" },
                            { period: "October 1: H-1B Starts", desc: "If selected and approved, H-1B status begins October 1. Cap-gap extension bridges your OPT to this date. You transition from F-1 to H-1B.", color: "emerald" },
                        ].map((step, i) => (
                            <div key={i} className="flex gap-4 items-start">
                                <div className="flex-shrink-0 w-3 h-3 rounded-full bg-purple-500 mt-2 ring-4 ring-purple-100 dark:ring-purple-900/50" />
                                <div className="flex-1 pb-4 border-l-2 border-purple-100 dark:border-zinc-800 pl-6 -ml-[7px]">
                                    <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">{step.period}</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-4">
                        <p className="text-amber-800 dark:text-amber-200 text-sm flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span><strong>Plan B, C, and D.</strong> Even with 3 lottery attempts, there's a 34-42% chance of never being selected. Always have backup plans: cap-exempt employers, O-1 visa, employer-sponsored green card, or international career options.</span>
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link href="/blog/opt-to-h1b-transition" className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
                            Full OPT to H-1B Timeline Guide <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                        <Link href="/blog/h1b-cap-gap-extension" className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
                            H-1B Cap-Gap Extension Explained <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </section>

                {/* Section 9 */}
                <section id="alternative-visas" className="mb-16 scroll-mt-20">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                        <Globe className="w-7 h-7 text-cyan-500 flex-shrink-0" />Beyond H-1B: Alternative Work Visas
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                        H-1B is the most common path, but it's not the only one. Depending on your background, achievements, and career stage, other visa categories may be viable — some without a lottery.
                    </p>
                    <div className="space-y-3">
                        {[
                            { visa: "O-1: Extraordinary Ability", desc: "For individuals with extraordinary achievement in sciences, arts, education, business, or athletics. Requires evidence of sustained national/international acclaim. No lottery, no cap — but a high evidentiary bar.", fit: "Researchers with publications, award winners, startup founders with press coverage" },
                            { visa: "L-1: Intracompany Transferee", desc: "For employees being transferred from a foreign office to a US office of the same company. Requires 1 year of continuous employment abroad in the prior 3 years. L-1A (managers) and L-1B (specialized knowledge).", fit: "Those willing to work abroad for 1+ year first, then transfer to US" },
                            { visa: "EB-1: Priority Workers (Green Card)", desc: "Direct path to green card for extraordinary ability (EB-1A), outstanding researchers (EB-1B), or multinational managers (EB-1C). EB-1A can be self-petitioned — no employer needed.", fit: "PhD holders, published researchers, recognized experts" },
                            { visa: "EB-2/EB-3: Employer-Sponsored Green Card", desc: "Employer sponsors you for permanent residency through the PERM labor certification process. EB-2 requires an advanced degree or exceptional ability; EB-3 requires a bachelor's degree.", fit: "Anyone with an employer willing to invest in long-term sponsorship" },
                            { visa: "E-2: Treaty Investor", desc: "For nationals of treaty countries who invest a substantial amount in a US business. Does not lead directly to a green card but is renewable indefinitely.", fit: "Entrepreneurs from treaty countries with capital to invest" },
                            { visa: "TN: USMCA Professional", desc: "For Canadian and Mexican citizens in specific professional occupations. No cap, no lottery, renewable indefinitely. Much simpler process than H-1B.", fit: "Canadian/Mexican citizens in qualifying professions (engineers, accountants, scientists, etc.)" },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-semibold text-gray-900 dark:text-white">{item.visa}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.desc}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2"><strong>Best for:</strong> {item.fit}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section 10 */}
                <section id="permanent-residency" className="mb-16 scroll-mt-20">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                        <Award className="w-7 h-7 text-amber-500 flex-shrink-0" />The Path to Permanent Residency
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                        For many F-1 students, the ultimate goal is a green card — permanent residency. The most common employer-sponsored path is the EB-2 or EB-3 category through the PERM process. Here's how it works.
                    </p>
                    <div className="space-y-4 mb-6">
                        {[
                            { step: "PERM Labor Certification", desc: "Employer must prove no qualified US worker is available for the position. Requires job advertising, recruitment, and DOL approval. Processing: 6-18 months." },
                            { step: "I-140: Immigrant Petition", desc: "Employer files Form I-140 to classify you as a priority worker. USCIS evaluates your qualifications against the job requirements. Processing: 4-12 months (premium processing available for ~$2,805)." },
                            { step: "Priority Date & Visa Bulletin", desc: "Your priority date is the date PERM was filed. You must wait until your priority date becomes 'current' per the monthly Visa Bulletin. For most countries, this is immediate. For India and China, backlogs can be years." },
                            { step: "I-485: Adjustment of Status", desc: "Once your priority date is current, file I-485 to adjust to permanent resident status. You can also file for EAD and advance parole concurrently. Processing: 6-24 months." },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 items-start">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-700 dark:text-amber-300 text-sm font-bold">{i + 1}</div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{item.step}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Timeline Expectations by Country of Birth</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-zinc-800">
                                    {["Country of Birth", "EB-2 Wait", "EB-3 Wait", "EB-1 Wait"].map(h => (
                                        <th key={h} className="text-left p-3 font-semibold text-gray-900 dark:text-white border dark:border-zinc-700">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ["India", "10-15+ years", "10+ years", "2-4 years"],
                                    ["China (mainland)", "3-5 years", "3-5 years", "1-2 years"],
                                    ["All other countries", "Current (no wait)", "Current (no wait)", "Current (no wait)"],
                                ].map(([country, eb2, eb3, eb1], i) => (
                                    <tr key={i} className={i % 2 === 0 ? "bg-gray-50 dark:bg-zinc-900" : ""}>
                                        <td className="p-3 border dark:border-zinc-700 font-medium text-gray-900 dark:text-white">{country}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{eb2}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{eb3}</td>
                                        <td className="p-3 border dark:border-zinc-700 text-gray-700 dark:text-gray-300">{eb1}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Source: USCIS Visa Bulletin (March 2026). Wait times are approximate and change monthly.
                    </p>
                </section>

                {/* Section 11 */}
                <section id="common-mistakes" className="mb-16 scroll-mt-20">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                        <AlertTriangle className="w-7 h-7 text-red-500 flex-shrink-0" />Common Career Mistakes F-1 Students Make
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                        After advising thousands of international students, these are the most costly mistakes we see — and how to avoid them.
                    </p>
                    <div className="space-y-3">
                        {[
                            { mistake: "Starting the job search too late", fix: "Begin 6 months before graduation. The immigration timeline doesn't wait for you." },
                            { mistake: "Applying to companies that don't sponsor", fix: "Verify H-1B sponsorship history before applying. Use DOL data or TrackMyOPT's sponsor database." },
                            { mistake: "Using a non-ATS-friendly resume format", fix: "Avoid graphics, tables, columns. Use clean formatting with standard headings. Test with an ATS parser." },
                            { mistake: "Revealing too much about visa status in interviews", fix: "State 'I'm authorized to work in the US' and keep it brief. Don't volunteer lottery odds or expiration dates." },
                            { mistake: "Accepting the first offer without negotiating", fix: "Research market rates, know the prevailing wage, and negotiate. Sponsoring employers expect it." },
                            { mistake: "Not tracking unemployment days", fix: "OPT has a strict 90-day unemployment limit (150 for STEM). Track every day — your status depends on it." },
                            { mistake: "Ignoring networking and relying only on online applications", fix: "70%+ of jobs come through networking. Attend career fairs, connect with alumni, and do informational interviews." },
                            { mistake: "Not having a backup plan if H-1B lottery fails", fix: "Always have Plan B (STEM OPT extension), Plan C (cap-exempt employer), and Plan D (alternative visa or international role)." },
                            { mistake: "Failing to file STEM OPT extension on time", fix: "File up to 90 days before your OPT expires. Missing the deadline means losing work authorization and potentially your status." },
                            { mistake: "Not consulting an immigration attorney for complex situations", fix: "Free advice online has limits. For multi-employer situations, status gaps, or alternative visas, invest in legal counsel." },
                        ].map((item, i) => (
                            <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 flex gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 text-xs font-bold">{i + 1}</div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{item.mistake}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{item.fix}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section 12 */}
                <section id="tools-resources" className="mb-16 scroll-mt-20">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                        <Wrench className="w-7 h-7 text-indigo-500 flex-shrink-0" />Tools & Resources for Your Job Search
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                        The right tools can save hundreds of hours and reduce costly mistakes. Here's what we recommend.
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">TrackMyOPT Tools</h3>
                    <div className="grid sm:grid-cols-2 gap-3 mb-8">
                        {[
                            { name: "AI Resume Generator", desc: "Build ATS-optimized resumes tailored for each application. Auto-extracts keywords from job descriptions.", href: "/features/resume-ai", icon: FileText },
                            { name: "Job Application Tracker", desc: "Track every application, interview, and follow-up while monitoring your OPT unemployment days.", href: "/features/job-tracker", icon: Briefcase },
                            { name: "H-1B Sponsor Database", desc: "Search 25,000+ verified H-1B sponsors with approval rates, salary data, and fraud indicators.", href: "/features/sponsors", icon: Building2 },
                            { name: "OPT Unemployment Clock", desc: "Real-time countdown of your 90-day (OPT) or 150-day (STEM OPT) cumulative unemployment limit.", href: "/dashboard/opt-tools/opt-clock", icon: Clock },
                        ].map((tool, i) => (
                            <Link key={i} href={tool.href} className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group block">
                                <div className="flex items-center gap-2 mb-1">
                                    <tool.icon className="w-4 h-4 text-blue-500" />
                                    <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{tool.name}</h4>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{tool.desc}</p>
                            </Link>
                        ))}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">External Resources</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                        {[
                            { name: "LinkedIn", desc: "Professional networking, job search, and recruiter visibility", url: "https://www.linkedin.com" },
                            { name: "Glassdoor", desc: "Company reviews, salary data, and interview questions", url: "https://www.glassdoor.com" },
                            { name: "Levels.fyi", desc: "Total compensation data for tech companies (base + stock + bonus)", url: "https://www.levels.fyi" },
                            { name: "DOL Prevailing Wage Search", desc: "Look up required H-1B minimum salaries by occupation and location", url: "https://www.foreignlaborcert.doleta.gov/owls.cfm" },
                            { name: "USCIS H-1B Employer Data Hub", desc: "Official data on H-1B petitions filed and approved by employer", url: "https://www.uscis.gov/tools/reports-and-studies/h-1b-employer-data-hub" },
                            { name: "MyVisaJobs", desc: "H-1B and green card sponsor data with job listings", url: "https://www.myvisajobs.com" },
                        ].map((item, i) => (
                            <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors block">
                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{item.name}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                            </a>
                        ))}
                    </div>
                    <div className="mt-4">
                        <Link href="/glossary" className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
                            Browse our Immigration Glossary for 100+ key terms →
                        </Link>
                    </div>
                </section>

                {/* FAQ */}
                <section className="mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {faqItems.map((faq, i) => (
                            <div key={i} className="p-5 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{faq.q}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Related Guides */}
            <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 mt-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Related Guides</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                    <Link href="/blog/ats-resume-international-students" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ ATS Resume Guide for International Students</Link>
                    <Link href="/blog/top-h1b-sponsor-companies-2026" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ Top H-1B Sponsor Companies 2026</Link>
                    <Link href="/blog/opt-to-h1b-transition" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ OPT to H-1B Transition Guide</Link>
                    <Link href="/blog/h1b-approval-rates-by-company" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ H-1B Approval Rates by Company</Link>
                    <Link href="/blog/h1b-cap-gap-extension" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ H-1B Cap-Gap Extension Explained</Link>
                    <Link href="/blog/f1-visa-jobs-guide" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">→ F-1 Visa Jobs: Complete Guide</Link>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800 flex flex-wrap gap-4">
                    <Link href="/features/resume-ai" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">AI Resume Builder →</Link>
                    <Link href="/features/sponsors" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">H-1B Sponsor Database →</Link>
                    <Link href="/features/job-tracker" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Job Application Tracker →</Link>
                    <Link href="/glossary" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Immigration Glossary →</Link>
                    <Link href="/pricing" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">View Pricing →</Link>
                </div>
            </div>

            <AuthorBio />

            {/* CTA */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white mt-12">
                <h2 className="text-2xl font-bold mb-3">Launch Your Career with TrackMyOPT</h2>
                <p className="text-blue-100 mb-6 max-w-lg mx-auto">AI resume builder, H-1B sponsor database, job tracker, and unemployment clock — all the tools F-1 students need in one place.</p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <Link href="/features/resume-ai" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
                        Build Your Resume <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link href="/features/sponsors" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-400 transition-colors border border-blue-400">
                        Search H-1B Sponsors <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* JSON-LD: Article */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Article",
                    "headline": "F-1 Career Guide 2026: From OPT to H-1B and Beyond",
                    "description": "The complete career guide for F-1 international students covering job search, resume building, H-1B sponsors, interviews, salary negotiation, and the path to permanent residency.",
                    "author": { "@type": "Organization", "name": "TrackMyOPT", "url": "https://www.trackmyopt.com" },
                    "publisher": { "@type": "Organization", "name": "TrackMyOPT", "logo": { "@type": "ImageObject", "url": "https://www.trackmyopt.com/TrackMyOPT Logo/Favicon.png" } },
                    "datePublished": "2026-03-12",
                    "dateModified": "2026-03-12",
                    "mainEntityOfPage": "https://www.trackmyopt.com/guides/opt-career",
                    "keywords": ["F-1 career guide", "international student job search", "OPT to H-1B", "H-1B sponsor companies", "ATS resume", "salary negotiation", "permanent residency"],
                    "articleSection": ["Career Guide", "Immigration", "Job Search"],
                    "wordCount": 5000,
                })
            }} />

            {/* JSON-LD: FAQPage */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "FAQPage",
                    "mainEntity": faqItems.map(faq => ({
                        "@type": "Question",
                        "name": faq.q,
                        "acceptedAnswer": { "@type": "Answer", "text": faq.a },
                    })),
                })
            }} />
        </article>
    );
}
