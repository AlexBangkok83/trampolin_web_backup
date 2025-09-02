# Docker Setup for Trampolin Web App

This document provides comprehensive instructions for setting up and running the Trampolin web application using Docker.

## Prerequisites

- **Docker Desktop** installed and running
- **Docker Compose** (included with Docker Desktop)

## Installation

### Docker Desktop for macOS

1. **Download**: Visit [Docker Desktop](https://www.docker.com/products/docker-desktop/) and download for your Mac (Apple Silicon/Intel)
2. **Install**: Drag Docker to Applications folder
3. **Launch**: Open Docker Desktop, grant permissions when prompted
4. **Verify**: Run `docker --version` and `docker compose version`

## Quick Start

```bash
# 1. Build and start all services
npm run docker:up-build

# 2. Run database migrations (in another terminal)
npm run docker:migrate

# 3. Access the application
# Frontend: http://localhost:3000
# Database: localhost:5432
```

## Available Commands

| Command                   | Purpose                    |
| ------------------------- | -------------------------- |
| `npm run docker:build`    | Build Docker images        |
| `npm run docker:up`       | Start services (detached)  |
| `npm run docker:up-build` | Build and start services   |
| `npm run docker:down`     | Stop and remove containers |
| `npm run docker:logs`     | View container logs        |
| `npm run docker:migrate`  | Run database migrations    |
| `npm run docker:studio`   | Open Prisma Studio         |

## Services

### Web Application

- **Container**: `trampolin-web`
- **Port**: 3000
- **URL**: http://localhost:3000

### PostgreSQL Database

- **Container**: `trampolin-db`
- **Port**: 5432
- **Database**: `trampolin`
- **Username**: `postgres`
- **Password**: `postgres`

## Environment Configuration

The Docker setup uses `.env.docker` for environment variables:

```env
# Database (internal Docker network)
DATABASE_URL=postgresql://postgres:postgres@db:5432/trampolin

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# Stripe (Test Environment)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

## Database Management

### Initial Setup

```bash
# Start services
npm run docker:up-build

# Run migrations
npm run docker:migrate

# Optional: Access Prisma Studio
npm run docker:studio
```

### Development Workflow

```bash
# View logs
npm run docker:logs

# Restart services
npm run docker:down
npm run docker:up

# Reset database (WARNING: destroys data)
docker volume rm trampolin-web_postgres-data
npm run docker:up-build
npm run docker:migrate
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**

   ```bash
   # Stop conflicting services
   lsof -ti:3000 | xargs kill -9
   lsof -ti:5432 | xargs kill -9
   ```

2. **Database Connection Failed**

   ```bash
   # Check if PostgreSQL container is running
   docker compose ps

   # View database logs
   docker compose logs db
   ```

3. **Migration Errors**

   ```bash
   # Reset Prisma client
   docker compose exec web npx prisma generate

   # Force migration
   docker compose exec web npx prisma migrate reset
   ```

4. **Build Failures**
   ```bash
   # Clean build
   docker compose down
   docker system prune -a
   npm run docker:up-build
   ```

## Production Deployment

For production deployment, update:

1. **Environment Variables**
   - Set secure `NEXTAUTH_SECRET`
   - Update `NEXTAUTH_URL` to production domain
   - Configure production Stripe keys

2. **Database**
   - Use managed PostgreSQL service
   - Update `DATABASE_URL` accordingly

3. **Security**
   - Remove development volumes
   - Use production Docker image
   - Enable HTTPS/SSL

## File Structure

```
├── docker-compose.yml          # Docker services configuration
├── Dockerfile                  # Multi-stage production build
├── .env.docker                 # Docker environment variables
├── .env.local                  # Local development environment
├── scripts/
│   └── docker-migrate.sh       # Database migration script
└── DOCKER.md                   # This documentation
```

## Health Checks

```bash
# Check service status
docker compose ps

# Test database connection
docker compose exec db psql -U postgres -d trampolin -c "SELECT version();"

# Test web application
curl http://localhost:3000/api/auth/csrf
```

## Next Steps

1. **Install Docker Desktop** following the README instructions
2. **Run the setup commands** above
3. **Access the application** at http://localhost:3000
4. **Run database migrations** using the provided scripts
5. **Start developing** with full PostgreSQL support!

## Support

If you encounter issues:

1. Check Docker Desktop is running
2. Verify no port conflicts (3000, 5432)
3. Review container logs using `npm run docker:logs`
4. Restart services with `npm run docker:down && npm run docker:up-build`
