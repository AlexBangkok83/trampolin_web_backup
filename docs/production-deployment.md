# Production Deployment Guide

## Overview

This guide covers the proper way to deploy and manage the production database using Prisma migrations and industry best practices.

## Database Management Strategy

### 1. Migration-Based Schema Changes

- Use `prisma migrate` for all schema changes
- Never use `prisma db push` in production
- All schema changes are version-controlled through migration files

### 2. Environment-Specific Seeding

- Development: Full test dataset with sample users
- Production: Minimal seed with admin user only

## Deployment Process

### Initial Production Setup

If this is a fresh production deployment:

```bash
# 1. Deploy migrations
npx prisma migrate deploy

# 2. Generate Prisma client
npx prisma generate

# 3. Seed production data
npm run seed
```

### For Existing Production Database

If production already has data but no migration history:

```bash
# 1. Baseline the existing database
npx prisma migrate resolve --applied "20240101000000_init"

# 2. Deploy any new migrations
npx prisma migrate deploy

# 3. Generate client
npx prisma generate
```

### Regular Deployments

For normal deployments with schema changes:

```bash
# Automatic via postbuild hook
npm run build  # This triggers db:migrate automatically
```

## Manual Database Operations

### Reset Development Database

```bash
npm run db:reset
```

### Seed Database

```bash
npm run db:seed
```

### Check Migration Status

```bash
npx prisma migrate status
```

## Production Environment Variables

Required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: JWT secret key
- `NEXTAUTH_URL`: Application URL

## Rollback Strategy

If a deployment fails:

1. **Application rollback**: Deploy previous version
2. **Database rollback**:
   ```bash
   npx prisma migrate resolve --rolled-back <migration_name>
   ```

## Health Checks

The application includes a health check endpoint at `/api/health` that verifies:

- Database connectivity
- Prisma client functionality

## Monitoring

Monitor these metrics:

- Database connection pool usage
- Migration deployment success/failure
- Application startup time
- API response times

## Best Practices

1. **Always test migrations** in staging environment first
2. **Backup database** before major schema changes
3. **Use transactions** for complex data migrations
4. **Monitor logs** during deployment
5. **Have rollback plan** ready

## Common Issues

### Migration Conflicts

If migrations are out of sync:

```bash
npx prisma migrate status
npx prisma migrate resolve --applied <migration_name>
```

### Client Generation Issues

```bash
npx prisma generate --schema=./prisma/schema.prisma
```

### Connection Issues

Verify `DATABASE_URL` and network connectivity to database.
