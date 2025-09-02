#!/bin/bash

echo "🚀 Starting database migrations in Docker..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
npx wait-on tcp:db:5432

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "📊 Running database migrations..."
npx prisma migrate deploy

# Optional: Seed database (uncomment if you have seed data)
# echo "🌱 Seeding database..."
# npx prisma db seed

echo "✅ Database setup complete!"