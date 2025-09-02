/**
 * Utility functions for handling subdomain routing during development and production
 */

export function getAppUrl(path: string = '/'): string {
  if (typeof window === 'undefined') {
    // Server-side: return relative path
    return path;
  }

  // Client-side: determine the correct URL based on environment
  const currentHostname = window.location.hostname;

  // Development environment
  if (currentHostname === 'localhost' || currentHostname.includes('127.0.0.1')) {
    return `http://localhost:3001${path}`;
  }

  // Production environment - construct app subdomain
  if (currentHostname.startsWith('insights.')) {
    return `https://app.${currentHostname}${path}`;
  }

  // Fallback - assume we need to add app subdomain
  return `https://app.insights.trampolin.ai${path}`;
}

export function getMainSiteUrl(path: string = '/'): string {
  if (typeof window === 'undefined') {
    // Server-side: return relative path
    return path;
  }

  // Client-side: determine the correct URL based on environment
  const currentHostname = window.location.hostname;

  // Development environment
  if (currentHostname === 'localhost' || currentHostname.includes('127.0.0.1')) {
    return `http://localhost:3001${path}`;
  }

  // Production environment
  return `https://insights.trampolin.ai${path}`;
}

export function isAppSubdomain(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const hostname = window.location.hostname;
  const port = window.location.port;

  // Development check
  if (port === '3001') {
    return true;
  }

  // Production check
  return hostname.startsWith('app.');
}
