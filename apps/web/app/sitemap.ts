
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://www.trackmyopt.com';
    const now = new Date();

    // Core pages — highest priority, updated frequently
    const corePages = [
        { route: '', changeFrequency: 'daily' as const, priority: 1.0 },
        { route: '/about', changeFrequency: 'monthly' as const, priority: 0.8 },
        { route: '/contact', changeFrequency: 'monthly' as const, priority: 0.6 },
        { route: '/partnerships', changeFrequency: 'monthly' as const, priority: 0.7 },
        { route: '/success-stories', changeFrequency: 'weekly' as const, priority: 0.7 },
    ];

    // Feature pages — high priority, updated periodically
    const featurePages = [
        '/features/resume-ai',
        '/features/job-tracker',
        '/features/sponsors',
        '/features/extension',
        '/features/compliance',
        '/features/community',
    ];

    // Public tools — valuable for SEO, updated with features
    const toolPages = [
        '/faq',
        '/how-it-works',
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
    ];
}

