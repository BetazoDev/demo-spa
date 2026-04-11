# Build stage - MUST be built from repo root
FROM node:20-slim AS builder
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copy all package files for workspace resolution
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/

# Install all dependencies (workspace-aware)
RUN npm install

# Copy source code
COPY apps/api ./apps/api

# Build TypeScript
WORKDIR /app/apps/api
RUN npm run build

# Production stage
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built files
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./

# Copy node_modules from root (workspaces hoist deps there)
COPY --from=builder /app/node_modules ./node_modules

# Expose port
EXPOSE 3000

# Start the API server
CMD ["node", "dist/index.js"]