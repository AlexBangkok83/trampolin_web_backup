# --- Build Stage ---------------------------------------------------------
FROM node:22.16.0-alpine AS builder
WORKDIR /app

# Install dependencies first (leverages Docker layer cache)
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source after deps to avoid busting cache on every change
COPY . .

# Next.js requires NEXT_TELEMETRY_DISABLED for CI builds
ENV NEXT_TELEMETRY_DISABLED=1

# Generate Prisma Client (requires a dummy DATABASE_URL for schema generation)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx prisma generate

# Build the application
RUN npm run build

# --- Production Stage ----------------------------------------------------
FROM node:22.16.0-alpine AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install only production dependencies
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production --legacy-peer-deps && npm cache clean --force

# Copy all necessary files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/prisma ./prisma

# Set correct permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
