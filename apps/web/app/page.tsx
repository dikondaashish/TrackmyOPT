import { Suspense } from 'react';
import { LandingHero } from '../components/landing/LandingHero';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { LandingFeatures } from '../components/landing/LandingFeatures';
import { LandingPricing } from '../components/landing/LandingPricing';
import { LandingFAQ } from '../components/landing/LandingFAQ';
import { LandingFooter } from '../components/landing/LandingFooter';
import { LandingChromeExtension } from '../components/landing/LandingChromeExtension';
import { LandingTrustedUniversities } from '../components/landing/LandingTrustedUniversities';
import { ReferralCapture } from '../components/ReferralCapture';
import dynamic from 'next/dynamic';

// Lazy-load below-fold components to reduce initial JS bundle (SEO Fix #1 & #2: Mobile LCP/TBT)
const LandingComparison = dynamic(() =>
  import('../components/landing/LandingComparison').then(
    (mod) => mod.LandingComparison
  )
);
const LandingValueGrid = dynamic(() =>
  import('../components/landing/LandingValueGrid').then(
    (mod) => mod.LandingValueGrid
  )
);
const LandingSuccessStories = dynamic(() =>
  import('../components/landing/LandingSuccessStories').then(
    (mod) => mod.LandingSuccessStories
  )
);
const LandingTestimonials = dynamic(() =>
  import('../components/landing/LandingTestimonials').then(
    (mod) => mod.LandingTestimonials
  )
);
const LandingEngine = dynamic(() =>
  import('../components/landing/LandingEngine').then((mod) => mod.LandingEngine)
);
const LandingToolkit = dynamic(() =>
  import('../components/landing/LandingToolkit').then(
    (mod) => mod.LandingToolkit
  )
);
import { landingPageSchemas } from '@/lib/seo-schemas';
import { safeSerializeJsonLd } from '@/lib/safe-json-ld';

const LandingGlobalReach = dynamic(() =>
  import('../components/landing/LandingGlobalReach').then(
    (mod) => mod.LandingGlobalReach
  )
);
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OPT Tracker: USCIS Case Status, EAD Timeline & Deadlines | TrackMyOPT',
  description:
    'Free OPT tracker for F-1 students: check USCIS case status, see your EAD decision window, count unemployment days and track STEM OPT deadlines. 3,500+ users have signed up.',
};

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-950 dark:selection:text-blue-100">
      <div className="relative z-10">
        <Suspense fallback={null}>
          <ReferralCapture />
        </Suspense>
        <LandingNavbar />
        <LandingHero />
        <LandingTrustedUniversities />

        {/* Key Differentiator moved up */}
        <LandingChromeExtension />

        <LandingComparison />
        <LandingValueGrid />

        <LandingFeatures />
        <LandingGlobalReach />
        <LandingEngine />
        <LandingSuccessStories />
        <LandingToolkit />
        <LandingPricing />
        <LandingTestimonials />
        <LandingFAQ />
        <LandingFooter />
      </div>

      {/* Comprehensive JSON-LD Schemas for SEO and AEO */}
      {landingPageSchemas.map((schema, index) => {
        const serialized = safeSerializeJsonLd(schema);
        if (!serialized) return null;
        return (
          <script
            key={`schema-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serialized }}
          />
        );
      })}
    </main>
  );
}
