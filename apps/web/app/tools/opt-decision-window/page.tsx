import { Metadata } from 'next';
import { safeSerializeJsonLd } from '@/lib/safe-json-ld';
import { PublicOptToolPageIntro } from '@/components/seo/PublicOptToolPageIntro';
import { OptDecisionWindowTool } from '@/components/tools/OptDecisionWindowTool';

export const metadata: Metadata = {
  title: 'OPT Decision Window Calculator | When Will USCIS Decide?',
  description:
    'Stop refreshing USCIS. Enter your OPT receipt date and see your decision window from similar community cases — free, no account required.',
  keywords: [
    'OPT decision date',
    'OPT processing time calculator',
    'when will USCIS decide OPT',
    'I-765 decision window',
    'OPT EAD wait time',
    'STEM OPT processing estimate',
    'USCIS case prediction OPT',
  ],
  openGraph: {
    title: 'OPT Decision Window | Stop Refreshing USCIS',
    description:
      'See where your OPT case stands against similar filings. Free decision window — then track live status.',
    url: 'https://www.trackmyopt.com/tools/opt-decision-window',
    siteName: 'TrackMyOPT',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OPT Decision Window Calculator',
    description:
      'Free tool: enter your receipt date and see your OPT decision window from similar cases.',
  },
  alternates: {
    canonical: 'https://www.trackmyopt.com/tools/opt-decision-window',
  },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'OPT Decision Window Calculator',
    applicationCategory: 'CalculatorApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'Free calculator that estimates an OPT/I-765 decision window from anonymized community processing timelines. Not affiliated with USCIS.',
    featureList: [
      'Decision window from similar OPT cases',
      'Day-of-wait position marker',
      'Optional receipt-prefix matching',
      'No account required for first look',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is this my exact USCIS decision date?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. The tool shows a community-based decision window (typical wait and middle 50% range). It is a planning estimate, not a USCIS guarantee or legal advice.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need an account?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No account is required to see your first decision window. Create a free account to track live USCIS status with your receipt number and optionally upgrade for daily auto-checks and alerts.',
        },
      },
    ],
  },
];

export default function OptDecisionWindowPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <PublicOptToolPageIntro
        title="Stop refreshing. See your OPT decision window."
        description="Enter the date USCIS received your I-765. We’ll show where you stand against similar community cases — then you can track live status free."
      >
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
          Use the received date on your I-797C notice. Optional: first 3 letters
          of the receipt (IOE, EAC…) to tighten the match. Never paste your full
          receipt number into this public tool.
        </p>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
          Ranges come from anonymized community timelines. Processing varies by
          service center and season. Confirm important dates with USCIS and your
          DSO.
        </p>
      </PublicOptToolPageIntro>

      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <OptDecisionWindowTool />
      </div>

      {jsonLd.map((schema, index) => {
        const serialized = safeSerializeJsonLd(schema);
        if (!serialized) return null;
        return (
          <script
            key={`opt-dw-schema-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serialized }}
          />
        );
      })}
    </main>
  );
}
