import { AuthGuard } from '@/components/auth/AuthGuard';
import { AuthStatus } from '@/components/auth/AuthStatus';

export default function DashboardPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <AuthStatus />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="rounded-lg border-4 border-dashed border-gray-200 p-8">
              <h2 className="mb-4 text-xl font-semibold">Welcome to your Dashboard</h2>
              <p className="text-gray-600">
                This is a protected page that requires authentication to access.
              </p>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
