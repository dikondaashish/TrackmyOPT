import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        host: "https://trackmyopt.com",
        sitemap: "https://trackmyopt.com/sitemap.xml",
        rules: [
            // Specific AI bots first (explicit allowance for AEO)
            {
                userAgent: "GPTBot",
                allow: ["/"],
            },
            {
                userAgent: "ChatGPT-User",
                allow: ["/"],
            },
            {
                userAgent: "ClaudeBot",
                allow: ["/"],
            },
            {
                userAgent: "Claude-Web",
                allow: ["/"],
            },
            {
                userAgent: "PerplexityBot",
                allow: ["/"],
            },
            {
                userAgent: "Googlebot",
                allow: ["/"],
            },
            {
                userAgent: "Bingbot",
                allow: ["/"],
            },

            // General rule for all crawlers (last)
            {
                userAgent: "*",
                allow: ["/"],
                disallow: ["/dashboard/", "/api/", "/auth/"],
            },
        ],
    };
}
