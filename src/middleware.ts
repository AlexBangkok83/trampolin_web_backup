import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isStaticExport =
    process.env.NEXT_PHASE === 'phase-export' || process.env.NODE_ENV === 'production';

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // For static export, just continue
  if (isStaticExport) {
    return NextResponse.next();
  }

  // Get subdomain from host header
  const host = request.headers.get('host') || '';
  const subdomain = host.split('.')[0];

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // Define route categories
  const publicRoutes = ['/', '/pricing', '/features', '/about', '/login', '/signup'];
  const appRoutes = ['/dashboard', '/analyze', '/saved', '/history', '/account'];
  const adminRoutes = ['/dashboard/admin'];
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/api/auth');
  const isAppRoute = appRoutes.some((route) => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // In development, disable complex subdomain logic to avoid cookie issues
  if (process.env.NODE_ENV === 'development') {
    // Just require auth for app routes, no subdomain redirects
    if (isAppRoute && !token) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Admin-only routes check
    if (pathname.startsWith('/dashboard/admin')) {
      const role = (token as { role?: string })?.role;
      if (role !== 'admin') {
        const notAllowed = request.nextUrl.clone();
        notAllowed.pathname = '/403';
        return NextResponse.rewrite(notAllowed);
      }
    }

    return NextResponse.next();
  }

  // Subdomain routing logic
  if (subdomain === 'app') {
    // app.insights.trampolin.ai - App interface

    if (isPublicRoute && pathname !== '/login' && pathname !== '/signup') {
      // Redirect public routes to main domain
      const redirectUrl = new URL(request.url);
      redirectUrl.hostname = redirectUrl.hostname.replace('app.', 'insights.');
      return NextResponse.redirect(redirectUrl);
    }

    if (isAppRoute && !token) {
      // Redirect to login on insights domain
      const loginUrl = new URL(request.url);
      loginUrl.hostname = loginUrl.hostname.replace('app.', 'insights.');
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (pathname === '/' && token) {
      // Redirect root to dashboard for authenticated users
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = '/dashboard';
      return NextResponse.redirect(dashboardUrl);
    }

    // Block admin routes on app subdomain
    if (isAdminRoute) {
      const adminUrl = new URL(request.url);
      adminUrl.hostname = adminUrl.hostname.replace('app.', 'admin.');
      return NextResponse.redirect(adminUrl);
    }
  } else if (subdomain === 'admin') {
    // admin.insights.trampolin.ai - Admin interface

    if (!token) {
      // Redirect to login on insights domain
      const loginUrl = new URL(request.url);
      loginUrl.hostname = loginUrl.hostname.replace('admin.', 'insights.');
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = (token as { role?: string })?.role;
    if (role !== 'admin') {
      const notAllowed = request.nextUrl.clone();
      notAllowed.pathname = '/403';
      return NextResponse.rewrite(notAllowed);
    }

    // Redirect non-admin routes to appropriate subdomain
    if (isPublicRoute) {
      const publicUrl = new URL(request.url);
      publicUrl.hostname = publicUrl.hostname.replace('admin.', 'insights.');
      return NextResponse.redirect(publicUrl);
    }

    if (isAppRoute && !isAdminRoute) {
      const appUrl = new URL(request.url);
      appUrl.hostname = appUrl.hostname.replace('admin.', 'app.');
      return NextResponse.redirect(appUrl);
    }

    // Redirect root to admin dashboard
    if (pathname === '/') {
      const adminDashboard = request.nextUrl.clone();
      adminDashboard.pathname = '/dashboard/admin';
      return NextResponse.redirect(adminDashboard);
    }
  } else if (subdomain === 'insights' || !subdomain.includes('trampolin')) {
    // insights.trampolin.ai - Marketing site

    if (isAppRoute && !isAdminRoute) {
      if (!token) {
        // Redirect to login on insights domain
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/login';
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      } else {
        // Redirect authenticated users to app subdomain
        const appUrl = new URL(request.url);
        appUrl.hostname = appUrl.hostname.replace('insights.', 'app.');
        return NextResponse.redirect(appUrl);
      }
    }

    if (isAdminRoute) {
      if (!token) {
        // Redirect to login on insights domain
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/login';
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      } else {
        // Redirect to admin subdomain
        const adminUrl = new URL(request.url);
        adminUrl.hostname = adminUrl.hostname.replace('insights.', 'admin.');
        return NextResponse.redirect(adminUrl);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
