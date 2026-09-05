'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Search,
  Building2,
  Shield,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Scale,
  ExternalLink,
  XCircle,
  Clock,
  Briefcase,
  ArrowRight,
} from 'lucide-react';
import { FeatureHero } from '@/components/features/FeatureHero';
import { FeatureFAQ } from '@/components/features/FeatureFAQ';
import { FeatureServiceSchema } from '@/components/features/FeatureServiceSchema';
import { FeatureWhyMatters } from '@/components/features/FeatureWhyMatters';
import { FeatureCTA } from '@/components/features/FeatureCTA';

import { H2, Lead, P } from '@/components/ui/typography';

// Signal Grid Component
function SignalGrid() {
  const signals = [
    {
      icon: CheckCircle2,
      title: 'Historical activity',
      description: 'Review the H-1B activity recorded for recent fiscal years',
      color: 'emerald',
    },
    {
      icon: AlertTriangle,
      title: 'Address context',
      description: 'See when a profile is marked with a potential office cluster address',
      color: 'amber',
    },
    {
      icon: Scale,
      title: 'Representative data',
      description: 'Review the listed top representative law firm when available',
      color: 'purple',
    },
    {
      icon: TrendingUp,
      title: 'Sponsor score',
      description: 'Compare a volume, consistency, and trend-based score',
      color: 'blue',
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 gap-6">
      {signals.map((signal, i) => (
        <motion.div
          key={signal.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 hover:shadow-lg transition-shadow"
        >
          <div
            className={`w-12 h-12 rounded-xl bg-${signal.color}-100 dark:bg-${signal.color}-900/30 flex items-center justify-center mb-4`}
          >
            <signal.icon
              className={`w-6 h-6 text-${signal.color}-600 dark:text-${signal.color}-400`}
            />
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            {signal.title}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {signal.description}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

// Data Stats Component
function DataStats() {
  const stats = [
    { value: '25', label: 'Profiles on Free' },
    { value: 'All', label: 'Profiles on Pro' },
    { value: '2021–25', label: 'Historical activity shown' },
    { value: 'LCA', label: 'Filing details on profiles' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="text-center"
        >
          <motion.div
            className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {stat.value}
          </motion.div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {stat.label}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

export default function SponsorsPage() {
  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        <FeatureServiceSchema
          name="H-1B Sponsor Database & Research Tool"
          description="Browse H-1B sponsor profiles with historical activity, calculated trends, and LCA filing details. Use it as research, not a guarantee that an employer will sponsor your visa."
          featurePath="/features/sponsors"
          faqItems={[
            {
              question: 'Where does your H-1B sponsor data come from?',
              answer:
                'Sponsor profiles and filing details are based on Department of Labor LCA data and derived employer summaries. A filing record is historical research, not confirmation of a current job opening or a future sponsorship decision.',
            },
            {
              question: 'What does the Sponsor Score mean?',
              answer:
                'The Sponsor Score is a 0–100 comparison based on recent H-1B activity volume, three-year consistency, and the direction of the recent trend. It is a research aid, not an approval rate or a prediction.',
            },
            {
              question: 'How do I know if a company still sponsors H-1B?',
              answer:
                'Recent FY2025 activity and the displayed trend can help you prioritize research. Neither one proves that a company is hiring now or will sponsor a particular role; confirm the policy with the employer.',
            },
            {
              question: 'What does the office-cluster label mean?',
              answer:
                'Some profiles are marked when the data identifies a potential virtual-office or cluster address. It is context for your research, not a finding of fraud or wrongdoing.',
            },
            {
              question: 'Can I see what roles companies sponsor for?',
              answer:
                'Yes! Each sponsor profile shows LCA filings including job titles, salary ranges, and work locations. You can see exactly what positions companies have sponsored historically.',
            },
            {
              question: 'Is this database free?',
              answer:
                'Free accounts can browse the top 25 sponsor profiles. Pro and Dedicated accounts can browse the full database and profile analytics.',
            },
          ]}
        />
        {/* Hero */}
        <FeatureHero
          badge="Most Popular"
          headline="H-1B sponsor history, without assumptions."
          subheadline="Research historical activity, calculated trends, and LCA filing details before you apply—then confirm current sponsorship with the employer."
          ctaText="Search Sponsors Free"
          ctaHref="/dashboard/sponsors"
          secondaryCta={{
            text: 'See Sample Data',
            href: '/dashboard/career/h1b-sponsors',
          }}
          visual={
            <div className="rounded-2xl border border-emerald-100 bg-white p-6 text-left shadow-xl dark:border-emerald-900/60 dark:bg-zinc-900">
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Sponsor profile</p>
              <h3 className="mt-2 text-xl font-bold text-gray-950 dark:text-white">Historical H-1B activity</h3>
              <ul className="mt-4 space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <li>• Recent activity and calculated trend</li>
                <li>• LCA job titles, wage ranges, and locations</li>
                <li>• Careers link and saved-company tools</li>
              </ul>
              <p className="mt-5 border-t border-gray-100 pt-4 text-xs text-gray-500 dark:border-zinc-800 dark:text-gray-400">Historical data is not a promise of current sponsorship.</p>
            </div>
          }
        />

        {/* Data Stats */}
        <section className="py-16 border-b border-gray-100 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <DataStats />
          </div>
        </section>

        {/* Feature 1: Search */}
        <section id="demo" className="py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-4">
                  <Search className="w-4 h-4" />
                  Instant Search
                </div>
                <H2>Find and compare sponsor profiles</H2>
                <P>
                  Search by company or location, then filter and sort profiles
                  by recorded activity, calculated score, industry, and trend.
                </P>
                <ul className="space-y-4">
                  {[
                    'Search company names and locations',
                    'Filter by industry, state, company size, and activity',
                    'Sort by recorded activity, score, or recent trend',
                    'Save profiles and add companies to your job tracker',
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-gray-700 dark:text-gray-300"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
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
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-8 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                  <h3 className="font-semibold text-gray-950 dark:text-white">What a profile can show</h3>
                  <ul className="mt-4 space-y-3 text-sm text-gray-700 dark:text-gray-300">
                    <li>Historical H-1B activity for 2021–2025</li>
                    <li>A calculated score and year-over-year trend</li>
                    <li>Available LCA job titles, wage ranges, and locations</li>
                    <li>Careers link and optional saved-company status</li>
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Feature 2: Intelligence Signals */}
        <section className="py-24 bg-gray-50 dark:bg-zinc-900/50 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
                <Shield className="w-4 h-4" />
                Profile context
              </div>
              <H2>Useful context, clearly scoped</H2>
              <Lead>
                The dashboard shows the data and calculated signals it has; it does not certify employers or predict visa outcomes.
              </Lead>
            </motion.div>

            <SignalGrid />
          </div>
        </section>

        {/* Feature 3: Responsible use */}
        <section className="py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="order-2 lg:order-1"
              >
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-8 dark:border-amber-900/60 dark:bg-amber-950/30">
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Research checklist</p>
                  <ol className="mt-4 space-y-3 text-sm text-gray-700 dark:text-gray-300">
                    <li>1. Use historical activity to identify employers to research.</li>
                    <li>2. Read the role and its requirements carefully.</li>
                    <li>3. Confirm sponsorship and E-Verify details directly with the employer.</li>
                  </ol>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="order-1 lg:order-2"
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-medium mb-4">
                  <AlertTriangle className="w-4 h-4" />
                  Responsible research
                </div>
                <H2>Use sponsor data as a starting point</H2>
                <P>
                  H-1B history can help you target your search, but it cannot verify a current opening, E-Verify enrollment, or whether an employer will sponsor you. Confirm those details directly with the employer.
                </P>
                <Link
                  href="/blog/stem-opt-employer-requirements"
                  className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold hover:gap-3 transition-all"
                >
                  Read our STEM OPT employer guide
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="border-y border-blue-100 bg-blue-50/70 py-10 dark:border-blue-950 dark:bg-blue-950/20">
          <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-5 px-4 sm:px-6 md:flex-row md:items-center lg:px-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                Planning for STEM OPT?
              </p>
              <h2 className="mt-1 text-2xl font-bold text-gray-950 dark:text-white">
                Check an employer in the official E-Verify database
              </h2>
              <p className="mt-2 max-w-2xl text-gray-600 dark:text-gray-300">
                Use the E-Verify search, then confirm the employer&apos;s Company ID
                with HR.
              </p>
            </div>
            <Link
              href="/e-verify-employer-search"
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
            >
              Search E-Verify
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* Why This Matters Section */}
        <FeatureWhyMatters
          headline="Research, then confirm"
          description="Historical data is useful for prioritizing employers. Your application decision should still depend on the current role and the employer's stated policy."
          accentColor="emerald"
          stats={[
            {
              value: '25',
              label: 'Profiles available on Free',
              icon: <Building2 className="w-5 h-5" />,
            },
            {
              value: 'All',
              label: 'Profiles available on Pro',
              icon: <XCircle className="w-5 h-5" />,
            },
            {
              value: '2021–25',
              label: 'Historical activity on sponsor profiles',
              icon: <Briefcase className="w-5 h-5" />,
            },
            {
              value: 'Direct',
              label: 'Employer confirmation remains essential',
              icon: <Clock className="w-5 h-5" />,
            },
          ]}
        />

        {/* FAQ Section */}
        <FeatureFAQ
          title="H-1B Sponsor Database FAQ"
          subtitle="Everything you need to know about finding H-1B sponsors"
          accentColor="emerald"
          items={[
            {
              question: 'Where does your H-1B sponsor data come from?',
              answer:
                'Sponsor profiles and filing details are based on Department of Labor LCA data and derived employer summaries. A filing record is historical research, not confirmation of a current job opening or a future sponsorship decision.',
            },
            {
              question: 'What does the Sponsor Score mean?',
              answer:
                'The Sponsor Score is a 0–100 comparison based on recent H-1B activity volume, three-year consistency, and the direction of the recent trend. It is a research aid, not an approval rate or a prediction.',
            },
            {
              question: 'How do I know if a company still sponsors H-1B?',
              answer:
                'Recent FY2025 activity and the displayed trend can help you prioritize research. Neither one proves that a company is hiring now or will sponsor a particular role; confirm the policy with the employer.',
            },
            {
              question: 'What does the office-cluster label mean?',
              answer:
                'Some profiles are marked when the data identifies a potential virtual-office or cluster address. It is context for your research, not a finding of fraud or wrongdoing.',
            },
            {
              question: 'Can I see what roles companies sponsor for?',
              answer:
                'Yes! Each sponsor profile shows LCA filings including job titles, salary ranges, and work locations. You can see exactly what positions companies have sponsored historically.',
            },
            {
              question: 'Is this database free?',
              answer:
                'Free accounts can browse the top 25 sponsor profiles. Pro and Dedicated accounts can browse the full database and profile analytics.',
            },
          ]}
        />

        {/* Final CTA */}
        <FeatureCTA
          headline="Start with the history. Confirm the current facts."
          subheadline="Use sponsor profiles to focus your research, then ask the employer about the role and its sponsorship policy."
          primaryCTA={{
            text: 'Search Sponsors Free',
            href: '/dashboard/career/h1b-sponsors',
          }}
          secondaryCTA={{
            text: 'Learn About H-1B',
            href: '/blog/top-h1b-sponsor-companies-2026',
          }}
          gradient="emerald"
          icon={<Building2 className="w-12 h-12 text-white" />}
          badge="25,000+ Sponsors"
        />
      </main>
    </>
  );
}
