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

# The authorized ATS worker invokes the pinned, public-API ATS adapter through
# a small Python bridge. Keep this list separate from root browser tooling:
# this image never runs a browser worker or Playwright.
RUN apk add --no-cache python3 py3-pip git \
  texlive \
  texmf-dist-latexextra \
  texmf-dist-fontsrecommended
# Cache system/Python dependencies separately from application source changes.
COPY apps/api/requirements.job-board.txt apps/api/
RUN pip3 install --no-cache-dir --break-system-packages --retries 5 --timeout 30 -r apps/api/requirements.job-board.txt

# Copy source code after dependency installation.
COPY . .

# Build API
RUN pnpm --filter api build

# Switch to api directory and run
WORKDIR /app/apps/api
EXPOSE 3000
CMD ["node", "dist/src/main.js"]
