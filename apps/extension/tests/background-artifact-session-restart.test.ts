import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import test from 'node:test';
import vm from 'node:vm';

const REAL_WORKDAY_LISTING_URL =
  'https://interpublic.wd5.myworkdayjobs.com/OMC/job/New-York-New-York-United-States-of-America/Analyst--Business-Analytics_12235-SL?jr_id=6a58623b68d16a30e2412e0f';
const REAL_WORKDAY_APPLY_URL =
  'https://interpublic.wd5.myworkdayjobs.com/en-US/OMC/job/New-York%2C-New-York%2C-United-States-of-America/Analyst--Business-Analytics_12235-SL/apply/autofillWithResume?jr_id=6a58623b68d16a30e2412e0f';
const LIVE_COMPANY = 'OMLUS Hearts and Science LLC';
const LIVE_ROLE = 'Analyst, Business Analytics';
const HASHED_JOB_KEY = `sha256:${'a'.repeat(64)}`;
const ACTIVE_ARTIFACT_SESSION_KEY = 'tmo_active_generated_resume_artifact_v1';

type MessageListener = (
  message: Record<string, unknown>,
  sender: { tab?: { id?: number }; documentId?: string },
  sendResponse: (response: unknown) => void,
) => boolean | void;

type StorageArea = {
  get(keys?: string | string[] | Record<string, unknown> | null): Promise<Record<string, unknown>>;
  set(values: Record<string, unknown>): Promise<void>;
  remove(keys: string | string[]): Promise<void>;
  clear(): Promise<void>;
};

