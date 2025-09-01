# --- Build Stage ---------------------------------------------------------
FROM node:22.16.0 AS builder
WORKDIR /app

# Define build-time arguments for secrets
ARG STRIPE_SECRET_KEY
ARG DATABASE_URL

# Install dependencies first (leverages Docker layer cache)
COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

# Copy source after deps to avoid busting cache on every change
COPY . .

# Next.js requires NEXT_TELEMETRY_DISABLED for CI builds
ENV NEXT_TELEMETRY_DISABLED=1

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# --- Production Stage ----------------------------------------------------
FROM node:22.16.0 AS runner
WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]
