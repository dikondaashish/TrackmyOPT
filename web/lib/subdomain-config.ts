/**
 * Subdomain Configuration
 * 
 * Handles URL generation for multi-subdomain architecture:
 * - trackmyopt.com (marketing)
 * - login.trackmyopt.com (auth)
 * - dashboard.trackmyopt.com (app)
 */

// Check if we're in production (has subdomains) or development (localhost)
const isProduction = process.env.NODE_ENV === 'production';
const isLocalhost = typeof window !== 'undefined' 
  ? window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  : process.env.NEXT_PUBLIC_SITE_URL?.includes('localhost');

/**
 * Subdomain URLs
 */
export const subdomainConfig = {
  // Root domain for cookie sharing
  rootDomain: process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'trackmyopt.com',
  
  // Cookie domain (with leading dot for subdomain sharing)
  // In development, we don't set domain (defaults to current host)
  cookieDomain: isLocalhost ? undefined : (process.env.COOKIE_DOMAIN || '.trackmyopt.com'),
  
  // Marketing/landing page URL
  marketing: isLocalhost 
    ? 'http://localhost:3000' 
    : (process.env.NEXT_PUBLIC_MARKETING_URL || 'https://trackmyopt.com'),
  
  // Login/auth URL
  login: isLocalhost 
    ? 'http://localhost:3000' 
    : (process.env.NEXT_PUBLIC_LOGIN_URL || 'https://login.trackmyopt.com'),
  
  // Dashboard/app URL
  dashboard: isLocalhost 
    ? 'http://localhost:3000' 
    : (process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://dashboard.trackmyopt.com'),
  
  // Current site URL (for backwards compatibility)
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
};

/**
 * Get the appropriate URL for a given path
 */
export function getUrl(type: 'marketing' | 'login' | 'dashboard', path: string = ''): string {
  const baseUrl = subdomainConfig[type];
  return `${baseUrl}${path}`;
}

/**
 * Get OAuth callback URL
 */
export function getOAuthCallbackUrl(): string {
  return `${subdomainConfig.login}/auth/callback`;
}

/**
 * Get redirect URL after successful login
 */
export function getPostLoginRedirectUrl(): string {
  return `${subdomainConfig.dashboard}/dashboard`;
}

/**
 * Get login page URL with optional redirect
 */
export function getLoginUrl(redirectTo?: string): string {
  if (redirectTo) {
    return `${subdomainConfig.login}/login?redirect=${encodeURIComponent(redirectTo)}`;
  }
  return `${subdomainConfig.login}/login`;
}

/**
 * Check if current request is from a specific subdomain
 */
export function isSubdomain(hostname: string, subdomain: 'login' | 'dashboard' | 'www' | 'root'): boolean {
  const rootDomain = subdomainConfig.rootDomain;
  
  switch (subdomain) {
    case 'login':
      return hostname === `login.${rootDomain}`;
    case 'dashboard':
      return hostname === `dashboard.${rootDomain}`;
    case 'www':
      return hostname === `www.${rootDomain}`;
    case 'root':
      return hostname === rootDomain || hostname === `www.${rootDomain}`;
    default:
      return false;
  }
}

/**
 * Get subdomain from hostname
 */
export function getSubdomain(hostname: string): string | null {
  const rootDomain = subdomainConfig.rootDomain;
  
  if (hostname === rootDomain || hostname === `www.${rootDomain}`) {
    return null; // root domain
  }
  
  if (hostname.endsWith(`.${rootDomain}`)) {
    return hostname.replace(`.${rootDomain}`, '');
  }
  
  return null;
}

export default subdomainConfig;
