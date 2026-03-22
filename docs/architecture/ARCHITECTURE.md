# TrackMyOPT - Industry-Grade Architecture Proposal

## 1. Executive Summary
Currently, TrackMyOPT operates as a monolithic Next.js application where the frontend, API, and heavy background tasks (OCR, Scraping, Email) all run within Vercel's serverless environment. While simple to deploy, this architecture hits limits with:
*   **Timeouts**: Serverless functions fail on long-running tasks (e.g., parsing large PDFs, reliable scraping).
*   **Resource Limits**: Memory and bundle size restrictions prevent using powerful libraries (e.g., Puppeteer, heavy AI models).
*   **Reliability**: "Fire and forget" async tasks are unreliable without a persistent queue.

This document proposes a transition to a **Microservices-ready, Event-Driven Architecture**.

---

## 2. Proposed Architecture Overview

We will separate the **User Interface** from the **Heavy Processing** using a reliable **Queue System**.

### System Diagram
```mermaid
graph TD
    User[User Browser]
    
    subgraph "Frontend Layer (Vercel)"
        NextJS[Next.js App Router]
        API[Next.js API Routes (Lightweight)]
    end
    
    subgraph "Data Layer"
        DB[(Supabase PostgreSQL)]
        Redis[(Redis Cache & Queue)]
        S3[AWS S3 Storage]
    end
    
    subgraph "Worker Service (Railway/AWS ECS)"
        Worker[Node.js/Python Worker]
        OCR[OCR Processor]
        Scraper[Web Scraper]
        Email[Email Service]
    end

    User -->|HTTP| NextJS
    NextJS -->|Read/Write| DB
    NextJS -->|Uploads| S3
    
    %% Async Job Flow
    NextJS -->|1. Submit Job| Redis
    Redis -->|2. Consume Job| Worker
    Worker -->|3. Process CSS/PDF| OCR
    Worker -->|4. Update Status| DB
    Worker -->|5. Store Results| S3
    
    NextJS -.->|Poll Status| DB
```

---

## 3. Key Components

### A. Frontend (Next.js on Vercel)
*   **Role**: UI rendering, Authentication, Lightweight CRUD operations.
*   **Change**: NO heavy processing in API routes. Instead of `await processPDF()`, the API will now `await queue.add('process-pdf')` and return a `jobId` immediately.

### B. Message Queue (Redis + BullMQ)
*   **Role**: The "guarantor" of work.
*   **Why**: If a job fails, the queue retries it automatically. It prevents browser timeouts.
*   **Stack**: Upstash Redis (Serverless) or Self-hosted Redis.

### C. Worker Service (Dedicated Backend)
*   **Role**: The "muscle" of the operation. Runs in a container (Docker), not a lambda function.
*   **Technologies**:
    *   **Node.js (NestJS or Express)**: Excellent for maintaining shared code with frontend.
    *   **OR Python (FastAPI)**: Best if extensive AI/ML or specialized scraping is needed.
*   **Capabilities**:
    *   No 10-second timeouts (can run for minutes/hours).
    *   Can install Puppeteer/Playwright for full-browser scraping.
    *   Can cache large datasets in memory.

---

## 4. Implementation Roadmap

### Phase 1: Decouple Logic (Immediate)
Refactor existing heavy API routes into "Services" that are independent of NextRequest/NextResponse.
*   *Current*: logic mixed inside `app/api/route.ts`.
*   *Goal*: Logic in `lib/services/ResumeService.ts`, callable by CLI or API.

### Phase 2: Introduce Queue (Short Term)
1.  Set up a Redis instance (e.g., Upstash).
2.  Install `bullmq`.
3.  Create a "Producer" in Next.js API to add jobs.
4.  Create a simple "Consumer" script that listens to the queue.

### Phase 3: Deploy Worker (Medium Term)
Deploy the Consumer script as a Docker container on Railway, Render, or DigitalOcean.

---

## 5. Technology Selection

| Component | Recommendation | Alternatives |
| :--- | :--- | :--- |
| **Backend Framework** | **NestJS** (Structured, scalable Node.js) | Express, FastAPI (Python) |
| **Queue** | **BullMQ** (Robust, Redis-based) | SQS, Kafka |
| **Database** | **Supabase** (Existing, excellent) | AWS RDS |
| **Host** | **Railway / Render** (Easy scalability) | AWS ECS (Complex but powerful) |
| **Validation** | **Zod** (Existing) | - |

## 6. Immediate Workflow Change Example: Resume Upload

**Current Flow (Fragile):**
1. User uploads PDF.
2. Next.js API receives file -> Uploads to S3 -> Calls Textract -> Waits 10s -> Timeout/Error? -> Return.

**New Flow (Robust):**
1. User uploads PDF.
2. Next.js API uploads to S3 -> Adds `ocr_job` to Redis -> Returns `{ jobId: "123" }`. (Response time: < 1s).
3. **Worker** picks up `ocr_job`.
4. **Worker** calls Textract, polls internally, handles retries.
5. **Worker** saves text to Supabase `resumes` table.
6. Frontend polls/listens (Supabase Realtime) for update on job "123".
