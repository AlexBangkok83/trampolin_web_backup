# Subdomain Development Setup

This project implements subdomain routing to separate the marketing site from the application interface.

## Development URLs

### Marketing Site (insights.trampolin.ai)

- **Local Development:** `http://localhost:3001`
- **Production:** `https://insights.trampolin.ai`
- **Pages:** Landing, Pricing, Features, About, Login, Signup

### Application Interface (app.insights.trampolin.ai)

- **Local Development:** `http://localhost:3002`
- **Production:** `https://app.insights.trampolin.ai`
- **Pages:** Dashboard, Analyze, Saved, History (all require authentication)

## Running Development Servers

### Option 1: Single Server (Current)

```bash
npm run dev  # Runs on port 3001 by default
```

### Option 2: Both Subdomains Simultaneously

```bash
# Terminal 1 - Marketing Site
npm run dev:main

# Terminal 2 - App Interface
npm run dev:app
```

## How Subdomain Routing Works

### Middleware Logic

- **localhost:3001** → Serves marketing site pages
- **localhost:3002** → Serves app pages (requires authentication)
- Automatically redirects between subdomains based on route access

### Navigation

- Marketing site "Get Started" buttons → `localhost:3002/signup`
- App interface → Stays within `localhost:3002`
- Unauthenticated app access → Redirects to `localhost:3001/login`

## Key Files

- `src/middleware.ts` - Subdomain detection and routing logic
- `src/lib/subdomain.ts` - Utility functions for URL generation
- `src/components/PublicHeader.tsx` - Marketing site navigation
- `src/components/Sidebar.tsx` - App interface navigation

## Testing

1. Start both servers (`npm run dev:main` and `npm run dev:app`)
2. Visit `localhost:3001` - Should show marketing site
3. Click "Get Started" - Should redirect to `localhost:3002/signup`
4. Visit `localhost:3002` directly - Should redirect to login if not authenticated

## Authentication During Development

The project includes NextAuth.js authentication that protects app routes by default.

### Temporarily Disable Auth (Current Setting)

For development and testing of the subdomain structure, authentication is temporarily disabled in `src/middleware.ts`:

```typescript
export const config = {
  // Temporarily disabled for subdomain development testing
  matcher: [],
  // Original: matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

### Re-enable Auth When Ready

To restore authentication protection:

```typescript
export const config = {
  // Enable middleware for all routes except static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

With auth enabled:

- **Marketing site pages** → No auth required
- **App routes** (`/dashboard`, `/analyze`, `/saved`, `/history`) → Require authentication
- **Unauthenticated access to app** → Redirects to login

## Production Deployment

In production, this same codebase will handle both subdomains:

- Deploy to Vercel/Netlify with both domains pointed to same deployment
- Environment variables will determine subdomain behavior
- Middleware automatically detects production vs development environment
- Authentication will be fully enabled and functional
