FROM node:20-slim AS runner
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y python3 make g++ curl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json package-lock.json* ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Build
RUN npm run build --workspaces

EXPOSE 3000

CMD ["npm", "run", "start"]
