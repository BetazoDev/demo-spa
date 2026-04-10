# Use full node image to ensure all native build tools and libraries are present
FROM node:20 AS builder
WORKDIR /app

# Copy configuration files
COPY package.json package-lock.json .npmrc ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/

# Install dependencies including optional ones (important for platform-specific binaries)
RUN npm install --include=optional

# Copy the rest of the source code
COPY . .

# Build the application
WORKDIR /app/apps/web

# Debug: verify lightningcss binary presence
RUN ls -la ../../node_modules/lightningcss-linux-x64-gnu || echo "LightningCSS binary package not found"

RUN npm run build

# Production image
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 3000

# Copy the standalone output
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000

# Next.js standalone server entry point
CMD ["node", "apps/web/server.js"]
