# Use Debian slim for glibc compatibility (required by lightningcss-linux-x64-gnu)
FROM node:20-slim AS builder
WORKDIR /app

# Copy lockfile and package.json to install dependencies first (better caching)
COPY package.json package-lock.json .npmrc ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/

# Install dependencies (on Linux, this will pull the correct native bindings)
RUN npm install

# Copy the rest of the source
COPY . .

# Build the web application
WORKDIR /app/apps/web
# Set Next.js build-time vars
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# Production image
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 3000

# Copy the standalone output and necessary static files
# Note: Next.js standalone mode bundles everything into .next/standalone
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000

# The server.js is located at the top level of the standalone output for the target app
CMD ["node", "apps/web/server.js"]
