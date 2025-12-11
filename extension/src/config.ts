/**
 * Configuration for the TrackMyOPT Chrome Extension
 * 
 * Subdomain Architecture:
 * - login.trackmyopt.com - Authentication
 * - dashboard.trackmyopt.com - Main app and API
 * - trackmyopt.com - Marketing
 */

// Dashboard subdomain for API calls
export const DASHBOARD_URL = 'https://dashboard.trackmyopt.com';

// Login subdomain for authentication
export const LOGIN_URL = 'https://login.trackmyopt.com';

// Marketing/main domain
export const MARKETING_URL = 'https://trackmyopt.com';

export const API_ENDPOINTS = {
  ME: `${DASHBOARD_URL}/api/me`,
  AUTH: `${LOGIN_URL}/login`,
};
