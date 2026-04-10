FROM node:20-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y python3 make g++ curl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json package-lock.json* ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/

# Install dependencies for the whole monorepo
RUN npm install

# Copy source
COPY . .

# Build both
RUN npm run build --workspaces

# Expose port (Dokploy will route this)
EXPOSE 3000

# The command will be overridden by Dokploy's "Command" field for each app
# Default to something safe
CMD ["npm", "run", "start"]