function makeStorageArea(
  values: Record<string, unknown>,
  writes: Array<Record<string, unknown>> = [],
): StorageArea {
  return {
    async get(keys = null) {
      if (keys === null) return { ...values };
      if (typeof keys === 'string') return { [keys]: values[keys] };
      if (Array.isArray(keys)) {
        return Object.fromEntries(keys.map((key) => [key, values[key]]));
      }
      return Object.fromEntries(
        Object.entries(keys).map(([key, fallback]) => [
          key,
          values[key] === undefined ? fallback : values[key],
        ]),
      );
    },
    async set(next) {
      writes.push(structuredClone(next));
      Object.assign(values, structuredClone(next));
    },
    async remove(keys) {
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

function fakeFetch(input: string | URL | Request): Promise<Response> {
  const url = String(input);
  if (url.includes('/api/resume-generator/base-resume')) {
    return Promise.resolve(jsonResponse({
      content: 'Base resume fixture',
      filename: 'live-workday-resume.pdf',
    }));
  }
  if (url.endsWith('/api/resume-generator/generate')) {
    return Promise.resolve(jsonResponse({
      latex: '\\begin{document}Live Workday restart fixture\\end{document}',
    }));
  }
  if (url.endsWith('/api/resume-generator/compile')) {
    return Promise.resolve(new Response(new TextEncoder().encode('%PDF-1.4\nfixture')));
  }
  if (url.endsWith('/api/resume-generator/autofill-snapshot')) {
    return Promise.resolve(jsonResponse({ structuredFieldsAvailable: false }));
  }
  if (url.endsWith('/api/resume-generator/scan')) {
    return Promise.resolve(jsonResponse({ score: 92 }));
  }
  if (url.endsWith('/api/resume-generator/extension-handoff')) {
    return Promise.resolve(jsonResponse({ handoffId: 'handoff-live-workday' }));
  }
  if (url.endsWith('/api/me')) {
    return Promise.resolve(jsonResponse({
      user: { email: 'profile@example.com', user_metadata: {} },
      profile: {
        first_name: 'Profile',
        last_name: 'Person',
        email: 'profile@example.com',
      },
      applicationProfile: {},
    }));
  }
  throw new Error(`Unexpected fetch in background integration test: ${url}`);
}

function createWorkerHarness(input: {
  backgroundBundle: string;
  sessionValues: Record<string, unknown>;
  localValues: Record<string, unknown>;
  syncValues: Record<string, unknown>;
  sessionWrites: Array<Record<string, unknown>>;
  syncWrites: Array<Record<string, unknown>>;
}) {
  let messageListener: MessageListener | undefined;
  const event = { addListener() {}, removeListener() {} };
  const chrome = {
    runtime: {
      onInstalled: event,
      onMessage: {
        addListener(listener: MessageListener) {
          messageListener = listener;
        },
      },
      onMessageExternal: event,
      // Long-running agent runs connect over a port (see agent/run-protocol).
      onConnect: event,
      setUninstallURL() {},
      getManifest: () => ({ version: '0.1.11' }),
      getURL: (path: string) => `chrome-extension://test/${path}`,
      lastError: undefined,
    },
    windows: {
      WINDOW_ID_NONE: -1,
      onFocusChanged: event,
    },
    tabs: {
      query: async () => [],
      sendMessage: async () => undefined,
      create: async () => ({ id: 1 }),
      onUpdated: event,
    },
    notifications: { create() {} },
    scripting: { executeScript: async () => undefined },
    storage: {
      session: makeStorageArea(input.sessionValues, input.sessionWrites),
      local: makeStorageArea(input.localValues),
      sync: makeStorageArea(input.syncValues, input.syncWrites),
    },
  };

  vm.runInNewContext(input.backgroundBundle, {
    chrome,
    console: { log() {}, info() {}, warn() {}, error() {} },
    crypto: webcrypto,
    fetch: fakeFetch,
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
    async dispatch(message: Record<string, unknown>): Promise<any> {
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
        try {
          const asynchronous = messageListener!(
            message,
            { tab: { id: 42 }, documentId: crypto.randomUUID() },
            sendResponse,
          );
          if (asynchronous !== true && !settled) {
            clearTimeout(timeout);
            reject(new Error(`Background message was not handled: ${message.type}`));
          }
        } catch (error) {
          clearTimeout(timeout);
          reject(error);
        }
      });
    },
  };
}

test('Workday artifact survives a real background worker restart through session storage only', async () => {
  // Runtime-require esbuild so this test can execute two truly independent
  // background bundles instead of reusing the unit-test module cache.
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
  const backgroundBundle = build.outputFiles[0].text;
  const sessionValues: Record<string, unknown> = {};
  const sessionWrites: Array<Record<string, unknown>> = [];
  const syncWrites: Array<Record<string, unknown>> = [];
  const jwtPayload = Buffer.from(JSON.stringify({ exp: 4_102_444_800 })).toString('base64url');
  const localValues: Record<string, unknown> = {
    idToken: `header.${jwtPayload}.signature`,
    idTokenIssuedAt: Date.now(),
    idTokenUserId: 'user-a',
  };
  const syncValues: Record<string, unknown> = { signedIn: true };

  const firstWorker = createWorkerHarness({
    backgroundBundle,
    sessionValues,
    localValues,
    syncValues,
    sessionWrites,
    syncWrites,
  });
  const generated = await firstWorker.dispatch({
    type: 'GENERATE_RESUME',
    jobDescription: 'Live Workday job description',
    resumeId: 'resume-live-workday',
    templateId: 'classic',
    companyName: LIVE_COMPANY,
    roleTitle: LIVE_ROLE,
    jobUrl: REAL_WORKDAY_LISTING_URL,
    jobKey: HASHED_JOB_KEY,
    outputFilename: 'TrackMyOPT-resume-hearts-science.pdf',
    baselineScore: 42,
  });

  assert.equal(generated.ok, true);
  assert.equal(generated.artifact.job.jobKey.length, 71);
  assert.equal(
    generated.artifact.job.requisitionId,
    '6a58623b68d16a30e2412e0f',
  );

  // Destroy the first VM entirely and load a fresh background module. The two
  // workers share Chrome storage mocks, but no JavaScript module state.
  const restartedWorker = createWorkerHarness({
    backgroundBundle,
    sessionValues,
    localValues,
    syncValues,
    sessionWrites,
    syncWrites,
  });
  const resolved = await restartedWorker.dispatch({
    type: 'RESOLVE_V1_PREFILL_PAYLOAD',
    request: {
      now: new Date(Date.parse(generated.artifact.generatedAt) + 29 * 60_000 + 59_000).toISOString(),
      jobContext: {
        jobUrl: REAL_WORKDAY_APPLY_URL,
        companyName: LIVE_COMPANY,
        roleTitle: LIVE_ROLE,
      },
    },
  });

  assert.equal(resolved.ok, true);
  assert.equal(resolved.source, 'generated_resume');
  assert.equal(resolved.artifactId, generated.artifact.artifactId);
  assert.ok(sessionValues[ACTIVE_ARTIFACT_SESSION_KEY]);

  const syncPayload = JSON.stringify(syncWrites);
  assert.doesNotMatch(syncPayload, /snapshot|pdfBase64|generatedContentHash|artifactId/);
  assert.doesNotMatch(syncPayload, new RegExp(generated.pdfBase64));
  assert.ok(sessionWrites.some((write) => ACTIVE_ARTIFACT_SESSION_KEY in write));

  const persistedArtifact = structuredClone(
    sessionValues[ACTIVE_ARTIFACT_SESSION_KEY],
  ) as Record<string, any>;

  const mismatched = await restartedWorker.dispatch({
    type: 'RESOLVE_V1_PREFILL_PAYLOAD',
    request: {
      now: new Date(Date.parse(generated.artifact.generatedAt) + 60_000).toISOString(),
      jobContext: {
        // Different requisition — company-name drift alone must no longer wipe
        // a resume generated for this same posting.
        jobUrl: REAL_WORKDAY_APPLY_URL.replace(
          '6a58623b68d16a30e2412e0f',
          'different-requisition',
        ),
        companyName: LIVE_COMPANY,
        roleTitle: LIVE_ROLE,
      },
    },
  });
  assert.equal(mismatched.source, 'profile_only');
  assert.equal(mismatched.reason, 'job_changed');
  assert.equal(sessionValues[ACTIVE_ARTIFACT_SESSION_KEY], undefined);

  sessionValues[ACTIVE_ARTIFACT_SESSION_KEY] = structuredClone(persistedArtifact);
  const expiredWorker = createWorkerHarness({
    backgroundBundle,
    sessionValues,
    localValues,
    syncValues,
    sessionWrites,
    syncWrites,
  });
  const expired = await expiredWorker.dispatch({
    type: 'RESOLVE_V1_PREFILL_PAYLOAD',
    request: {
      now: generated.artifact.expiresAt,
      jobContext: {
        jobUrl: REAL_WORKDAY_APPLY_URL,
        companyName: LIVE_COMPANY,
        roleTitle: LIVE_ROLE,
      },
    },
  });
  assert.equal(expired.source, 'profile_only');
  assert.equal(expired.reason, 'expired');
  assert.equal(sessionValues[ACTIVE_ARTIFACT_SESSION_KEY], undefined);

  const invalidArtifact = structuredClone(persistedArtifact);
  invalidArtifact.pdf.sha256 = '0'.repeat(64);
  sessionValues[ACTIVE_ARTIFACT_SESSION_KEY] = invalidArtifact;
  const invalidWorker = createWorkerHarness({
    backgroundBundle,
    sessionValues,
    localValues,
    syncValues,
    sessionWrites,
    syncWrites,
  });
  const invalid = await invalidWorker.dispatch({
    type: 'RESOLVE_V1_PREFILL_PAYLOAD',
    request: {
      now: new Date(Date.parse(generated.artifact.generatedAt) + 60_000).toISOString(),
      jobContext: {
        jobUrl: REAL_WORKDAY_APPLY_URL,
        companyName: LIVE_COMPANY,
        roleTitle: LIVE_ROLE,
      },
    },
  });
  assert.equal(invalid.source, 'profile_only');
  assert.equal(invalid.reason, 'invalid');
  assert.equal(sessionValues[ACTIVE_ARTIFACT_SESSION_KEY], undefined);
});
