import type { MetadataRoute } from "next";

/**
 * Paths crawlers should not spend time fetching.
 *
 * Do not block `/login`: its page-level `noindex` must remain crawlable so
 * search engines can remove previously discovered login URLs from results.
 */
const CRAWL_DISALLOW = [
    "/api/",
    "/admin/",
    "/auth/extension",
    "/auth/reset-password",
    "/dashboard/",
] as const;

/** Public dashboard tool pages that remain crawlable (see proxy.ts). */
const PUBLIC_DASHBOARD_ALLOW = [
    "/dashboard/help",
    "/dashboard/opt-tools/opt-apply",
    "/dashboard/opt-tools/opt-clock",
    "/dashboard/opt-tools/stem-apply",
    "/dashboard/opt-tools/stem-clock",
] as const;

function botRule(userAgent: string) {
    return {
        userAgent,
        allow: ["/", ...PUBLIC_DASHBOARD_ALLOW],
        disallow: [...CRAWL_DISALLOW],
    };
}

export default function robots(): MetadataRoute.Robots {
    const aiAndSearchBots = [
        // OpenAI
        "GPTBot",
        "ChatGPT-User",
        "OAI-SearchBot",
        // Anthropic (Claude)
        "ClaudeBot",
        "Claude-User",
        "Claude-Web",
        "Claude-SearchBot",
        "anthropic-ai",
        // Perplexity AI
        "PerplexityBot",
        "Perplexity-User",
        // xAI (Grok)
        "GrokBot",
        "xAI-Grok",
        "Grok-DeepSearch",
        // Meta AI
        "meta-externalagent",
        "Meta-WebIndexer",
        "FacebookBot",
        "facebookexternalhit",
        "meta-externalfetcher",
        // Google AI (Gemini)
        "Google-Extended",
        "GoogleOther",
        "GoogleOther-Image",
        "GoogleOther-Video",
        // Microsoft (Copilot)
        "CopilotBot",
        // Cohere / Mistral / You.com / Apple
        "cohere-ai",
        "MistralBot",
        "YouBot",
        "Applebot",
        "Applebot-Extended",
        // Search engines
        "Googlebot",
        "Googlebot-Image",
        "Googlebot-Video",
        "Googlebot-News",
        "Storebot-Google",
        "Bingbot",
        "msnbot",
        "AdIdxBot",
        "DuckDuckBot",
        "Slurp",
        "YandexBot",
        "YandexImages",
        "Baiduspider",
        "Baiduspider-image",
        "Baiduspider-video",
        "Sogou",
        "Yeti",
        "SeznamBot",
    ];

    return {
        host: "https://www.trackmyopt.com",
        sitemap: [
            "https://www.trackmyopt.com/sitemap.xml",
            "https://www.trackmyopt.com/news-sitemap.xml",
        ],
        rules: [
            ...aiAndSearchBots.map(botRule),
            {
                userAgent: "*",
                allow: ["/", ...PUBLIC_DASHBOARD_ALLOW],
                disallow: [...CRAWL_DISALLOW],
            },
        ],
    };
}
