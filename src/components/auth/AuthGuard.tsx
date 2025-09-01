'use client';

import { useSession } from 'next-auth/react';
import { ReactNode } from 'react';
import Link from 'next/link';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireAuth?: boolean;
  requiredRole?: string;
}

export function AuthGuard({
  children,
  fallback,
  requireAuth = true,
  requiredRole,
}: AuthGuardProps) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (requireAuth && !session) {
    return (
      fallback || (
        <div className="p-8 text-center">
          <h2 className="mb-4 text-xl font-semibold">Authentication Required</h2>
          <p className="mb-4 text-gray-600">You need to sign in to access this content.</p>
          <Link
            href="/auth/login"
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Sign In
          </Link>
        </div>
      )
    );
  }

  if (requiredRole && session) {
    const userRole = (session.user as { role?: string }).role;
    if (userRole !== requiredRole) {
      return (
        fallback || (
          <div className="p-8 text-center">
            <h2 className="mb-4 text-xl font-semibold">Access Denied</h2>
            <p className="mb-4 text-gray-600">
              You don&apos;t have permission to access this content.
            </p>
            <p className="text-sm text-gray-500">
              Required role: {requiredRole}, Your role: {userRole}
            </p>
          </div>
        )
      );
    }
  }

  return <>{children}</>;
}
