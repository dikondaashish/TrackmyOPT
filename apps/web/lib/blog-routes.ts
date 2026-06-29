import fs from "fs";
import path from "path";

/**
 * Blog slugs that 301 to another URL (next.config.js). Omit from sitemap so GSC
 * does not see "Page with redirect" for sitemap-submitted URLs.
 */
export const BLOG_REDIRECT_SLUGS = new Set([
    "how-to-track-uscis-case-status-guide",
    "f1-student-tax-filing-guide",
    "opt-health-insurance-guide",
    "ats-resume-international-students",
    "can-you-travel-on-opt",
    "form-i983-stem-opt-training-plan-guide",
]);

/** Discover live blog post routes from the app directory. */
export function getPublicBlogRoutes(): string[] {
    const blogDir = path.join(process.cwd(), "app/blog");
    return fs
        .readdirSync(blogDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && !BLOG_REDIRECT_SLUGS.has(entry.name))
        .map((entry) => `/blog/${entry.name}`)
        .sort();
}
