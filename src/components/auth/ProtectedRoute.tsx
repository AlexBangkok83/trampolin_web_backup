'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRole?: string;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requiredRole,
  redirectTo = '/auth/login',
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (requireAuth && !session) {
      router.push(redirectTo);
      return;
    }

    if (requiredRole && session) {
      const userRole = (session.user as { role?: string }).role;
      if (userRole !== requiredRole) {
        router.push('/403'); // Unauthorized
        return;
      }
    }
  }, [session, status, requireAuth, requiredRole, redirectTo, router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (requireAuth && !session) {
    return null; // Redirecting
  }

  if (requiredRole && session) {
    const userRole = (session.user as { role?: string }).role;
    if (userRole !== requiredRole) {
      return null; // Redirecting
    }
  }

  return <>{children}</>;
}
