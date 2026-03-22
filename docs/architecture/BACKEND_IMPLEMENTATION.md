# TrackMyOPT Backend Implementation Master Plan
**Target Scale:** 20,000+ Active Users
**Recommended Stack:** TypeScript Monorepo (Next.js + NestJS)

## 1. High-Level Technology Selection

For a team already building in Next.js (TypeScript), **NestJS** is the industry-standard choice for the backend.

### Why NestJS?
*   **Language Synergy**: Share types (`User`, `Resume`, `Job`) between Frontend and Backend. No more "out of sync" API errors.
*   **Structure**: Enforces a clean architecture (Controllers, Services, Modules) similar to Angular/Java Spring, which prevents the "spaghetti code" common in Express.js.
*   **Scalability**: Native support for Microservices, Queues (BullMQ), and WebSockets.

### The Stack
*   **Backend Framework**: **NestJS** (Node.js)
*   **API Protocol**: REST (standard) or TRPC (best for Type Safety)
*   **Database**: **Supabase** (PostgreSQL) + **Prisma ORM** (for Type-safe DB access).
*   **Queue System**: **BullMQ** on **Redis** (for OCR, Emails, Scraping).
*   **Containerization**: **Docker** (for consistent deployment).

---

## 2. Infrastructure Architecture (The "How-To")

We will convert your project into a **Monorepo** (using Turborepo or just Yarn/PNPM workspaces).

```text
trackmyopt/
├── apps/
│   ├── web/           (Your existing Next.js app)
│   └── api/           (NEW: NestJS Backend & Worker)
├── packages/
│   ├── database/      (Shared Prisma schema)
│   └── types/         (Shared TS interfaces)
└── docker-compose.yml (Local development setup)
```

---

## 3. Detailed Implementation Steps

### Step 1: Initialize the Backend
Run these commands to scaffold the NestJS application:
```bash
# Install NestCLI globally
npm i -g @nestjs/cli

# Create the new api app
nest new apps/api
```

### Step 2: Configure the Job Queue (The "Secret Sauce")
This is what solves your timeout issues. We use `BullMQ`.

**File: `apps/api/src/ocr/ocr.processor.ts`**
```typescript
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('ocr')
export class OcrProcessor {
  @Process('parse-pdf')
  async handlePdfParsing(job: Job) {
    const { s3Key } = job.data;
    
    // 1. Download from S3
    // 2. Run AWS Textract (Takes 30s? No problem!)
    // 3. Save result to Supabase
    // 4. Update Job Progress
    await job.progress(100);
    return { text: 'Extracted text...' };
  }
}
```

### Step 3: Conneting Frontend to Backend
In your Next.js app, instead of doing the work, you **dispatch** the work.

**File: `apps/web/app/api/upload/route.ts`**
```typescript
// Old Way (Bad): await textractService.parse(file) -> TIMEOUT ERROR
// New Way (Good):
await fetch('https://api.trackmyopt.com/ocr/queue', {
  method: 'POST',
  body: JSON.stringify({ s3Key: uploadedKey })
});

return NextResponse.json({ status: 'queued', jobId: 123 });
```

### Step 4: Infrastructure Setup (Docker)
You need a `docker-compose.yml` to run Redis locally for development.

```yaml
version: '3.8'
services:
  redis:
    image: redis:alpine
    ports:
      - '6379:6379'
  
  api:
    build: ./apps/api
    ports:
      - '3001:3000'
    environment:
      - REDIS_HOST=redis
```

---

## 4. Why this handles 20k Users
1.  **Non-Blocking**: The user interface never freezes. Uploads match "instant" expectations because the heavy work happens in the background.
2.  **Horizontal Scaling**: If resumes pile up, you can simply spin up more **Worker Containers** (e.g., 5 containers processing OCR). The Queue distributes work automatically.
3.  **Connection Pooling**: NestJS + Prisma manages database connections much better than serverless functions, preventing "Too many connections" errors from Supabase.

---

## 5. Migration Strategy
You don't need to rewrite everything today.
1.  **Keep Next.js** as it is for now.
2.  **Spin up the NestJS app** just for the "Resume Generator" feature.
3.  Route only `/api/resume/**` traffic to the new backend.
4.  Gradually move other heavy logic (Emails, Cron Jobs) to NestJS.
