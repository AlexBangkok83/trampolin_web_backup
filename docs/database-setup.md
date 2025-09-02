# Database Setup Guide

This guide provides an overview of the database schema, migration procedures, and best practices for managing the Trampolin web application's PostgreSQL database.

## Schema Overview

The database schema is managed using Prisma. The schema definition can be found in `prisma/schema.prisma`.

### Core Models

- **User**: Stores user account information, including authentication details and references to other models.
- **Role**: Defines user roles for role-based access control (RBAC).
- **Account, Session, VerificationToken**: Standard NextAuth.js models for handling authentication providers and sessions.
- **Subscription**: Manages user subscription data integrated with Stripe, including status, price, and billing cycle.
- **CsvUpload & CsvRow**: Handles metadata and row-level data for user-uploaded CSV files.

For a detailed view of all models, fields, and relations, please refer to the [`prisma/schema.prisma`](../prisma/schema.prisma) file.

## Migrations

Prisma Migrate is used to manage database schema changes. Migrations are automatically generated from changes in the Prisma schema file.

### Creating a New Migration

After modifying the `schema.prisma` file, create a new migration with the following command:

```bash
npx prisma migrate dev --name <migration-name>
```

Replace `<migration-name>` with a descriptive name for your changes (e.g., `add-user-preferences`). This command will:

1. Create a new SQL migration file in `prisma/migrations/`.
2. Apply the migration to your local development database.
3. Update the Prisma Client to reflect the schema changes.

### Applying Migrations

To apply pending migrations to a database (e.g., in a production or staging environment), use the following command:

```bash
npx prisma migrate deploy
```

This command runs all pending migrations and is safe to execute in production environments. Our DigitalOcean deployment is configured to run this command automatically on every build.

### Seeding the Database

The project includes a seed script located at `prisma/seed.ts` to populate the database with initial data (e.g., default user roles). To run the seed script, use:

```bash
npx prisma db seed
```

## Backup and Restore

For production environments hosted on platforms like DigitalOcean, it is highly recommended to use a managed PostgreSQL database service, which typically includes automated backup and point-in-time recovery features.

### Backup Strategy

- **Automated Backups**: Configure daily or weekly automated backups through your database provider's dashboard.
- **Manual Backups**: For manual backups, you can use the `pg_dump` utility:

  ```bash
  pg_dump -U <user> -h <host> -p <port> -d <database> -F c -b -v -f backup.dump
  ```

### Restore Procedure

To restore from a backup file, use the `pg_restore` utility:

```bash
pg_restore -U <user> -h <host> -p <port> -d <database> --clean --no-acl --no-owner backup.dump
```

Always test your restore procedures in a non-production environment to ensure data integrity.
