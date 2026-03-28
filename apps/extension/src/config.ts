/**
 * Configuration for the TrackMyOPT Chrome Extension
 * 
 * Update WEBSITE_URL before deploying to production!
 */

// Development: Use localhost
// Production: Use your deployed URL
export const WEBSITE_URL = process.env.NODE_ENV === 'production'
  ? 'https://www.trackmyopt.com'
  : 'https://www.trackmyopt.com';

export const API_ENDPOINTS = {
  ME: `${WEBSITE_URL}/api/me`,
  STATUS: `${WEBSITE_URL}/api/premium/status`,
  EXTENSION_TOKEN: `${WEBSITE_URL}/api/extension/token`,
  AUTH: process.env.NODE_ENV === 'production'
    ? 'https://www.trackmyopt.com/login'
    : 'https://www.trackmyopt.com/login',
};
