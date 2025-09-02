import { handler } from '@/lib/auth';

// Required for dynamic authentication
export const dynamic = 'force-dynamic';

// Next.js Route Handler (App Router) - matches /api/auth/*
export { handler as GET, handler as POST };

// This prevents the route from being included in the static export
// and ensures it's only available as a serverless function
