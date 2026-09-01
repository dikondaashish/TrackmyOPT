import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { after, before, test } from 'node:test';

import {
  schedulerRunId,
  triggerJobBoardIngestion,
} from './trigger-job-board-ingestion.mjs';

let baseUrl;
let server;
let healthAttempts = 0;
let ingestionRequests = 0;
let schedulerHeader;
let triggerOriginHeader;

before(async () => {
  server = createServer((request, response) => {
    if (request.method === 'GET' && request.url === '/') {
      healthAttempts += 1;
      response.writeHead(healthAttempts === 1 ? 503 : 200);
      response.end(healthAttempts === 1 ? 'starting' : 'ready');
      return;
    }

    if (
      request.method === 'POST' &&
      request.url === '/job-board/ingest-enabled-sources'
    ) {
      ingestionRequests += 1;
      assert.equal(request.headers['x-api-key'], 'test-secret');
      schedulerHeader = request.headers['x-scheduler-run-id'];
      triggerOriginHeader = request.headers['x-trigger-origin'];
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ status: 'queued', jobId: 'job-123' }));
      return;
    }

    response.writeHead(404);
    response.end();
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve()))
  );
});

test('waits for a sleeping API, then queues ingestion once', async () => {
  const result = await triggerJobBoardIngestion({
    apiUrl: baseUrl,
    apiKey: 'test-secret',
    allowHttp: true,
    healthAttempts: 3,
    retryDelayMs: 1,
    requestTimeoutMs: 1_000,
  });

  assert.deepEqual(result, { status: 'queued', jobId: 'job-123' });
  assert.equal(healthAttempts, 2);
  assert.equal(ingestionRequests, 1);
  assert.match(schedulerHeader, /^job-board-hour-\d{4}-\d{2}-\d{2}T\d{2}$/);
  assert.equal(triggerOriginHeader, 'github_actions');
});

test('uses one deterministic idempotency key for every wake-up in an hour', () => {
  assert.equal(
    schedulerRunId(new Date('2026-08-31T18:07:00.000Z')),
    'job-board-hour-2026-08-31T18'
  );
  assert.equal(
    schedulerRunId(new Date('2026-08-31T18:52:59.000Z')),
    'job-board-hour-2026-08-31T18'
  );
  assert.equal(
    schedulerRunId(new Date('2026-08-31T19:07:00.000Z')),
    'job-board-hour-2026-08-31T19'
  );
});

test('rejects a non-HTTPS production API URL', async () => {
  await assert.rejects(
    triggerJobBoardIngestion({
      apiUrl: 'http://api.example.com',
      apiKey: 'test-secret',
    }),
    /HTTPS/
  );
});

test('fails closed when the API key is missing', async () => {
  await assert.rejects(
    triggerJobBoardIngestion({
      apiUrl: 'https://api.example.com',
      apiKey: '',
    }),
    /API secret/
  );
});

test('keeps GitHub Actions as manual-dispatch-only fallback', async () => {
  const workflow = await readFile(
    new URL('../../.github/workflows/job-board-ingestion.yml', import.meta.url),
    'utf8'
  );

  assert.doesNotMatch(workflow, /schedule:/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /manual_run_id:/);
});
