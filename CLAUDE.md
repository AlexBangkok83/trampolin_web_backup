# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands

- `npm run dev` - Start Next.js development server on http://localhost:3000
- `npm run build` - Build production version (static export)
- `npm run export` - Export static files to `out/` directory
- `npm run start` - Serve static files from `out/` using serve
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

### Standalone Deployment Configuration

This Next.js application is configured for **standalone deployment** on DigitalOcean App Platform:

- `output: 'standalone'` in next.config.ts for containerized deployment
- Full-stack application with API routes and server-side rendering
- Build creates a standalone Node.js server in `.next/standalone/`
- Start command: `node .next/standalone/server.js`

### App Structure

```
src/app/
├── (marketing)/          # Public pages (landing page)
├── (dashboard)/          # Protected dashboard routes
├── auth/                 # Authentication pages (login, register)
├── api/                  # API routes (excluded from static export)
├── csv-upload/           # CSV data upload functionality
└── dashboard/            # Protected dashboard sections
    ├── analytics/        # Data analytics dashboard
    ├── admin/            # Admin-only pages
    └── subscription/     # Subscription management
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

## Important Notes

### Deployment Configuration

- **DigitalOcean App Platform**: Uses standalone output with Node.js runtime
- **Environment Variables**: Requires DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
- **Health Check**: Available at `/api/health` endpoint
- **Static Assets**: Public files are automatically included in standalone build

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
