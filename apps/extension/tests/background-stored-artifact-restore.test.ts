import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import test from 'node:test';
import vm from 'node:vm';

/**
 * A tailored resume must outlive the browser session that produced it.
 *
 * The session store holds one artifact for 30 minutes and is cleared on
 * restart, so "generate now, apply later" produced no attachment at all. The
 * background worker now falls back to per-job server storage. This test drives
 * the real background bundle to prove the fallback works, and — just as
 * important — that restoring a stored resume stays silent: the ready broadcast
 * makes the page handler run a prefill, so firing it here would auto-fill an
 * application the user never asked to fill.
 */

const LISTING_URL = 'https://jobs.lever.co/acme/9f2b1c3d-1111-2222-3333-444455556666';
const APPLY_URL = `${LISTING_URL}/apply`;
const OTHER_JOB_URL = 'https://jobs.lever.co/acme/00000000-0000-0000-0000-000000000000';
const ACTIVE_ARTIFACT_SESSION_KEY = 'tmo_active_generated_resume_artifact_v1';

type MessageListener = (
  message: Record<string, unknown>,
  sender: { tab?: { id?: number }; documentId?: string },
  sendResponse: (response: unknown) => void,
) => boolean | void;

function makeStorageArea(values: Record<string, unknown>) {
  return {
    async get(keys: unknown = null) {
      if (keys === null) return { ...values };
      if (typeof keys === 'string') return { [keys]: values[keys] };
      if (Array.isArray(keys)) {
        return Object.fromEntries(keys.map((key) => [key, values[key as string]]));
      }
      return Object.fromEntries(
        Object.entries(keys as Record<string, unknown>).map(([key, fallback]) => [
          key,
          values[key] === undefined ? fallback : values[key],
        ]),
      );
    },
    async set(next: Record<string, unknown>) {
      Object.assign(values, structuredClone(next));
    },
    async remove(keys: string | string[]) {
      for (const key of Array.isArray(keys) ? keys : [keys]) delete values[key];
    },
    async clear() {
      for (const key of Object.keys(values)) delete values[key];
    },
  };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

interface ServerState {
  /** What GET /api/extension/resume-artifact hands back, keyed by nothing —
   *  the fake stands in for the route's own matching. */
  storedArtifact: unknown;
  /** Set when the fake server is asked to return an artifact for a job. */
  artifactLookups: string[];
  /** Set when the worker writes an artifact back to storage. */
  artifactWrites: number;
}

function makeFetch(server: ServerState) {
  return function fakeFetch(input: string | URL | Request, init?: RequestInit): Promise<Response> {
    const url = String(input);
    const method = (init?.method || 'GET').toUpperCase();

    if (url.includes('/api/extension/resume-artifact')) {
      if (method === 'POST') {
        server.artifactWrites += 1;
        return Promise.resolve(jsonResponse({ ok: true, stored: true }));
      }
      const jobUrl = new URL(url).searchParams.get('jobUrl') || '';
      server.artifactLookups.push(jobUrl);
      return Promise.resolve(jsonResponse({ ok: true, artifact: server.storedArtifact }));
    }
    if (url.includes('/api/resume-generator/base-resume')) {
      return Promise.resolve(jsonResponse({ content: 'Base resume fixture', filename: 'base.pdf' }));
    }
    if (url.endsWith('/api/resume-generator/generate')) {
      return Promise.resolve(jsonResponse({ latex: '\\begin{document}Fixture\\end{document}' }));
    }
    if (url.endsWith('/api/resume-generator/compile')) {
      return Promise.resolve(new Response(new TextEncoder().encode('%PDF-1.4\nfixture')));
    }
    if (url.endsWith('/api/resume-generator/autofill-snapshot')) {
      return Promise.resolve(jsonResponse({ structuredFieldsAvailable: false }));
    }
    if (url.endsWith('/api/resume-generator/scan')) {
      return Promise.resolve(jsonResponse({ score: 88 }));
    }
    if (url.endsWith('/api/resume-generator/extension-handoff')) {
      return Promise.resolve(jsonResponse({ handoffId: 'handoff-1' }));
    }
    if (url.endsWith('/api/me')) {
      return Promise.resolve(jsonResponse({
        user: { email: 'profile@example.com', user_metadata: {} },
        profile: { first_name: 'Profile', last_name: 'Person', email: 'profile@example.com' },
        applicationProfile: {},
      }));
    }
    throw new Error(`Unexpected fetch in stored-artifact test: ${method} ${url}`);
  };
}

function createWorker(input: {
  bundle: string;
  sessionValues: Record<string, unknown>;
  server: ServerState;
  tabMessages: Array<Record<string, unknown>>;
}) {
  let messageListener: MessageListener | undefined;
  const event = { addListener() {}, removeListener() {} };
  const jwtPayload = Buffer.from(JSON.stringify({ exp: 4_102_444_800 })).toString('base64url');

  const chrome = {
    runtime: {
      onInstalled: event,
      onMessage: {
        addListener(listener: MessageListener) {
          messageListener = listener;
        },
      },
      onMessageExternal: event,
      onConnect: event,
      setUninstallURL() {},
      getManifest: () => ({ version: '0.2.0' }),
      getURL: (path: string) => `chrome-extension://test/${path}`,
      lastError: undefined,
    },
    windows: { WINDOW_ID_NONE: -1, onFocusChanged: event },
    tabs: {
      query: async () => [{ id: 7 }],
      sendMessage: async (_tabId: number, message: Record<string, unknown>) => {
        input.tabMessages.push(message);
        return undefined;
      },
      create: async () => ({ id: 1 }),
      onUpdated: event,
    },
    notifications: { create() {} },
    scripting: { executeScript: async () => undefined },
    storage: {
      session: makeStorageArea(input.sessionValues),
      local: makeStorageArea({
        idToken: `header.${jwtPayload}.signature`,
        idTokenIssuedAt: Date.now(),
        idTokenUserId: 'user-a',
      }),
      sync: makeStorageArea({ signedIn: true }),
    },
  };

  vm.runInNewContext(input.bundle, {
    chrome,
    console: { log() {}, info() {}, warn() {}, error() {} },
    crypto: webcrypto,
    fetch: makeFetch(input.server),
    URL,
    Request,
    Response,
    Headers,
    TextEncoder,
    TextDecoder,
    Uint8Array,
    ArrayBuffer,
    Date,
    Math,
    JSON,
    Promise,
    setTimeout,
    clearTimeout,
    atob: (value: string) => Buffer.from(value, 'base64').toString('binary'),
    btoa: (value: string) => Buffer.from(value, 'binary').toString('base64'),
  });

  assert.ok(messageListener, 'background worker registered its message listener');
  return {
    dispatch(message: Record<string, unknown>): Promise<any> {
      return new Promise((resolve, reject) => {
        let settled = false;
        const timeout = setTimeout(() => {
          if (!settled) reject(new Error(`Background message timed out: ${message.type}`));
        }, 5_000);
        const sendResponse = (response: unknown) => {
          settled = true;
          clearTimeout(timeout);
          resolve(response);
        };
        const asynchronous = messageListener!(
          message,
          { tab: { id: 7 }, documentId: 'doc-1' },
          sendResponse,
        );
        if (asynchronous !== true && !settled) {
          clearTimeout(timeout);
          reject(new Error(`Background message was not handled: ${message.type}`));
        }
      });
    },
  };
}

async function buildBackgroundBundle(): Promise<string> {
  const runtimeRequire = eval('require') as NodeRequire;
  const esbuild = runtimeRequire('esbuild') as typeof import('esbuild');
  const build = await esbuild.build({
    entryPoints: ['src/background.ts'],
    bundle: true,
    write: false,
    platform: 'browser',
    format: 'iife',
    target: 'es2020',
    logLevel: 'silent',
    define: {
      'process.env.NODE_ENV': JSON.stringify('test'),
      'process.env.EXT_TARGET': JSON.stringify(''),
    },
  });
  return build.outputFiles[0].text;
}

test('a generated resume is written to per-job server storage', async () => {
  const bundle = await buildBackgroundBundle();
  const server: ServerState = { storedArtifact: null, artifactLookups: [], artifactWrites: 0 };
  const worker = createWorker({ bundle, sessionValues: {}, server, tabMessages: [] });

  const generated = await worker.dispatch({
    type: 'GENERATE_RESUME',
    jobDescription: 'Lever job description fixture',
    resumeId: 'resume-1',
    templateId: 'classic',
    companyName: 'Acme',
    roleTitle: 'Software Engineer',
    jobUrl: LISTING_URL,
    jobKey: `${LISTING_URL}|Acme|Software Engineer`,
    outputFilename: 'TrackMyOPT-resume-acme.pdf',
  });

  assert.equal(generated.ok, true);
  assert.equal(server.artifactWrites, 1, 'generation must persist the artifact for later');
});

test('a stored resume is restored on the apply page after the session is gone', async () => {
  const bundle = await buildBackgroundBundle();

  // Produce a genuinely valid artifact through the real pipeline.
  const seedServer: ServerState = { storedArtifact: null, artifactLookups: [], artifactWrites: 0 };
  const seedWorker = createWorker({
    bundle,
    sessionValues: {},
    server: seedServer,
    tabMessages: [],
  });
  const generated = await seedWorker.dispatch({
    type: 'GENERATE_RESUME',
    jobDescription: 'Lever job description fixture',
    resumeId: 'resume-1',
    templateId: 'classic',
    companyName: 'Acme',
    roleTitle: 'Software Engineer',
    jobUrl: LISTING_URL,
    jobKey: `${LISTING_URL}|Acme|Software Engineer`,
    outputFilename: 'TrackMyOPT-resume-acme.pdf',
  });
  assert.equal(generated.ok, true);

  // A brand-new worker with empty session storage — the browser was restarted,
  // or the 30-minute window elapsed. Only the server still has the resume.
  const now = new Date();
  const stored = {
    ...generated.artifact,
    generatedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 30 * 60_000).toISOString(),
  };
  const server: ServerState = {
    storedArtifact: stored,
    artifactLookups: [],
    artifactWrites: 0,
  };
  const tabMessages: Array<Record<string, unknown>> = [];
  const sessionValues: Record<string, unknown> = {};
  const worker = createWorker({ bundle, sessionValues, server, tabMessages });

  const resolved = await worker.dispatch({
    type: 'RESOLVE_V1_PREFILL_PAYLOAD',
    request: {
      now: new Date(now.getTime() + 60_000).toISOString(),
      jobContext: { jobUrl: APPLY_URL, companyName: 'Acme', roleTitle: 'Software Engineer' },
    },
  });

  assert.equal(resolved.ok, true);
  assert.equal(
    resolved.source,
    'generated_resume',
    'the apply page must receive the resume tailored for this posting',
  );
  assert.equal(resolved.resume.pdfBase64, generated.artifact.pdf.base64);
  assert.deepEqual(server.artifactLookups, [APPLY_URL]);

  // Adopted into the session store so the next Prefill on this tab is instant.
  assert.ok(sessionValues[ACTIVE_ARTIFACT_SESSION_KEY]);

  // Restoring is not generating: no write-back, and no ready broadcast (the
  // page handler responds to that message by running a prefill).
  assert.equal(server.artifactWrites, 0, 'a restored artifact must not be re-uploaded');
  assert.equal(
    tabMessages.filter((message) => message.type === 'GENERATED_RESUME_ARTIFACT_READY').length,
    0,
    'restoring a stored resume must not auto-trigger a prefill',
  );
});

