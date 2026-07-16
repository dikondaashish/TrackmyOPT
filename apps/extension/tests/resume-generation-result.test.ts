import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildGeneratedResumeResult,
  type GeneratedResumeSuccessBase,
} from '../src/resume-generation-result';

const baseResult: GeneratedResumeSuccessBase = {
  pdfBase64: 'JVBERi0xLjQK',
  editorUrl: 'https://trackmyopt.com/editor/handoff',
  baselineScore: 61,
  generatedScore: 82,
};

test('snapshot extraction failure still returns the compiled PDF and disables structured fields', () => {
  const result = buildGeneratedResumeResult(baseResult, {
    structuredFieldsAvailable: false,
    generatedContentHash: 'a'.repeat(64),
    reason: 'invalid_snapshot',
  });

  assert.equal(result.ok, true);
  assert.equal(result.pdfBase64, baseResult.pdfBase64);
  assert.equal(result.structuredFieldsAvailable, false);
  assert.equal(result.snapshot, undefined);
  assert.equal(result.generatedContentHash, 'a'.repeat(64));
});

test('validated extraction returns the snapshot paired with the compiled PDF', () => {
  const snapshot = {
    contact: { email: 'ada@example.com' },
    skills: ['TypeScript'],
    experience: [],
    education: [],
    certifications: [],
  };
  const result = buildGeneratedResumeResult(baseResult, {
    structuredFieldsAvailable: true,
    generatedContentHash: 'b'.repeat(64),
    snapshot,
  });

  assert.equal(result.ok, true);
  assert.equal(result.structuredFieldsAvailable, true);
  assert.deepEqual(result.snapshot, snapshot);
});
