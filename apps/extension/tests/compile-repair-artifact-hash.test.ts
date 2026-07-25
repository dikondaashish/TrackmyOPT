import assert from 'node:assert/strict';
import test from 'node:test';

import { compileLatexWithSingleRepair } from '../src/compile-latex-with-repair';
import { buildGeneratedResumeArtifactV1 } from '../src/resume-artifact-lifecycle';

test('the repaired source drives snapshot acceptance and the artifact hash', async () => {
  const initialLatex = String.raw`\begin{document}Broken`;
  const repairedLatex = String.raw`\begin{document}Repaired\end{document}`;
  const compiledSources: string[] = [];

  const compiled = await compileLatexWithSingleRepair({
    initialLatex,
    compile: async (latex) => {
      compiledSources.push(latex);
      return latex === repairedLatex
        ? { pdf: new TextEncoder().encode('%PDF-1.4 repaired').buffer }
        : { error: 'Missing end document' };
    },
    repair: async (latex, error) => {
      assert.equal(latex, initialLatex);
      assert.equal(error, 'Missing end document');
      return repairedLatex;
    },
  });

  assert.equal(compiled.repaired, true);
  assert.equal(compiled.finalLatex, repairedLatex);
  assert.ok(compiled.pdf);
  assert.deepEqual(compiledSources, [initialLatex, repairedLatex]);

  const expectedHashBytes = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(repairedLatex)
  );
  const expectedHash = Array.from(new Uint8Array(expectedHashBytes), (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');

  const snapshot = {
    contact: { email: 'applicant@example.com' },
    skills: [],
    experience: [],
    education: [],
    certifications: [],
  };
  const built = await buildGeneratedResumeArtifactV1({
    artifactId: 'artifact-after-repair',
    generatedAt: '2026-07-25T12:00:00.000Z',
    sourceResumeId: 'resume-1',
    sourceResumeFilename: 'resume.pdf',
    templateId: 'professional',
    jobKey: 'example|role',
    jobContext: {
      jobUrl: 'https://example.test/jobs/1',
      companyName: 'Example',
      roleTitle: 'Official Role',
    },
    finalLatex: compiled.finalLatex,
    extractedContentHash: expectedHash,
    extractedSnapshot: snapshot,
    pdfBase64: 'JVBERi0xLjQK',
    pdfFilename: 'resume.pdf',
  });

  assert.equal(built.structuredFieldsAvailable, true);
  assert.equal(built.artifact.generatedContentHash, expectedHash);
  assert.deepEqual(built.artifact.snapshot, snapshot);

  const initialHashBytes = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(initialLatex)
  );
  const initialHash = Array.from(new Uint8Array(initialHashBytes), (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');
  assert.notEqual(built.artifact.generatedContentHash, initialHash);

  console.log(
    'compile-repair-artifact-hash: repaired source drives snapshot and artifact hash'
  );
});
