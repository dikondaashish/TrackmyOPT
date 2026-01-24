# TrackMyOPT (Monorepo) 🎓🚀

**TrackMyOPT** is an all-in-one platform for international students on F-1 OPT and H-1B visas. It helps users track critical immigration deadlines, manage job applications, and monitor their status.

This repository is a **Monorepo** managed by `pnpm workspaces`, containing the Frontend, Backend, and Browser Extension in a single unified codebase.

---

## 📂 Project Structure

The project is organized into `apps` (applications) and root-level configuration.

### **1. Applications (`apps/`)**

| Path | Type | Tech Stack | Description |
| :--- | :--- | :--- | :--- |
| **`apps/web`** | **Frontend** | **Next.js 14**, TailwindCSS, TypeScript | The main user dashboard. Handles UI, auth, and light logic. Deployed to Vercel. |
| **`apps/api`** | **Backend** | **NestJS**, BullMQ, Redis | The heavy lifting engine. Handles OCR processing, USCIS status checks, and background jobs. Deployed to Render. |
| **`apps/extension`** | **Extension** | **React**, Vite (Chrome API) | The browser extension that injects tools into job portals and immigration sites. |

### **2. Root Configuration (Do Not Delete)**

These files are essential for orchestrating the monorepo.

| File | Purpose |
| :--- | :--- |
| **`pnpm-workspace.yaml`** | **CRITICAL**. Defines the workspace structure. Tells pnpm to manage `apps/*`. |
| **`package.json`** | **Root Config**. Contains scripts to build/test all apps simultaneously. |
| **`render.yaml`** | **Deployment**. Blueprint for Render.com to deploy the Backend + Redis. |
| **`docker-compose.yml`** | **Infrastructure**. Runs a local Redis instance for development (required for Queues). |
| **`node_modules`** | **Shared Libs**. Stores dependencies for all apps to save space and speed up installs. |

---

## 🚀 Getting Started

Follow these steps to run the full stack locally.

### Prerequisites
- Node.js 18+
- pnpm (`npm install -g pnpm`)
- Docker (for Redis)

### 1. Install Dependencies
Run this in the root folder:
```bash
pnpm install
```

### 2. Start Infrastructure (Redis)
Start the local Redis server (needed for OCR and USCIS queues):
```bash
docker-compose up -d
```

### 3. Start Applications
You can run them in separate terminals:

**Terminal 1: Backend (`apps/api`)**
```bash
pnpm --filter api start:dev
# running at http://localhost:3000
```

**Terminal 2: Frontend (`apps/web`)**
```bash
pnpm --filter web dev
# running at http://localhost:3001
```

---

## 🛠️ Deployment Guide

### **Backend (Render.com)**
1. Connect this repository to Render.
2. Select **"Blueprints"** -> **"New Blueprint Instance"**.
3. Render will auto-detect `render.yaml`.
4. It will deploy:
   - `trackmyopt-api` (Web Service)
   - `trackmyopt-queue` (Redis)
5. **Environment Variables**: Add your AWS and Database secrets in the Render Dashboard.

### **Frontend (Vercel)**
1. Import this repository to Vercel.
2. **Root Directory**: Select `apps/web`. (Important!)
3. **Build Command**: `pnpm build`
4. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: Set this to your Render Backend URL (e.g., `https://trackmyopt-api.onrender.com`).

---

## 🧩 Key Features & Implementation

### **USCIS Status Checker**
- **Old Way**: Frontend Cron loop (Timeouts).
- **New Way**: Backend Queue.
  - Frontend triggers batch job via `apps/web/app/api/cron`.
  - Backend (`apps/api/src/uscis`) queues jobs in Redis.
  - Worker processes checks one-by-one safely.

### **Resume OCR**
- **Architecture**:
  - Frontend sends file to Backend `POST /ocr/queue`.
  - Backend uploads to S3 -> Triggers Textract -> Polls for result.
  - No timeouts, handles large files gracefully.

---

## � Maintenance
- **Clean**: `pnpm -r clean` (removes build artifacts)
- **Lint**: `pnpm -r lint` (checks code quality)
