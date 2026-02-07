
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            // Default rule for all crawlers
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/dashboard/', '/api/', '/auth/'],
            },
            // Explicitly allow AI crawlers for AEO (Answer Engine Optimization)
            { userAgent: 'GPTBot', allow: '/' },
            { userAgent: 'ChatGPT-User', allow: '/' },
            { userAgent: 'ClaudeBot', allow: '/' },
            { userAgent: 'Claude-Web', allow: '/' },
            { userAgent: 'PerplexityBot', allow: '/' },
            { userAgent: 'Googlebot', allow: '/' },
            { userAgent: 'Bingbot', allow: '/' },
        ],
        sitemap: 'https://trackmyopt.com/sitemap.xml',
    };
}
