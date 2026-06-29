import { MetadataRoute } from 'next';
import { getAllAnswers } from '@/lib/answers';
import { ANSWER_CANONICAL_OVERRIDES } from '@/lib/answers/canonical-overrides';
import { getPublicBlogRoutes } from '@/lib/blog-routes';

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

    // Q&A answer pages — dynamically generated from data (exclude canonical overrides)
    const answerPages = getAllAnswers()
        .filter((a) => !(a.slug in ANSWER_CANONICAL_OVERRIDES))
        .map((a) => `/answers/${a.slug}`);

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

    // Blog content — auto-discovered from app/blog (excludes 301 redirect sources)
    const blogPages = ['/blog', ...getPublicBlogRoutes()];

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

