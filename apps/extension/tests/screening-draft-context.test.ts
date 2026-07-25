import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveScreeningDraftJobContext } from '../src/screening-draft-context';

test('screening drafts prefer the description bound to the active resume artifact', () => {
  assert.deepEqual(
    resolveScreeningDraftJobContext({
      artifactJob: {
        companyName: 'Acme',
        roleTitle: 'Software Engineer',
        jobDescription:
          'Build reliable TypeScript services for enterprise customers.',
      },
      pageContext: {
        companyName: 'Wrong Company',
        roleTitle: 'Wrong Role',
        jobDescription: 'Generic application form text.',
      },
    }),
    {
      companyName: 'Acme',
      roleTitle: 'Software Engineer',
      jobDescription:
        'Build reliable TypeScript services for enterprise customers.',
    }
  );
});

test('older artifacts fall back to the current page description without changing artifact identity', () => {
  assert.deepEqual(
    resolveScreeningDraftJobContext({
      artifactJob: {
        companyName: 'Acme',
        roleTitle: 'Software Engineer',
      },
      pageContext: {
        companyName: 'Page Company',
        roleTitle: 'Page Role',
        jobDescription: 'Build accessible React interfaces.',
      },
    }),
    {
      companyName: 'Acme',
      roleTitle: 'Software Engineer',
      jobDescription: 'Build accessible React interfaces.',
    }
  );
});
