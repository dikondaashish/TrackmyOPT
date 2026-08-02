# Dockerfile for NestJS API (Production)
FROM node:20-alpine

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build API
RUN pnpm --filter api build

# Switch to api directory and run
WORKDIR /app/apps/api
EXPOSE 3000
CMD ["node", "dist/main"]
