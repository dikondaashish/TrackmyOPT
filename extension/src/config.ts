// Configuration for the extension
// Update this with your actual website URL in production
export const WEBSITE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://your-production-site.vercel.app'
    : 'http://localhost:3000';

export const API_BASE_URL = WEBSITE_URL;

