# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands

- `npm run dev` - Start Next.js development server on http://localhost:3000
- `npm run build` - Build production version
- `npm run start` - Start production server (next start)
- `npm run lint` - Run ESLint on TypeScript/JavaScript files in src/
- `npm run format` - Format files with Prettier
- `npm test` - Run Jest test suite
- `npm test:ci` - Run tests in CI mode

### Database Commands

- `npx prisma migrate dev` - Run database migrations in development
- `npx prisma generate` - Generate Prisma client
- `npm run seed` - Seed database with initial data
- `npx prisma studio` - Open Prisma Studio for database exploration

## Architecture Overview

### Standard Deployment Configuration

This Next.js application is configured for **standard deployment** on DigitalOcean App Platform:

- Uses default Next.js output mode for maximum compatibility
- Full-stack application with API routes and server-side rendering
- Standard Next.js production build in `.next/` directory
- Start command: `next start` (or `npm start`)

### App Structure

```
src/app/
├── auth/                 # Authentication pages (login, register)
├── api/                  # API routes (server-side endpoints)
├── csv-upload/           # CSV data upload functionality
├── dashboard/            # Protected dashboard sections
│   ├── analytics/        # Data analytics dashboard
│   ├── admin/            # Admin-only pages
│   └── subscription/     # Subscription management
└── page.tsx              # Simple landing page
```

### Authentication System

- **Provider**: NextAuth.js with Credentials provider
- **Adapter**: Prisma adapter for database sessions
- **Strategy**: JWT-based sessions
- **Protection**: Middleware protects `/dashboard/*` routes
- **Roles**: User roles stored in database (admin/user)
- **Admin Routes**: `/dashboard/admin/*` requires admin role

### Database Schema (Prisma + PostgreSQL)

Key models:

- `User` - User accounts with roles and Stripe integration
- `Role` - User roles (admin, user)
- `Subscription` - Stripe subscription management
- `CsvUpload` - CSV file upload tracking
- `CsvRow` - Individual CSV row data storage
- NextAuth.js models: `Account`, `Session`, `VerificationToken`

### Key Libraries & Frameworks

- **UI**: Tailwind CSS + Radix UI primitives + Shadcn/ui components
- **Charts**: Chart.js with react-chartjs-2
- **Forms**: React Hook Form (inferred from components)
- **File Upload**: react-dropzone for CSV uploads
- **CSV Processing**: fast-csv for parsing
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Validation**: Zod schemas
- **Payments**: Stripe integration

### Component Architecture

- `src/components/ui/` - Reusable UI components (buttons, inputs, etc.)
- `src/components/auth/` - Authentication-related components
- `src/components/dashboard/` - Dashboard layout components
- `src/components/charts/` - Data visualization components
- `src/contexts/` - React context providers
- `src/hooks/` - Custom React hooks

### Styling Conventions

- Uses Tailwind CSS with custom design system
- Dark mode support via `next-themes`
- Component variants managed with `class-variance-authority`
- Responsive design with mobile-first approach

### CSV Analytics Features

This is a SaaS analytics platform focused on CSV data:

- Users can upload CSV files via drag-and-drop
- Data is parsed and stored in PostgreSQL
- Interactive charts and visualizations
- Role-based access control
- Subscription-based billing model

### Testing Setup

- **Framework**: Jest with jsdom environment
- **Library**: React Testing Library
- **Config**: `jest.config.mjs` with Next.js integration
- **Path Mapping**: `@/` alias points to `src/`
- Run specific tests: `npm test -- ComponentName.test.tsx`

### Code Quality

- ESLint with Next.js and Prettier configs
- Pre-commit hooks with Husky and lint-staged
- TypeScript strict mode enabled
- Automated formatting and linting on commit

## Deployment Process

### Live Deployment to Production

**IMPORTANT: Always deploy to the main production repository for live deployment.**

#### Repository Setup

- **Production Repository**: `https://github.com/BrightOnAnalytics/trampolin-web` (upstream)
- **Backup Repository**: `https://github.com/AlexBangkok83/trampolin_web_backup` (origin)
- **Live URL**: Connected to DigitalOcean App Platform for auto-deployment

#### Pre-Deployment Checklist

Run these commands in order to ensure production readiness:

1. **Lint Check**: `npm run lint` (should pass with 0 errors, warnings OK)
2. **Build Test**: `npm run build` (must succeed completely)
3. **Test Suite**: `npm test` (all tests must pass)

#### Deployment Commands

**✅ CORRECT - Deploy to Production:**

```bash
git add .
git commit -m "feat: your changes description"
git push upstream main  # Deploys to live site
```

**⚠️ BACKUP ONLY - Not for live deployment:**

```bash
git push origin main  # Only updates backup repo
```

#### Critical Build Requirements

**Environment Variables** (must be set in DigitalOcean):

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL` - Your production domain
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret

**Common Build Issues Fixed:**

- ✅ Stripe initialization moved inside functions (not at module level)
- ✅ TypeScript strict type checking for Theme values
- ✅ NextAuth SessionProvider properly configured in tests
- ✅ Logo optimization with Next.js Image component

#### Auto-Deployment Flow

1. **Push to `upstream main`** → Triggers DigitalOcean build
2. **DigitalOcean builds** using `npm run build`
3. **Starts with** `npm start` (next start)
4. **Health check** at `/api/health`
5. **Live in ~2-5 minutes**

#### Troubleshooting Deployments

**If deployment fails:**

1. Check DigitalOcean App Platform logs
2. Verify environment variables are set
3. Ensure `npm run build` passes locally
4. Check database connectivity

**Quick Recovery:**

```bash
# If you accidentally pushed to wrong repo
git push upstream main --force-with-lease
```

#### Testing Deployment Locally

```bash
npm run build  # Must succeed
npm start      # Test production build
# Test at http://localhost:3000
```

## Important Notes

### Deployment Configuration

- **DigitalOcean App Platform**: Uses standard Next.js build with Node.js runtime
- **Build Command**: `npm run build`
- **Start Command**: `npm start` (runs `next start`)
- **Required Environment Variables**:
  - `DATABASE_URL` - PostgreSQL database connection string
  - `NEXTAUTH_SECRET` - Secret key for NextAuth.js (generate with `openssl rand -base64 32`)
  - `NEXTAUTH_URL` - Full URL of your application (e.g., `https://yourapp.ondigitalocean.app`)
  - `STRIPE_SECRET_KEY` - Stripe secret key (optional, for payments)
  - `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret (optional, for payments)
- **Health Check**: Available at `/api/health` endpoint
- **Port**: Application runs on port 3000 by default (configurable via PORT env var)
- **Known Issue Fix**: Removed marketing page that was causing client reference manifest errors in Next.js 15.5.2

### Development Workflow

1. Run database migrations: `npx prisma migrate dev`
2. Start development server: `npm run dev`
3. Make changes and test: `npm test`
4. Lint and format: `npm run lint && npm run format`
5. Build for production: `npm run build`
6. Test locally: `npm start` (runs standalone server)

### File Upload System

- CSV files are processed server-side
- File validation and error handling
- Progress tracking for large uploads
- Stored data enables analytics dashboard features
