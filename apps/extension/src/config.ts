/**
 * Configuration for the TrackMyOPT Chrome Extension
 *
 * NODE_ENV is injected by esbuild at build time (see esbuild.config.js). The
 * `build` script forces NODE_ENV=production so release builds always target the
 * live site; `dev`/`--watch` builds default to development and hit localhost.
 */

const IS_PROD = process.env.NODE_ENV === 'production';

// Production: the live site. Development: local Next.js dev server.
export const WEBSITE_URL = IS_PROD
  ? 'https://www.trackmyopt.com'
  : 'http://localhost:3000';

export const API_ENDPOINTS = {
  ME: `${WEBSITE_URL}/api/me`,
  STATUS: `${WEBSITE_URL}/api/premium/status`,
  CASE_STATUS: `${WEBSITE_URL}/api/case-status`,
  EXTENSION_TOKEN: `${WEBSITE_URL}/api/extension/token`,
  DASHBOARD_CASE_STATUS: `${WEBSITE_URL}/dashboard/case-status`,
  AUTH: `${WEBSITE_URL}/login`,
};
