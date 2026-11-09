import fs from "fs";
import path from "path";
import { BLOG_HUB_SLUGS, blogHubPath } from "@/data/blog-hubs";
import { researchArticles } from "@/data/blog-series";

/**
 * Blog slugs that 301 to another URL (next.config.js). Omit from sitemap so GSC
 * does not see "Page with redirect" for sitemap-submitted URLs.
 */
const BLOG_REDIRECT_SLUGS = new Set([
  "federal-court-vacates-100k-h1b-fee-2026",
  "end-of-duration-of-status-f1-visa-rule",
  "f1-visa-duration-of-status-ds-ending-2026",
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
    const filesystemRoutes = fs
        .readdirSync(blogDir, { withFileTypes: true })
        .filter(
            (entry) =>
                entry.isDirectory() &&
                !entry.name.startsWith("[") &&
                // /blog/hub/<slug> pages are listed from BLOG_HUBS below.
                entry.name !== "hub" &&
                !BLOG_REDIRECT_SLUGS.has(entry.name),
        )
        .map((entry) => `/blog/${entry.name}`)
    const researchRoutes = researchArticles.map(({ slug }) => `/blog/${slug}`);
    const hubRoutes = BLOG_HUB_SLUGS.map(blogHubPath);
    return [...new Set([...filesystemRoutes, ...researchRoutes, ...hubRoutes])].sort();
}
