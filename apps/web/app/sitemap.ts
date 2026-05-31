import { MetadataRoute } from 'next';
import { getAllAnswers } from '@/lib/answers';

export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://www.trackmyopt.com';
    const now = new Date();

    // Core pages — highest priority, updated frequently
    const corePages = [
        { route: '', changeFrequency: 'daily' as const, priority: 1.0 },
        { route: '/pricing', changeFrequency: 'weekly' as const, priority: 0.9 },
        { route: '/glossary', changeFrequency: 'weekly' as const, priority: 0.8 },
        { route: '/tools', changeFrequency: 'weekly' as const, priority: 0.8 },
        { route: '/answers', changeFrequency: 'weekly' as const, priority: 0.8 },
        { route: '/ai-facts', changeFrequency: 'monthly' as const, priority: 0.7 },
        { route: '/compare', changeFrequency: 'monthly' as const, priority: 0.7 },
        { route: '/premium-worth-it', changeFrequency: 'monthly' as const, priority: 0.9 },
        { route: '/guides/f1-tax-filing', changeFrequency: 'weekly' as const, priority: 0.9 },
        { route: '/guides/opt-career', changeFrequency: 'weekly' as const, priority: 0.9 },
        { route: '/guides/opt-health-insurance', changeFrequency: 'weekly' as const, priority: 0.9 },
        { route: '/features', changeFrequency: 'monthly' as const, priority: 0.8 },
        { route: '/how-it-works', changeFrequency: 'monthly' as const, priority: 0.7 },
        { route: '/faq', changeFrequency: 'monthly' as const, priority: 0.7 },
        { route: '/about', changeFrequency: 'monthly' as const, priority: 0.8 },
        { route: '/contact', changeFrequency: 'monthly' as const, priority: 0.6 },
        { route: '/partnerships', changeFrequency: 'monthly' as const, priority: 0.7 },
        { route: '/success-stories', changeFrequency: 'weekly' as const, priority: 0.7 },
    ];

    // Q&A answer pages — dynamically generated from data
    const answerPages = getAllAnswers().map((a) => `/answers/${a.slug}`);

    // Feature pages — high priority, updated periodically
    const featurePages = [
        '/features/resume-ai',
        '/features/job-tracker',
        '/features/sponsors',
        '/features/extension',
        '/features/compliance',
        '/features/community',
        '/features/case-status',
        '/features/tax-filing',
        '/features/health-insurance',
    ];

    // Public dashboard tool pages — accessible without login (middleware.ts publicRoutes).
    // Each page exports robots:{index:true} to override the dashboard layout's noindex.
    const toolPages = [
        '/dashboard/help',
        '/dashboard/opt-tools/opt-apply',
        '/dashboard/opt-tools/opt-clock',
        '/dashboard/opt-tools/stem-apply',
        '/dashboard/opt-tools/stem-clock',
    ];

    // Legal pages — low priority, rarely change
    const legalPages = [
        '/privacy',
        '/terms',
        '/cookie-policy',
        '/refund-policy',
        '/disclaimer',
        '/security',
        '/resources/report-fraud',
    ];

    // Blog content — high SEO value, updated regularly
    const blogPages = [
        '/blog',
        '/blog/90-day-unemployment-rule-opt',
        '/blog/opt-processing-time-2026',
        '/blog/stem-opt-unemployment-limit',
        '/blog/opt-application-checklist-2026',
        '/blog/opt-to-h1b-transition',
        '/blog/i-983-training-plan-guide',
        '/blog/what-happens-if-opt-expires',
        '/blog/h1b-approval-rates-by-company',
        '/blog/stem-opt-extension-guide',
        '/blog/opt-extension-guide',
        '/blog/f1-visa-jobs-guide',
        '/blog/opt-ead-card-guide',
        '/blog/h1b-cap-gap-extension',
        '/blog/day-1-cpt-vs-opt',
        // Old versions canonicalized to 2026 equivalents (not in sitemap)
        '/blog/uscis-case-status-tracking-guide',
        // Old versions canonicalized to 2026 equivalents (not in sitemap)
        '/blog/top-h1b-sponsor-companies-2026',
        '/blog/stem-opt-employer-requirements',
        '/blog/opt-application-denied',
        '/blog/opt-stem-opt-job-offer-verification-checklist',
        '/blog/f1-student-tax-filing-guide-2026',
        '/blog/opt-health-insurance-guide-2026',
        '/blog/ats-resume-international-students-2026',
        '/blog/can-you-travel-on-opt-complete-guide',
        '/blog/how-to-track-uscis-case-status-guide',
        '/blog/leverage-job-search-trackmyopt-resume-generator',
        '/blog/f1-opt-stem-opt-tax-filing-mistakes',
        // /blog/can-you-travel-on-opt is a real page (no redirect), safe to include
        '/blog/can-you-travel-on-opt',
        // NOTE: f1-student-tax-filing-guide, opt-health-insurance-guide,
        // ats-resume-international-students are permanent 301 redirects in
        // next.config.js → their 2026 versions are already in the sitemap above.
        // Including redirect sources causes "Page with redirect" in Search Console.

        // ── New posts added May 2026 ──
        '/blog/indian-bank-account-nro-opt-students',
        '/blog/hsi-opt-fraud-crackdown-legitimate-students-guide',
        '/blog/is-opt-ending-dhs-rule-2026',
        '/blog/spring-graduates-opt-application-timing-2026',
        '/blog/opt-ead-pending-processing-delays-2026',
    ];

    return [
        ...corePages.map(({ route, changeFrequency, priority }) => ({
            url: `${baseUrl}${route}`,
            lastModified: now,
            changeFrequency,
            priority,
        })),
        ...featurePages.map((route) => ({
            url: `${baseUrl}${route}`,
            lastModified: now,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        })),
        ...toolPages.map((route) => ({
            url: `${baseUrl}${route}`,
            lastModified: now,
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        })),
        ...legalPages.map((route) => ({
            url: `${baseUrl}${route}`,
            lastModified: new Date('2026-01-15'),
            changeFrequency: 'yearly' as const,
            priority: 0.3,
        })),
        ...blogPages.map((route) => ({
            url: `${baseUrl}${route}`,
            lastModified: now,
            changeFrequency: 'weekly' as const,
            priority: 0.9,
        })),
        ...answerPages.map((route) => ({
            url: `${baseUrl}${route}`,
            lastModified: now,
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        })),
    ];
}

