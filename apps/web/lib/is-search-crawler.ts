/**
 * Detect search-engine and AI indexing crawlers.
 * Used to block /api/* — private endpoints have no SEO value.
 */
const SEARCH_CRAWLER_UA =
    /googlebot|google-inspectiontool|storebot-google|googleother|bingbot|msnbot|adidxbot|slurp|duckduckbot|baiduspider|yandexbot|yeti|sogou|seznambot|applebot|facebookexternalhit|twitterbot|linkedinbot|embedly|pinterest|slackbot|whatsapp|semrushbot|ahrefsbot|mj12bot|dotbot|petalbot|gptbot|chatgpt-user|oai-searchbot|claudebot|claude-web|claude-user|anthropic-ai|perplexitybot|perplexity-user|grokbot|copilotbot|cohere-ai|mistralbot|youbot/i;

export function isSearchCrawler(userAgent: string | null | undefined): boolean {
    if (!userAgent) return false;
    return SEARCH_CRAWLER_UA.test(userAgent);
}

export const CRAWLER_NOINDEX_HEADERS = {
    "X-Robots-Tag": "noindex, nofollow",
} as const;
