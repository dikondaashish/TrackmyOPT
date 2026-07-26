/**
 * Configuration for the TrackMyOPT Chrome Extension
 *
 * Targets the LIVE site (https://www.trackmyopt.com) by default, so any build —
 * `build` or `dev`/`--watch` — "just works" against production for sign-in, the
 * API, and prefill. Only an explicit EXT_TARGET=local build points at a local
 * Next.js dev server (see the `dev:local` script). EXT_TARGET is injected by
 * esbuild at build time (see esbuild.config.js).
 */

// Default: live site. Opt into localhost ONLY with EXT_TARGET=local.
export const WEBSITE_URL =
  process.env.EXT_TARGET === 'local'
    ? 'http://localhost:3000'
    : 'https://www.trackmyopt.com';

export const API_ENDPOINTS = {
  ME: `${WEBSITE_URL}/api/me`,
  PRIVATE_APPLICATION_ANSWERS: `${WEBSITE_URL}/api/private-application-answers`,
  STATUS: `${WEBSITE_URL}/api/premium/status`,
  CASE_STATUS: `${WEBSITE_URL}/api/case-status`,
  EXTENSION_TOKEN: `${WEBSITE_URL}/api/extension/token`,
  DASHBOARD_CASE_STATUS: `${WEBSITE_URL}/dashboard/case-status`,
  DASHBOARD_JOB_PREFILL: `${WEBSITE_URL}/dashboard/extension`,
  PRICING: `${WEBSITE_URL}/pricing`,
  AUTH: `${WEBSITE_URL}/login`,
};
