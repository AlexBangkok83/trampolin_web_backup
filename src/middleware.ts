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

  // Apply authentication for protected routes
  if (pathname.startsWith('/dashboard')) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Admin-only routes
    if (pathname.startsWith('/dashboard/admin')) {
      const role = (token as { role?: string }).role;
      if (role !== 'admin') {
        const notAllowed = request.nextUrl.clone();
        notAllowed.pathname = '/403';
        return NextResponse.rewrite(notAllowed);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
