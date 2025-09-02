import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_FILE = /\.(.*)$/;

export async function middleware(req: NextRequest) {
  // Skip static files and Next.js internals
  const pathname = req.nextUrl.pathname;
  if (pathname.startsWith('/api') || PUBLIC_FILE.test(pathname) || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  // Get subdomain from host header
  const host = req.headers.get('host') || '';
  const subdomain = host.split('.')[0];

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Define route categories
  const publicRoutes = ['/', '/pricing', '/features', '/about', '/login', '/signup'];
  const appRoutes = ['/dashboard', '/analyze', '/saved', '/history', '/account'];
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/api/auth');
  const isAppRoute = appRoutes.some((route) => pathname.startsWith(route));

  // In development, disable complex subdomain logic to avoid cookie issues
  if (process.env.NODE_ENV === 'development') {
    // Just require auth for app routes, no subdomain redirects
    if (isAppRoute && !token) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Subdomain routing logic
  if (subdomain === 'app') {
    // app.insights.trampolin.ai - App interface

    if (isPublicRoute && pathname !== '/login' && pathname !== '/signup') {
      // Redirect public routes to main domain
      const redirectUrl = new URL(req.url);
      redirectUrl.hostname = redirectUrl.hostname.replace('app.', '');
      return NextResponse.redirect(redirectUrl);
    }

    if (isAppRoute && !token) {
      // Redirect to login for protected app routes
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (pathname === '/' && token) {
      // Redirect root to dashboard for authenticated users
      const dashboardUrl = req.nextUrl.clone();
      dashboardUrl.pathname = '/dashboard';
      return NextResponse.redirect(dashboardUrl);
    }
  } else if (subdomain === 'insights' || !subdomain.includes('trampolin')) {
    // insights.trampolin.ai - Marketing site

    if (isAppRoute) {
      if (!token) {
        // Redirect to login on main domain
        const loginUrl = req.nextUrl.clone();
        loginUrl.pathname = '/login';
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      } else {
        // Redirect authenticated users to app subdomain
        const appUrl = new URL(req.url);
        appUrl.hostname = appUrl.hostname.replace('insights.', 'app.');
        return NextResponse.redirect(appUrl);
      }
    }

    // Allow access to public marketing pages
  }

  return NextResponse.next();
}

export const config = {
  // Temporarily disabled for subdomain development testing
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
  // Original: matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
