import assert from 'node:assert/strict';
import {
  CoverLetterReviewController,
  type CoverLetterGenerationResult,
} from '../src/cover-letter-review';
import type { GeneratedCoverLetterAttachment } from '../src/resume-autofill-contract';

function attachment(sourceContentHash: string): GeneratedCoverLetterAttachment {
  return {
    filename: 'cover-letter.pdf',
    base64: 'cGRm',
    sha256: 'a'.repeat(64),
    generatedAt: '2026-07-25T00:00:00.000Z',
    sourceContentHash,
  };
}

async function run(): Promise<void> {
  const calls: string[] = [];
  let finishRecompile: ((result: CoverLetterGenerationResult) => void) | undefined;
  const recompileResult = new Promise<CoverLetterGenerationResult>((resolve) => {
    finishRecompile = resolve;
  });
  const controller = new CoverLetterReviewController({
    generate: async () => ({
      ok: true,
      attachment: attachment('resume-hash'),
      draftText: 'Original draft',
    }),
    invalidateCurrent: () => calls.push('invalidate'),
    recompile: (editedText) => {
      calls.push(`recompile:${editedText}`);
      return recompileResult;
    },
  });

  await controller.generate();
  assert.equal(controller.state.phase, 'review');
  assert.equal(controller.state.attachment?.sourceContentHash, 'resume-hash');

  controller.beginEdit();
  const save = controller.saveEdit('  Edited draft  ');
  assert.deepEqual(
    calls,
    ['invalidate', 'recompile:Edited draft'],
    'the old attachment is invalidated before asynchronous recompilation begins',
  );
  assert.equal(controller.state.phase, 'recompiling');
  assert.equal(controller.state.attachment, undefined, 'stale attachment is unavailable in flight');

  finishRecompile?.({
    ok: true,
    attachment: attachment('resume-hash'),
    draftText: 'Edited draft',
  });
  await save;
  assert.equal(controller.state.phase, 'review');
  assert.equal(controller.state.draftText, 'Edited draft');
  assert.equal(controller.state.attachment?.sourceContentHash, 'resume-hash');

  console.log('cover-letter-review-ui: live controller invalidation and recompile flow passed');
}

void run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
