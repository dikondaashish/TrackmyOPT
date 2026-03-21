import Link from "next/link";
import { ArrowRight, Clock, Briefcase, Search, FileText, Shield, Users, Activity, Heart, Chrome } from "lucide-react";

const features = [
  {
    title: "OPT Compliance Tracker",
    description: "Automated unemployment day tracking, deadline alerts, and status monitoring to keep your F-1 status safe.",
    href: "/features/compliance",
    icon: Shield,
    color: "blue",
  },
  {
    title: "USCIS Case Status",
    description: "Real-time case tracking with instant alerts when your EAD or petition status changes.",
    href: "/features/case-status",
    icon: Activity,
    color: "green",
  },
  {
    title: "AI Resume Builder",
    description: "ATS-optimized resumes tailored for international students. Beat applicant tracking systems.",
    href: "/features/resume-ai",
    icon: FileText,
    color: "purple",
  },
  {
    title: "H-1B Sponsor Database",
    description: "Search 25,000+ verified H-1B sponsors with approval rates, salaries, and E-Verify status.",
    href: "/features/sponsors",
    icon: Search,
    color: "indigo",
  },
  {
    title: "Job Application Tracker",
    description: "Organize your job search with a built-in CRM. Track applications, interviews, and offers.",
    href: "/features/job-tracker",
    icon: Briefcase,
    color: "amber",
  },
  {
    title: "Chrome Extension",
    description: "Track OPT timelines and save jobs directly from your browser on LinkedIn, Indeed, and more.",
    href: "/features/extension",
    icon: Chrome,
    color: "cyan",
  },
  {
    title: "Tax Filing Guide",
    description: "Step-by-step tax filing guidance for F-1 students — federal, state, and treaty benefits.",
    href: "/features/tax-filing",
    icon: Clock,
    color: "rose",
  },
  {
    title: "Health Insurance Finder",
    description: "Compare health insurance options for OPT students. ACA, short-term, and university plans.",
    href: "/features/health-insurance",
    icon: Heart,
    color: "red",
  },
  {
    title: "Student Community",
    description: "Connect with thousands of F-1 students navigating OPT, STEM OPT, and H-1B transitions.",
    href: "/features/community",
    icon: Users,
    color: "teal",
  },
];

const colorMap: Record<string, string> = {
  blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  indigo: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
  amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  cyan: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400",
  rose: "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400",
  red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  teal: "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400",
};

export default function FeaturesPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Everything F-1 Students Need to Stay Compliant
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          From OPT timeline tracking to H-1B sponsor search — TrackMyOPT gives you
          every tool to protect your status and advance your career.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link
              key={feature.href}
              href={feature.href}
              className="group p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg transition-all"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${colorMap[feature.color]}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {feature.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {feature.description}
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                Learn more <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-16 text-center">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-3">Ready to protect your OPT status?</h2>
          <p className="text-blue-100 mb-6 max-w-lg mx-auto">
            Join 2,500+ F-1 students who trust TrackMyOPT to stay compliant and find their next opportunity.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
