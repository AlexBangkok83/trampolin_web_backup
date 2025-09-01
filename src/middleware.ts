import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_FILE = /\.(.*)$/;

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Skip static files, Next.js internals, and API routes for static export
  if (PUBLIC_FILE.test(pathname) || pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Require auth for all /dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/auth/login';
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Admin-only routes
    if (pathname.startsWith('/dashboard/admin')) {
      const role = (token as { role?: string }).role;
      if (role !== 'admin') {
        const notAllowed = req.nextUrl.clone();
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
