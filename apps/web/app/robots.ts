import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        host: "https://www.trackmyopt.com",
        sitemap: "https://www.trackmyopt.com/sitemap.xml",
        rules: [
            // ============================================
            // AI MODEL BOTS (AEO - Answer Engine Optimization)
            // ============================================

            // OpenAI
            { userAgent: "GPTBot", allow: ["/"] },
            { userAgent: "ChatGPT-User", allow: ["/"] },
            { userAgent: "OAI-SearchBot", allow: ["/"] },

            // Anthropic (Claude)
            { userAgent: "ClaudeBot", allow: ["/"] },
            { userAgent: "Claude-User", allow: ["/"] },
            { userAgent: "Claude-Web", allow: ["/"] },
            { userAgent: "Claude-SearchBot", allow: ["/"] },
            { userAgent: "anthropic-ai", allow: ["/"] },

            // Perplexity AI
            { userAgent: "PerplexityBot", allow: ["/"] },
            { userAgent: "Perplexity-User", allow: ["/"] },

            // xAI (Grok)
            { userAgent: "GrokBot", allow: ["/"] },
            { userAgent: "xAI-Grok", allow: ["/"] },
            { userAgent: "Grok-DeepSearch", allow: ["/"] },

            // Meta AI (Llama, Meta AI)
            { userAgent: "meta-externalagent", allow: ["/"] },
            { userAgent: "Meta-WebIndexer", allow: ["/"] },
            { userAgent: "FacebookBot", allow: ["/"] },
            { userAgent: "facebookexternalhit", allow: ["/"] },
            { userAgent: "meta-externalfetcher", allow: ["/"] },

            // Google AI (Gemini)
            { userAgent: "Google-Extended", allow: ["/"] },
            { userAgent: "GoogleOther", allow: ["/"] },
            { userAgent: "GoogleOther-Image", allow: ["/"] },
            { userAgent: "GoogleOther-Video", allow: ["/"] },

            // Microsoft (Copilot)
            { userAgent: "CopilotBot", allow: ["/"] },

            // Cohere AI
            { userAgent: "cohere-ai", allow: ["/"] },

            // Mistral AI
            { userAgent: "MistralBot", allow: ["/"] },

            // You.com
            { userAgent: "YouBot", allow: ["/"] },

            // Apple
            { userAgent: "Applebot", allow: ["/"] },
            { userAgent: "Applebot-Extended", allow: ["/"] },

            // ============================================
            // SEARCH ENGINE BOTS
            // ============================================

            // Google
            { userAgent: "Googlebot", allow: ["/"] },
            { userAgent: "Googlebot-Image", allow: ["/"] },
            { userAgent: "Googlebot-Video", allow: ["/"] },
            { userAgent: "Googlebot-News", allow: ["/"] },
            { userAgent: "Storebot-Google", allow: ["/"] },

            // Microsoft Bing
            { userAgent: "Bingbot", allow: ["/"] },
            { userAgent: "msnbot", allow: ["/"] },
            { userAgent: "AdIdxBot", allow: ["/"] },

            // DuckDuckGo
            { userAgent: "DuckDuckBot", allow: ["/"] },

            // Yahoo
            { userAgent: "Slurp", allow: ["/"] },

            // Yandex (Russia)
            { userAgent: "YandexBot", allow: ["/"] },
            { userAgent: "YandexImages", allow: ["/"] },

            // Baidu (China)
            { userAgent: "Baiduspider", allow: ["/"] },
            { userAgent: "Baiduspider-image", allow: ["/"] },
            { userAgent: "Baiduspider-video", allow: ["/"] },

            // Sogou (China)
            { userAgent: "Sogou", allow: ["/"] },

            // Naver (South Korea)
            { userAgent: "Yeti", allow: ["/"] },

            // Seznam (Czech Republic)
            { userAgent: "SeznamBot", allow: ["/"] },

            // ============================================
            // GENERAL RULE (Must be last)
            // ============================================
            {
                userAgent: "*",
                allow: [
                    "/",
                    // Public dashboard pages that should be indexed
                    "/dashboard/help",
                    "/dashboard/opt-tools/opt-apply",
                    "/dashboard/opt-tools/opt-clock",
                    "/dashboard/opt-tools/stem-apply",
                    "/dashboard/opt-tools/stem-clock",
                ],
                disallow: [
                    "/dashboard/",  // Block authenticated dashboard routes
                    "/api/",         // Block API routes
                    "/auth/",        // Block auth routes
                ],
            },
        ],
    };
}