test('a stored resume for a different posting is refused even if the server offers it', async () => {
  const bundle = await buildBackgroundBundle();
  const seedServer: ServerState = { storedArtifact: null, artifactLookups: [], artifactWrites: 0 };
  const seedWorker = createWorker({
    bundle,
    sessionValues: {},
    server: seedServer,
    tabMessages: [],
  });
  const generated = await seedWorker.dispatch({
    type: 'GENERATE_RESUME',
    jobDescription: 'Lever job description fixture',
    resumeId: 'resume-1',
    templateId: 'classic',
    companyName: 'Acme',
    roleTitle: 'Software Engineer',
    jobUrl: LISTING_URL,
    jobKey: `${LISTING_URL}|Acme|Software Engineer`,
    outputFilename: 'TrackMyOPT-resume-acme.pdf',
  });

  const now = new Date();
  const server: ServerState = {
    storedArtifact: {
      ...generated.artifact,
      generatedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 30 * 60_000).toISOString(),
    },
    artifactLookups: [],
    artifactWrites: 0,
  };
  const worker = createWorker({ bundle, sessionValues: {}, server, tabMessages: [] });

  // The extension re-validates whatever storage returns. A wrong resume must
  // never be attached, even if the server's own matching were to regress.
  const resolved = await worker.dispatch({
    type: 'RESOLVE_V1_PREFILL_PAYLOAD',
    request: {
      now: new Date(now.getTime() + 60_000).toISOString(),
      jobContext: { jobUrl: OTHER_JOB_URL, companyName: 'Acme', roleTitle: 'Software Engineer' },
    },
  });

  assert.equal(resolved.ok, true);
  assert.equal(resolved.source, 'profile_only');
});
