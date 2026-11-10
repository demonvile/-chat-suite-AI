# ==========================================
# STAGE 1: Build & Dependencies (Builder)
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install all dependencies (including devDependencies for TypeScript build)
RUN npm ci

# Copy source code
COPY . .

# Build Vite frontend and bundled CJS server.ts using esbuild
RUN npm run build

# ==========================================
# STAGE 2: Production Runtime
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install security updates and curl for container healthcheck
RUN apk add --no-cache curl

# Create non-root user for security isolation
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy build artifacts and dependencies from builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/data ./data

# Ensure data directory exists and assign permissions to nodejs user
RUN mkdir -p /app/data && chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

# Container Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "dist/server.cjs"]
