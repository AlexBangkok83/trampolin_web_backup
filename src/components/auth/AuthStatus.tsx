'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { UserMenu } from './UserMenu';

export function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="animate-pulse">
        <div className="h-4 w-20 rounded bg-gray-200"></div>
      </div>
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-700">
          Welcome, {session.user.name || session.user.email}
        </span>
        <UserMenu />
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Link
        href="/auth/login"
        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
      >
        Sign in
      </Link>
      <span className="text-gray-400">|</span>
      <Link
        href="/auth/register"
        className="text-sm text-green-600 hover:text-green-800 hover:underline"
      >
        Register
      </Link>
    </div>
  );
}
