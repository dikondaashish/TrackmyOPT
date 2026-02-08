
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://www.trackmyopt.com';

    const routes = [
        '',
        '/faq',
        '/how-it-works',
        '/about',
        '/contact',
        '/login',
        '/success-stories',
        // Feature pages
        '/features/resume-ai',
        '/features/job-tracker',
        '/features/sponsors',
        '/features/extension',
        '/features/compliance',
        '/features/community',
        // Public dashboard pages (SEO-friendly tools)
        '/dashboard/help',
        '/dashboard/opt-tools/opt-apply',
        '/dashboard/opt-tools/opt-clock',
        '/dashboard/opt-tools/stem-apply',
        '/dashboard/opt-tools/stem-clock',
        // Legal pages
        '/privacy',
        '/terms',
        '/cookie-policy',
        '/refund-policy',
        '/disclaimer',
        '/resources/report-fraud',
    ];

    return routes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1 : 0.8,
    }));
}
