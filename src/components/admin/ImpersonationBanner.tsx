'use client';

import { useSession } from 'next-auth/react';
import { ExclamationTriangleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export function ImpersonationBanner() {
  const { data: session, update } = useSession();

  if (!(session?.user as { isImpersonating?: boolean })?.isImpersonating) {
    return null;
  }

  const handleEndImpersonation = async () => {
    try {
      await update({
        endImpersonation: true,
      });

      // Redirect back to admin
      window.location.href = '/dashboard/admin';
    } catch (error) {
      console.error('Error ending impersonation:', error);
      alert('Failed to end impersonation. Please try again.');
    }
  };

  return (
    <div className="mb-6 border-l-4 border-yellow-400 bg-yellow-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-yellow-700">
            <span className="font-medium">You are impersonating this user.</span> You are currently
            logged in as <strong>{session?.user?.email}</strong>, impersonating on behalf of admin{' '}
            <strong>
              {(session?.user as { originalAdminEmail?: string })?.originalAdminEmail}
            </strong>
            .
          </p>
        </div>
        <div className="ml-3">
          <button
            onClick={handleEndImpersonation}
            className="inline-flex items-center rounded-md bg-yellow-100 px-3 py-2 text-sm font-semibold text-yellow-800 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 focus:ring-offset-yellow-50"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Return to Admin
          </button>
        </div>
      </div>
    </div>
  );
}
