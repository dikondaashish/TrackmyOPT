import Link from 'next/link';
import { safeSerializeJsonLd } from '@/lib/safe-json-ld';
import {
  Calculator,
  Clock,
  Search,
  Briefcase,
  FileText,
  Shield,
  Heart,
  BookOpen,
  ArrowRight,
  Building2,
} from 'lucide-react';

const TOOLS = {
  opt: {
    title: 'OPT Timeline & Compliance',
    tools: [
      {
        name: 'OPT Filing Window Calculator',
        description:
          'Calculate your I-765 filing window based on your program end date',
        href: '/tools/opt-apply',
        icon: Calculator,
        badge: 'Free',
      },
      {
        name: 'OPT Unemployment Clock',
        description: 'Track your 90-day unemployment limit in real-time',
        href: '/tools/opt-clock',
        icon: Clock,
        badge: 'Free',
      },
      {
        name: 'STEM OPT Extension Calculator',
        description: 'Calculate your STEM OPT filing window and deadlines',
        href: '/tools/stem-apply',
        icon: Calculator,
        badge: 'Free',
      },
      {
        name: 'STEM OPT Unemployment Clock',
        description: 'Monitor your 150-day cumulative unemployment limit',
        href: '/tools/stem-clock',
        icon: Clock,
        badge: 'Free',
      },
    ],
  },
  uscis: {
    title: 'USCIS Case Tracking',
    tools: [
      {
        name: 'OPT Decision Window',
        description:
          'Stop refreshing — see where your OPT case stands against similar filings (no account needed)',
        href: '/tools/opt-decision-window',
        icon: Search,
        badge: 'Free',
      },
      {
        name: 'E-Verify Employer Search',
        description:
          'Search the official USCIS employer database and understand STEM OPT requirements',
        href: '/e-verify-employer-search',
        icon: Building2,
        badge: 'Free',
      },
      {
        name: 'Case Status Checker',
        description: 'Track live USCIS status with your receipt number',
        href: '/dashboard/case-status',
        icon: Search,
        badge: 'Free',
      },
      {
        name: 'Daily Auto-Checks',
        description: 'Automatic daily monitoring with instant email alerts',
        href: '/features/case-status',
        icon: Search,
        badge: 'Pro',
      },
    ],
  },
  career: {
    title: 'H-1B & Career',
    tools: [
      {
        name: 'H-1B Sponsor Database',
        description: 'Search 25,000+ companies that sponsor H-1B visas',
        href: '/dashboard/career/h1b-sponsors',
        icon: Briefcase,
        badge: 'Free',
      },
      {
        name: 'Job Application Tracker',
        description:
          'Track applications with Kanban board, table, and calendar views',
        href: '/dashboard/career/job-tracker',
        icon: Briefcase,
        badge: 'Free',
      },
      {
        name: 'AI Resume Generator',
        description:
          'Generate ATS-optimized resumes tailored to job descriptions',
        href: '/dashboard/career/resume-generator',
        icon: FileText,
        badge: 'Free',
      },
      {
        name: 'ATS Resume Scanner',
        description:
          'Score your resume against ATS systems and get improvement tips',
        href: '/dashboard/career/ats-scanner',
        icon: FileText,
        badge: 'Free',
      },
    ],
  },
  resources: {
    title: 'Immigration Resources',
    tools: [
      {
        name: 'Tax Filing Guide',
        description:
          'F-1 student tax resources: Form 8843, 1040-NR, FICA exemption',
        href: '/dashboard/tax-filing',
        icon: FileText,
        badge: 'Free',
      },
      {
        name: 'Health Insurance Finder',
        description: 'Find affordable health plans starting at $0/month',
        href: '/dashboard/opt-health-insurance-finder',
        icon: Heart,
        badge: 'Free',
      },
      {
        name: 'Document Vault',
        description: 'Securely store EAD, I-20, I-983, and other documents',
        href: '/features/compliance',
        icon: Shield,
        badge: 'Pro',
      },
      {
        name: 'Immigration Glossary',
        description: '50+ immigration terms explained in plain English',
        href: '/glossary',
        icon: BookOpen,
        badge: 'Free',
      },
    ],
  },
} as const;

// Icon tile colour per category: blue = OPT timeline and case status,
// violet = job search, amber = documents and reference material.
const CATEGORY_TILE: Record<keyof typeof TOOLS, string> = {
  opt: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300',
  uscis: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300',
  career: 'bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300',
  resources: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300',
};

const ALL_TOOLS = [
  ...TOOLS.opt.tools,
  ...TOOLS.uscis.tools,
  ...TOOLS.career.tools,
  ...TOOLS.resources.tools,
];

const itemListSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Free OPT & Immigration Tools for F-1 Students',
  description:
    'Free immigration tools for F-1 students: OPT timeline calculator, unemployment tracker, USCIS case checker, H-1B sponsor database, AI resume builder, and more.',
  numberOfItems: ALL_TOOLS.length,
  itemListElement: ALL_TOOLS.map((tool, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': 'SoftwareApplication',
      name: tool.name,
      description: tool.description,
      url: `https://www.trackmyopt.com${tool.href}`,
      applicationCategory: 'Immigration Tool',
    },
  })),
};

export default function ToolsPage() {
  return (
    <>
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="pt-24 pb-12 sm:pt-28 sm:pb-16 text-center px-4 bg-background">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 leading-tight">
              Free OPT & Immigration Tools
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Track key OPT dates, explore H-1B sponsors, and plan your next
              career step. 10,000+ people regularly use our free tools.
            </p>
          </div>
        </section>

        {/* Tool Categories */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-surface border-y border-border">
          <div className="max-w-6xl mx-auto space-y-16">
            {(
              Object.entries(TOOLS) as [
                keyof typeof TOOLS,
                (typeof TOOLS)[keyof typeof TOOLS],
              ][]
            ).map(([key, category]) => (
              <div key={key}>
                <h2 className="mb-6 text-2xl font-bold text-foreground">
                  {category.title}
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
                  {category.tools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <Link
                        key={tool.name}
                        href={tool.href}
                        className="group relative flex flex-col p-5 sm:p-6 surface-card-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${CATEGORY_TILE[key]}`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <h3 className="font-semibold text-foreground truncate">
                                {tool.name}
                              </h3>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {tool.description}
                            </p>
                          </div>
                          {tool.badge === 'Pro' && (
                            <span className="flex-shrink-0 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              {tool.badge}
                            </span>
                          )}
                        </div>
                        <span className="mt-auto pt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:text-primary-hover transition-colors">
                          Try Free <ArrowRight className="w-4 h-4" />
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 bg-ink text-ink-foreground">
          <div className="max-w-4xl mx-auto text-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Ready to Protect Your OPT Status?
              </h2>
              <p className="text-ink-muted mb-8 max-w-xl mx-auto">
                Use the core tools at no cost. No credit card or trial required.
              </p>
              <Link
                href="/login"
                className="inline-flex min-h-12 items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow-button hover:bg-blue-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
              >
                Start Tracking Free <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* JSON-LD ItemList Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeSerializeJsonLd(itemListSchema),
          }}
        />
      </main>
    </>
  );
}
