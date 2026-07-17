import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ACTIVE_GENERATED_RESUME_ARTIFACT_SESSION_KEY,
  MAX_SESSION_ARTIFACT_BYTES,
  replaceActiveGeneratedResumeArtifact,
} from '../src/active-resume-artifact-store';
import type { GeneratedResumeArtifactV1 } from '../src/resume-autofill-contract';

function artifact(id: string, pdfBase64 = 'JVBERi0xLjQK'): GeneratedResumeArtifactV1 {
  return {
    schemaVersion: 1,
    artifactId: id,
    sourceResumeId: 'resume-a',
    sourceResumeFilename: 'resume-a.pdf',
    templateId: 'classic',
    job: {
      jobKey: 'workday:job-a',
      companyName: 'Company A',
      roleTitle: 'Engineer',
      sourceUrl: 'https://company-a.wd5.myworkdayjobs.com/job-a',
    },
    generatedAt: '2026-07-17T12:00:00.000Z',
    expiresAt: '2026-07-17T12:30:00.000Z',
    generatedContentHash: 'a'.repeat(64),
    pdf: {
      filename: 'resume-a.pdf',
      base64: pdfBase64,
      sha256: 'b'.repeat(64),
    },
    snapshot: {
      contact: {},
      skills: [],
      experience: [],
      education: [],
      certifications: [],
    },
  };
}

test('session store keeps one bounded artifact and never writes chrome.storage.sync', async () => {
  const originalChrome = globalThis.chrome;
  const sessionValues: Record<string, unknown> = {};
  let syncWrites = 0;
  globalThis.chrome = {
    storage: {
      session: {
        async set(values: Record<string, unknown>) {
          Object.assign(sessionValues, structuredClone(values));
        },
        async get(key: string) {
          return { [key]: sessionValues[key] };
        },
        async remove(key: string) {
          delete sessionValues[key];
        },
      },
      sync: {
        async set() {
          syncWrites += 1;
        },
      },
    },
  } as unknown as typeof chrome;

  try {
    assert.equal((await replaceActiveGeneratedResumeArtifact(artifact('first'))).ok, true);
    assert.equal((await replaceActiveGeneratedResumeArtifact(artifact('second'))).ok, true);
    assert.deepEqual(Object.keys(sessionValues), [
      ACTIVE_GENERATED_RESUME_ARTIFACT_SESSION_KEY,
    ]);
    assert.equal(
      (sessionValues[ACTIVE_GENERATED_RESUME_ARTIFACT_SESSION_KEY] as GeneratedResumeArtifactV1).artifactId,
      'second',
    );
    assert.equal(syncWrites, 0);

    const oversized = artifact('oversized', 'A'.repeat(MAX_SESSION_ARTIFACT_BYTES));
    const result = await replaceActiveGeneratedResumeArtifact(oversized);
    assert.deepEqual(result.reason, 'oversized');
    assert.equal(sessionValues[ACTIVE_GENERATED_RESUME_ARTIFACT_SESSION_KEY], undefined);
    assert.equal(syncWrites, 0);
  } finally {
    globalThis.chrome = originalChrome;
  }
});
