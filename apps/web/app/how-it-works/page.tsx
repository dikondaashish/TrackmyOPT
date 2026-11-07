'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  UserPlus,
  Calendar,
  Link2,
  Bell,
  BarChart3,
} from 'lucide-react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { LandingFooter } from '@/components/landing/LandingFooter';

const steps = [
  {
    number: 1,
    title: 'Create an account',
    description: 'Sign up with Google or email. No credit card required.',
    icon: UserPlus,
    color: 'slate',
  },
  {
    number: 2,
    title: 'Add your key dates',
    description:
      'Add your program end date, OPT or STEM OPT start date, and EAD expiration.',
    icon: Calendar,
    color: 'blue',
  },
  {
    number: 3,
    title: 'Add your USCIS receipt',
    description:
      'Add your I-765 receipt number to check case status. Pro adds daily auto-checks and email alerts when a scheduled check detects a change.',
    icon: Link2,
    color: 'amber',
  },
  {
    number: 4,
    title: 'Choose your reminders',
    description: 'Free includes in-app notifications. Pro and Dedicated include daily email reminders for OPT tools.',
    icon: Bell,
    color: 'blue',
  },
  {
    number: 5,
    title: 'Stay organized',
    description:
      'Track unemployment days, view your timeline, and manage job applications in one place.',
    icon: BarChart3,
    color: 'violet',
  },
];

// Icon tiles are coded by meaning: blue = dates and reminders, amber =
// documents and receipts, violet = job search, slate = neutral setup.
const tileColorMap: Record<string, string> = {
  slate: 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300',
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300',
};

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-background">
      <LandingNavbar />

      {/* Hero */}
      <section className="border-b border-border bg-surface px-4 pt-16 pb-16 sm:pt-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Get started in 5 minutes
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Set up your dates, reminders, and case tracking in a few simple
              steps.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <ol>
            {steps.map((step, index) => (
              <motion.li
                key={step.number}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="relative flex gap-4 sm:gap-6 pb-8 last:pb-0"
              >
                {/* Connector line between step circles */}
                {index < steps.length - 1 && (
                  <div
                    className="absolute left-5 sm:left-6 top-12 sm:top-14 bottom-0 w-0.5 -translate-x-1/2 bg-primary-muted"
                    aria-hidden="true"
                  />
                )}

                {/* Step Number */}
                <div className="relative z-10 shrink-0 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-base sm:text-lg font-semibold shadow-button">
                  {step.number}
                </div>

                {/* Content */}
                <div className="surface-card flex-1 p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tileColorMap[step.color]}`}
                    >
                      <step.icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink px-4 py-20 text-ink-foreground">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Simplify Your OPT Journey?
          </h2>
          <p className="text-lg text-ink-muted mb-8 max-w-xl mx-auto">
            Start with the dates and reminders you need.
          </p>
          <Link
            href="/login"
            className="inline-flex min-h-12 items-center gap-2 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-button hover:bg-blue-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          >
            Start Tracking Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      <LandingFooter />
    </main>
  );
}
