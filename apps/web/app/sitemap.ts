
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://trackmyopt.com';

    const routes = [
        '',
        '/about',
        '/contact',
        '/login',
        '/success-stories',
        '/features/resume-ai',
        '/features/job-tracker',
        '/features/sponsors',
        '/features/extension',
        '/features/compliance',
        '/features/community',
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
