# --- Build Stage ---------------------------------------------------------
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies first (leverages Docker layer cache)
COPY package*.json ./
RUN npm install --production=false --legacy-peer-deps

# Copy source after deps to avoid busting cache on every change
COPY . .

# Next.js requires NEXT_TELEMETRY_DISABLED for CI builds
ENV NEXT_TELEMETRY_DISABLED 1

# Build the application
RUN npm run build

# --- Production Stage ----------------------------------------------------
FROM node:18-alpine AS runner
WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js

# Install production dependencies
RUN npm install --production --legacy-peer-deps && npm cache clean --force;

EXPOSE 3000
ENV NODE_ENV production

CMD ["npm", "start"]
