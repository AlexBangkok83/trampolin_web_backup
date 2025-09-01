# Trampolin Web

Trampolin is a production-ready SaaS platform built with Next.js, designed to provide a robust starting point for analytics and data-driven applications.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features

- ✅ **Authentication**: Secure user sign-up and login with NextAuth.js.
- ✅ **Dashboard**: A protected, responsive dashboard with data visualizations.
- ✅ **Responsive Design**: Mobile-first design for both marketing and dashboard pages.
- ✅ **Dark Mode**: Light and dark theme support with `next-themes`.
- ✅ **CSV Upload & Processing**: Functionality for users to upload and process CSV data.
- ✅ **Deployment Ready**: Pre-configured for deployment on DigitalOcean with Docker and health checks.

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) with Radix UI primitives
- **Authentication**: [NextAuth.js](https://next-auth.js.org)
- **Database**: [PostgreSQL](https://www.postgresql.org) with [Prisma ORM](https://www.prisma.io)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com), [Headless UI](https://headlessui.com)
- **Charts**: [Chart.js](https://www.chartjs.org) with `react-chartjs-2`
- **Linting & Formatting**: ESLint & Prettier with Husky pre-commit hooks
- **Deployment**: Docker & DigitalOcean App Platform

## Getting Started

### Prerequisites

- Node.js (v20.x or later)
- npm (v9.x or later)
- Git
- Docker (optional, for local containerized development)

### 1. Installation

Clone the repository and install the dependencies.

```bash
git clone https://github.com/BrightOnAnalytics/trampolin-web.git
cd trampolin-web
npm install
```

### 2. Environment Variables

Copy the example environment file and update it with your credentials.

```bash
cp .env.example .env.local
```

Your `.env.local` file will need the following variables:

```env
# Database
DATABASE_URL="postgres://postgres:postgres@localhost:5432/trampolin"

# NextAuth.js Configuration
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Stripe (if used)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 3. Set Up Database

Run the Prisma migrations to set up your database schema.

```bash
npx prisma migrate dev
```

### 4. Run the Development Server

Start the development server and open the application in your browser.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
.do/
 └─ app.yaml           # DigitalOcean App Platform config
docs/
 ├─ deployment.md
 └─ architecture.md
prisma/
 ├─ migrations/
 └─ schema.prisma
public/
src/
 ├─ app/
 │  ├─ (dashboard)/   # Protected dashboard routes
 │  ├─ (marketing)/   # Public marketing routes
 │  └─ api/           # API routes
 ├─ components/
 │  ├─ dashboard/
 │  ├─ marketing/
 │  └─ ui/            # Reusable UI components (shadcn)
 ├─ lib/               # Core libraries (auth, prisma, etc.)
 └─ contexts/          # React contexts
```

## Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Creates a production build.
- `npm start`: Starts the production server.
- `npm run lint`: Lints the codebase.
- `npm run format`: Formats files with Prettier.

## Deployment

This project is configured for deployment on the DigitalOcean App Platform. For detailed instructions, see the [Deployment Guide](./docs/deployment.md).

## Contributing

Contributions are welcome! Please see the [Contributing Guide](./CONTRIBUTING.md) for more details on how to get started.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
