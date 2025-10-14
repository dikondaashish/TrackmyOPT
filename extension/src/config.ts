/**
 * Configuration for the OPT Hub Chrome Extension
 * 
 * Update WEBSITE_URL before deploying to production!
 */

// Development: Use localhost
// Production: Use your deployed URL (e.g., https://trackmyopt.vercel.app)
export const WEBSITE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://trackmyopt.vercel.app'  // TODO: Update to your production domain
  : 'http://localhost:3000';

export const API_ENDPOINTS = {
  ME: `${WEBSITE_URL}/api/me`,
  AUTH: `${WEBSITE_URL}/auth/extension`,
};
