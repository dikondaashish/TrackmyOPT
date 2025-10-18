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
  AUTH: `${WEBSITE_URL}/auth/extension`,
};
