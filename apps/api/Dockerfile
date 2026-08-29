# Dockerfile for NestJS API (Production)
FROM node:20-alpine

WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/

# Use the exact package manager declared by the workspace. Installing the
# moving `latest` pnpm release breaks frozen installs once pnpm validates the
# package-manager identity recorded in package.json.
RUN corepack enable && corepack prepare pnpm@10.18.2 --activate
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# The authorized ATS worker invokes the pinned MIT-licensed ats-scrapers
# adapter through a small Python bridge. It is never included in the browser.
RUN apk add --no-cache python3 py3-pip git
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# Build API
RUN pnpm --filter api build

# Switch to api directory and run
WORKDIR /app/apps/api
EXPOSE 3000
CMD ["node", "dist/main"]
