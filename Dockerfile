FROM oven/bun:1.2.21 AS builder

WORKDIR /app

# Copy the entire workspace config
COPY package.json bun.lock turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/

# Install dependencies for all workspaces
RUN bun install

# Copy source code
COPY packages/db/ ./packages/db/
COPY apps/api/ ./apps/api/

# Generate Prisma Client
WORKDIR /app/packages/db
RUN bunx prisma generate

# Build the API
WORKDIR /app/apps/api
RUN bun run build

# --- Production Image ---
FROM oven/bun:1.2.21-alpine AS runner

WORKDIR /app

# Run as non-root user for security
RUN addgroup -S bunuser && adduser -S bunuser -G bunuser
USER bunuser

# Copy over node_modules to ensure all runtime deps are present, especially Prisma engine
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/db/node_modules ./packages/db/node_modules

# Copy Prisma schema & generated client
COPY --from=builder /app/packages/db/prisma ./packages/db/prisma

# Copy built API
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/

WORKDIR /app/apps/api

# Expose standard port
EXPOSE 8080

# Environment variables (to be provided at runtime)
ENV NODE_ENV=production
ENV PORT=8080

CMD ["bun", "dist/index.js"]
