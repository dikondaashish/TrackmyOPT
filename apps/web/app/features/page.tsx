import Link from "next/link";
import { ArrowRight, Clock, Briefcase, Search, FileText, Shield, Users, Activity, Heart, Chrome, FolderLock } from "lucide-react";

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
    description: "Decision window from similar cases, live status tracking, and Pro alerts when your EAD moves.",
    href: "/features/case-status",
    icon: Activity,
    color: "blue",
  },
  {
    title: "AI Resume Builder",
    description: "ATS-optimized resumes tailored for international students. Beat applicant tracking systems.",
    href: "/features/resume-ai",
    icon: FileText,
    color: "violet",
  },
  {
    title: "Document Vault",
    description: "Store I-20s, EAD copies, and USCIS notices with passcode lock and expiry reminders (Pro).",
    href: "/login?next=/dashboard/documents",
    icon: FolderLock,
    color: "amber",
  },
  {
    title: "H-1B Sponsor Database",
    description: "Search 25,000+ verified H-1B sponsors with approval rates, salaries, and E-Verify status.",
    href: "/features/sponsors",
    icon: Search,
    color: "emerald",
  },
  {
    title: "Job Application Tracker",
    description: "Organize your job search with a built-in CRM. Track applications, interviews, and offers.",
    href: "/features/job-tracker",
    icon: Briefcase,
    color: "violet",
  },
  {
    title: "Chrome Extension",
    description: "Track OPT timelines and save jobs directly from your browser on LinkedIn, Indeed, and more.",
    href: "/features/extension",
    icon: Chrome,
    color: "blue",
  },
  {
    title: "Tax Filing Guide",
    description: "Step-by-step tax filing guidance for F-1 students — federal, state, and treaty benefits.",
    href: "/features/tax-filing",
    icon: Clock,
    color: "amber",
  },
  {
    title: "Health Insurance Finder",
    description: "Compare health insurance options for OPT students. ACA, short-term, and university plans.",
    href: "/features/health-insurance",
    icon: Heart,
    color: "emerald",
  },
  {
    title: "Student Community",
    description: "Explore tools and community resources for OPT, STEM OPT, and H-1B transitions.",
    href: "/features/community",
    icon: Users,
    color: "slate",
  },
];

// Icon tiles are coded by meaning: blue = deadlines/status, violet = job
// search and AI tools, amber = documents and paperwork, emerald = sponsors
// and outcomes.
const colorMap: Record<string, string> = {
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300",
  violet: "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  slate: "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300",
};

export default function FeaturesPage() {
  return (
    <main>
      <section className="border-b border-border bg-surface">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Your OPT career companion
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Deadlines and case status, AI resumes and Document Vault, H-1B sponsors
            and job tracking — every tool to protect your status and land the next role.
          </p>
        </div>
      </section>

      <section className="bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.href}
                  href={feature.href}
                  className="surface-card-interactive group flex flex-col p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${colorMap[feature.color]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4 flex-1">
                    {feature.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Learn more <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-ink text-ink-foreground">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to protect your OPT status?</h2>
          <p className="text-ink-muted mb-8 max-w-lg mx-auto">
            Join 3,500+ people who have signed up for TrackMyOPT. Explore tools for OPT planning and your job search.
          </p>
          <Link
            href="/login"
            className="inline-flex h-11 items-center gap-2 px-6 bg-blue-600 text-white rounded-lg font-semibold shadow-button hover:bg-blue-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          >
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
