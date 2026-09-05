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
    gradient: 'from-blue-500 to-indigo-600',
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
    gradient: 'from-emerald-500 to-teal-600',
    tools: [
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
        description: 'Check your USCIS case status with your receipt number',
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
    gradient: 'from-amber-500 to-orange-600',
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
    gradient: 'from-purple-500 to-violet-600',
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
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        {/* Hero */}
        <section className="pt-24 pb-12 sm:pt-28 sm:pb-16 text-center px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
              Free OPT & Immigration Tools
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Track key OPT dates, explore H-1B sponsors, and plan your next
              career step.
            </p>
          </div>
        </section>

        {/* Tool Categories */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto space-y-16">
            {(
              Object.entries(TOOLS) as [
                keyof typeof TOOLS,
                (typeof TOOLS)[keyof typeof TOOLS],
              ][]
            ).map(([key, category]) => (
              <div key={key}>
                <div
                  className={`inline-block px-4 py-2 rounded-lg bg-gradient-to-r ${category.gradient} text-white font-semibold text-sm sm:text-base mb-6`}
                >
                  {category.title}
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
                  {category.tools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <Link
                        key={tool.name}
                        href={tool.href}
                        className="group relative flex flex-col p-5 sm:p-6 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-900/50 transition-all duration-200"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex-shrink-0 transition-colors" />
                              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                {tool.name}
                              </h3>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                              {tool.description}
                            </p>
                          </div>
                          <span
                            className={`flex-shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              tool.badge === 'Pro'
                                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            }`}
                          >
                            {tool.badge}
                          </span>
                        </div>
                        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:gap-2 transition-all">
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
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 sm:p-12 text-white">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Ready to Protect Your OPT Status?
              </h2>
              <p className="text-blue-100 mb-8 max-w-xl mx-auto">
                Use the core tools at no cost. No credit card or trial required.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
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
