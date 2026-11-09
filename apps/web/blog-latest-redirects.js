/**
 * Stable "latest" URLs for monthly blog series.
 *
 * Each source always points at the newest post in its series, so internal
 * links, emails and social posts never go stale. They are temporary (307)
 * redirects because the destination changes every month; the dated posts keep
 * their own canonical URLs and rankings.
 *
 * Update the destination when the next post in a series is published. The
 * test in data/blog-latest-redirects.test.ts checks every destination is a
 * live blog route.
 *
 * Plain CommonJS so next.config.js can require it.
 */
const BLOG_LATEST_REDIRECTS = [
  {
    // Monthly Visa Bulletin outlook (English).
    source: '/blog/visa-bulletin-predictions',
    destination: '/blog/december-2026-visa-bulletin-predictions',
  },
  {
    // Monthly Visa Bulletin outlook (Spanish).
    source: '/blog/boletin-de-visas-predicciones',
    destination: '/blog/boletin-de-visas-diciembre-2026-predicciones',
  },
  {
    // Monthly community OPT and STEM OPT timeline snapshot.
    source: '/blog/opt-timelines-latest',
    destination: '/blog/opt-stem-opt-timelines-reported-november-2026',
  },
];

module.exports = { BLOG_LATEST_REDIRECTS };
