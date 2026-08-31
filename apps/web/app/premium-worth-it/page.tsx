import Link from 'next/link';
import { safeSerializeJsonLd } from '@/lib/safe-json-ld';
import {
  ArrowRight,
  Shield,
  Clock,
  Bell,
  FileCheck,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is TrackMyOPT premium worth it?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'TrackMyOPT Pro is useful for students who want daily reminders, daily USCIS case checks with change alerts, a document vault, and higher career-tool limits in one place.',
      },
    },
    {
      '@type': 'Question',
      name: "What does TrackMyOPT premium include that the free plan doesn't?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pro adds daily 9:00 AM ET OPT-tool reminders, unemployment alerts, daily USCIS case checks with change alerts, a document vault, full H-1B sponsor access, and higher career-tool limits.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I track OPT without TrackMyOPT premium?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Free includes core OPT tools, manual case refresh, the first 25 H-1B sponsor profiles, and step-by-step Chrome prefill. Pro adds automation and higher limits.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is TrackMyOPT free enough for OPT students?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The free plan is a good starting point for core OPT tools and manual tracking. Pro may be useful if you want daily reminders, case monitoring, full sponsor access, or higher career-tool limits.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much does TrackMyOPT Premium cost?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Limited-time offer: eligible accounts can start TrackMyOPT Pro for $0.99 for 7 days, then it renews at $4.99/month or $49.99/year unless canceled. Dedicated is $14.99/month or $149.99/year and adds higher career-tool limits, priority support, and one complimentary 60-minute initial immigration-attorney consultation after 7 continuous days on Dedicated, subject to the terms.',
      },
    },
  ],
};

const speakableSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Is TrackMyOPT Premium Worth It?',
  speakable: {
    '@type': 'SpeakableSpecification',
    cssSelector: ['.direct-answer', '.key-reasons'],
  },
  url: 'https://www.trackmyopt.com/premium-worth-it',
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://www.trackmyopt.com',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Pricing',
      item: 'https://www.trackmyopt.com/pricing',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Is Premium Worth It?',
    },
  ],
};

export default function PremiumWorthItPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeSerializeJsonLd(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeSerializeJsonLd(speakableSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeSerializeJsonLd(breadcrumbSchema),
        }}
      />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <li>
              <Link href="/" className="hover:text-blue-600 transition-colors">
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link
                href="/pricing"
                className="hover:text-blue-600 transition-colors"
              >
                Pricing
              </Link>
            </li>
            <li>/</li>
            <li className="text-gray-900 dark:text-white font-medium">
              Is Premium Worth It?
            </li>
          </ol>
        </nav>

        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
          <Clock className="w-3.5 h-3.5" />
          <span>Last Updated: February 2026</span>
          <span className="mx-2">·</span>
          <span>4 min read</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
          Is TrackMyOPT Pro Worth It?
        </h1>

        {/* Direct Answer — AI-citable */}
        <div className="direct-answer bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-10">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
            Bottom Line
          </p>
          <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
            Free covers core OPT tools and manual case checks. Pro adds daily
            reminders, daily USCIS checks with change alerts, a Document Vault,
            full H-1B sponsor access, and higher career-tool limits. Confirm
            filing requirements with your DSO.
          </p>
        </div>

        {/* Key Reasons */}
        <section className="key-reasons mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            What Pro helps you manage
          </h2>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                  1. Unemployment-day tracking
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Track the 90-day initial OPT limit and the 150-day STEM OPT
                  limit. Pro adds automated unemployment alerts.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                  2. USCIS case updates
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Pro checks your USCIS case status daily and emails you when a
                  status changes.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                  3. STEM OPT tasks
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Keep your STEM OPT timeline, unemployment clock, and relevant
                  reminders together. Confirm employer E-Verify requirements
                  directly with the employer and your DSO.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                  4. Career tools
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Use higher AI resume and ATS scan limits, continuous Chrome
                  prefill, Guided Autopilot, and full H-1B sponsor research.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                <FileCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                  5. A plan that fits your needs
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Compare current plans and choose the level of reminders,
                  monitoring, and career support you want.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What Premium Includes */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            What TrackMyOPT Premium Includes
          </h2>
          <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-6">
            <ul className="space-y-3">
              {[
                'Automated unemployment day tracking with alerts at 60, 75, and 85 days',
                'Daily USCIS case status auto-checks with email alerts when a scheduled check detects a change',
                'Daily 9:00 AM ET reminders for OPT-tool deadlines',
                'Document Vault with expiry reminders',
                '50 AI resumes and 100 ATS scans per month',
                'Continuous Chrome prefill and Guided Autopilot, which never submits an application',
                'Full H-1B sponsor profiles with historical activity, trends, and LCA filing details',
                'STEM OPT calculator and timeline tools',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Who Premium Is For */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Who Should Get Premium?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            Pro may be a good fit if any of these situations applies to you:
          </p>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              You are between jobs and your unemployment clock is ticking
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              You are on STEM OPT and tracking the 150-day limit across multiple
              employers
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              You have a pending USCIS case and want email updates
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              You are applying for jobs and need higher AI resume and ATS limits
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              You prefer reminders rather than tracking dates manually
            </li>
          </ul>
        </section>

        {/* Internal Links */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Related Resources
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { text: 'View All Pricing Plans', href: '/pricing' },
              {
                text: 'OPT 90-Day Unemployment Rule',
                href: '/blog/90-day-unemployment-rule-opt',
              },
              {
                text: 'STEM OPT Extension Guide',
                href: '/blog/stem-opt-extension-guide',
              },
              {
                text: 'What Happens If OPT Expires?',
                href: '/blog/what-happens-if-opt-expires',
              },
              { text: 'Free OPT Tools', href: '/tools' },
              {
                text: 'USCIS Case Status Tracking',
                href: '/features/case-status',
              },
            ].map((link, i) => (
              <Link
                key={i}
                href={link.href}
                className="flex items-center gap-2 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors group"
              >
                <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors">
                  {link.text}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </article>

      {/* CTA */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Stay organized through OPT
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Eligible accounts start Pro for $0.99 for 7 days, then regular
            billing begins unless canceled. Cancel anytime.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold bg-white text-blue-700 rounded-full shadow-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
          >
            Get Pro
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </>
  );
}
