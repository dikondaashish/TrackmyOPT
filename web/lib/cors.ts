import { NextRequest } from 'next/server';

// Allowed origins for CORS (extension and subdomains)
const ALLOWED_ORIGINS = [
  'https://trackmyopt.com',
  'https://www.trackmyopt.com',
  'https://login.trackmyopt.com',
  'https://dashboard.trackmyopt.com',
  'http://localhost:3000',
];

/**
 * Get CORS headers based on request origin
 * Supports Chrome extensions and subdomain requests with credentials
 */
export function getCorsHeaders(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  
  // Allow Chrome extension origins
  const isExtension = origin.startsWith('chrome-extension://');
  const isAllowed = ALLOWED_ORIGINS.includes(origin) || isExtension;
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

/**
 * Get CORS headers with cache control (for data APIs)
 */
export function getCorsHeadersWithCache(request: NextRequest) {
  return {
    ...getCorsHeaders(request),
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    'Pragma': 'no-cache',
  };
}
