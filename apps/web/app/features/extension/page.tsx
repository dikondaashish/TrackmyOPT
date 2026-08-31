'use client';

import { motion } from 'framer-motion';
import { CanonicalURL } from '@/components/CanonicalURL';
import {
  Chrome,
  CheckCircle2,
  Zap,
  Shield,
  Linkedin,
  Globe,
  Lock,
  Clock,
} from 'lucide-react';
import { FeatureHero } from '@/components/features/FeatureHero';
import { FeatureFAQ } from '@/components/features/FeatureFAQ';
import { FeatureServiceSchema } from '@/components/features/FeatureServiceSchema';
import { FeatureWhyMatters } from '@/components/features/FeatureWhyMatters';
import { FeatureCTA } from '@/components/features/FeatureCTA';

import { ExtensionOverlayVisual } from '@/components/features/ExtensionOverlayVisual';
import { ExtensionDemo } from '@/components/features/ExtensionDemo';
import { H2, Lead, P } from '@/components/ui/typography';
import { ExtensionLegalLinks } from '@/components/legal/ExtensionLegalLinks';
import {
  EXTENSION_FEATURE_DISCLAIMER,
  EXTENSION_PRIVACY_SHORT,
} from '@/lib/legal/legal-config';

// Platform Grid
function PlatformGrid() {
  const platforms = [
    { name: 'LinkedIn', icon: Linkedin, status: 'live' },
    { name: 'Indeed', icon: Globe, status: 'live' },
    { name: 'Glassdoor', icon: Globe, status: 'live' },
    { name: 'Career sites', icon: Globe, status: 'live' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {platforms.map((platform, i) => (
        <motion.div
          key={platform.name}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="relative bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6 text-center hover:shadow-lg transition-shadow group"
        >
          <div
          className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/20"
          >
            <platform.icon
              className="w-6 h-6 text-white"
            />
          </div>
          <p className="font-medium text-gray-900 dark:text-white">
            {platform.name}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

// Privacy Checklist
function PrivacyChecklist() {
  const items = [
    'Designed to minimize data collection',
    'Reads supported job and application pages to identify the role and fill details you choose',
    'Optional sign-in to sync with TrackMyOPT',
    'See our Privacy Policy for details',
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-8 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Lock className="w-6 h-6 text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white">
            Privacy First
          </h4>
          <p className="text-sm text-gray-500">Your data stays yours</p>
        </div>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="text-gray-700 dark:text-gray-300">{item}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function ExtensionPage() {
  return (
    <>
      <CanonicalURL url="https://www.trackmyopt.com/features/extension" />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-rose-50/50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        <FeatureServiceSchema
          name="H-1B Sponsor Intel Chrome Extension"
          description="Save job listings, review the posting's explicit visa-sponsorship language, and prefill application details on supported career pages. TrackMyOPT never submits an application for you."
          featurePath="/features/extension"
          faqItems={[
            {
              question: 'Which job sites does the extension work on?',
              answer:
                'It works on LinkedIn, Indeed, Glassdoor, many applicant-tracking systems, and supported company career pages. Coverage depends on the page structure, so the extension only appears when it detects a job or application page.',
            },
            {
              question: 'What data does the extension access?',
              answer:
                'The extension reads the job listing and application form to save the role, show a sponsorship signal from the posting text, and fill details only when you ask it to. Sign-in can sync selected TrackMyOPT data; see our Privacy Policy for the full data-use details.',
            },
            {
              question: 'Which extension features are included with each plan?',
              answer:
                'The extension and step-by-step prefill are included on Free. Pro and Dedicated add continuous prefill and Guided Autopilot. AI writing and resume features have plan limits.',
            },
            {
              question: 'What does the sponsorship signal mean?',
              answer:
                'It classifies explicit wording in the job posting as mentioning sponsorship, ruling it out, or not stating it. It is not a confirmation that an employer will sponsor a visa; verify the policy with the employer.',
            },
            {
              question: 'Does it slow down my browser?',
              answer:
                'The extension runs only on supported career pages and can be disabled for a site at any time. Like any browser extension, its effect can vary with the page and your device.',
            },
            {
              question: 'Can I trust this extension with my data?',
              answer:
                'The extension is designed to minimize data collection. We do not read your LinkedIn or Indeed messages or passwords. See our Privacy Policy, Terms, Disclaimer, and Cookie Policy for what we collect when you use TrackMyOPT services.',
            },
          ]}
        />
        {/* Hero */}
        <FeatureHero
          badge="Free"
          headline="Job applications, with a review step."
          subheadline="Save a role, review explicit sponsorship language, and prefill application details on supported job and career pages."
          ctaText="Add to Chrome - Free"
          ctaHref="https://chromewebstore.google.com/detail/hfljbefkccdmlnhclfojlafipjnjbajm?utm_source=item-share-cb"
          secondaryCta={{
            text: 'See Demo',
            href: '#demo',
          }}
          visual={<ExtensionDemo />}
        />

        {/* Features */}
        <section id="demo" className="py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
                  <Zap className="w-4 h-4" />
                  Job-page assist
                </div>
                <H2>Keep each application moving</H2>
                <P>
                  The extension captures the job context, helps you prepare materials, and leaves the final review and submission to you.
                </P>
                <ul className="space-y-4 mb-8">
                  {[
                    'Save a listing to your TrackMyOPT job tracker',
                    'Read explicit visa-sponsorship wording in the posting',
                    'Prefill resume, contact, work-history, and skills fields',
                    'Use Guided Autopilot on Pro; it never submits an application',
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-gray-700 dark:text-gray-300"
                    >
                      <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>

                <p className="text-sm text-muted-foreground">
                  Free includes step-by-step prefill. Pro and Dedicated add continuous prefill and Guided Autopilot.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                {/* Decorative elements behind visual */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-20 blur-2xl rounded-full" />
                <ExtensionOverlayVisual />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Platforms */}
        <section className="py-24 bg-gray-50 dark:bg-zinc-900/50 relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
                <Globe className="w-4 h-4" />
                Supported career pages
              </div>
              <H2>Supported Platforms</H2>
              <Lead>LinkedIn, Indeed, Glassdoor, many ATS portals, and supported company career pages.</Lead>
            </motion.div>

            <PlatformGrid />
          </div>
        </section>

        {/* Privacy */}
        <section className="py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <PrivacyChecklist />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-4">
                  <Shield className="w-4 h-4" />
                  Privacy First
                </div>
                <H2>Privacy & data use</H2>
                <P>{EXTENSION_PRIVACY_SHORT}</P>
                <P className="text-sm text-muted-foreground">
                  {EXTENSION_FEATURE_DISCLAIMER}
                </P>
                <ExtensionLegalLinks className="mt-2" />
                <ul className="space-y-4 mt-6">
                  {[
                    'Runs only on supported job and application pages',
                    'Reads listing text locally to identify the job and sponsorship wording',
                    'No sale of personal information',
                    'Security practices described on our Security page',
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
            </div>
          </div>
        </section>

        {/* Why This Matters Section */}
        <FeatureWhyMatters
          headline="A safer application workflow"
          description="Use the extension to prepare an application while keeping control of every submitted answer."
          accentColor="cyan"
          stats={[
            {
              value: 'Review',
              label: 'You check each answer before submitting',
              icon: <Clock className="w-5 h-5" />,
            },
            {
              value: 'Free',
              label: 'Step-by-step prefill is included',
              icon: <Shield className="w-5 h-5" />,
            },
            {
              value: 'Pro',
              label: 'Adds continuous prefill and Guided Autopilot',
              icon: <Zap className="w-5 h-5" />,
            },
            {
              value: 'Never',
              label: 'The extension never submits an application',
              icon: <Lock className="w-5 h-5" />,
            },
          ]}
        />

        {/* FAQ Section */}
        <FeatureFAQ
          title="Chrome Extension FAQ"
          subtitle="Common questions about the TrackMyOPT extension"
          accentColor="cyan"
          items={[
            {
              question: 'Which job sites does the extension work on?',
              answer:
                'It works on LinkedIn, Indeed, Glassdoor, many applicant-tracking systems, and supported company career pages. The extension appears only when it detects a job or application page.',
            },
            {
              question: 'What data does the extension access?',
              answer:
                'The extension reads the job listing and application form to save the role, show a sponsorship signal from posting text, and fill details only when you ask it to. See our Privacy Policy for the full data-use details.',
            },
            {
              question: 'Which extension features are included with each plan?',
              answer: 'The extension and step-by-step prefill are included on Free. Pro and Dedicated add continuous prefill and Guided Autopilot. AI writing and resume features have plan limits.',
            },
            {
              question: 'What does the sponsorship signal mean?',
              answer:
                'It classifies explicit wording in the job posting as mentioning sponsorship, ruling it out, or not stating it. It is not a confirmation that an employer will sponsor a visa; verify the policy with the employer.',
            },
            {
              question: 'Does it slow down my browser?',
              answer:
                'The extension runs only on supported career pages and can be disabled for a site at any time. Its effect can vary with the page and your device.',
            },
            {
              question: 'Can I trust this extension with my data?',
              answer:
                'The extension is designed to minimize data collection and does not access your messages or login credentials on job sites. See our Privacy Policy, Terms, Disclaimer, and Cookie Policy for details.',
            },
          ]}
        />

        {/* Final CTA */}
        <FeatureCTA
          headline="Keep control of every application"
          subheadline="Save jobs, prepare answers, and review every field before you submit."
          primaryCTA={{
            text: 'Add to Chrome—Start Free',
            href: 'https://chromewebstore.google.com/detail/hfljbefkccdmlnhclfojlafipjnjbajm?utm_source=item-share-cb',
          }}
          secondaryCTA={{
            text: 'See Demo',
            href: '/features/extension#demo',
          }}
          gradient="cyan"
          icon={<Chrome className="w-12 h-12 text-white" />}
          badge="Free to install"
        />
      </main>
    </>
  );
}
