import { handler } from '@/lib/auth';

// Required for static export
export const dynamic = 'force-dynamic';

// Disable static generation for this route
export const fetchCache = 'force-no-store';

// Next.js Route Handler (App Router) - matches /api/auth/*
export { handler as GET, handler as POST };

// This prevents the route from being included in the static export
// and ensures it's only available as a serverless function
