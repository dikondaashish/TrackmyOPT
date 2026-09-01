import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getAlignJobTitlesPreference,
  setAlignJobTitlesPreference,
} from '../src/resume-generation-preferences';

test('align job titles preference defaults to false', async () => {
  const storage = new Map<string, unknown>();
  const chrome = {
    storage: {
      local: {
        async get(key: string) {
          return { [key]: storage.get(key) };
        },
        async set(values: Record<string, unknown>) {
          for (const [key, value] of Object.entries(values)) storage.set(key, value);
        },
      },
    },
  };
  (globalThis as { chrome?: typeof chrome }).chrome = chrome;

  assert.equal(await getAlignJobTitlesPreference(), false);
  await setAlignJobTitlesPreference(true);
  assert.equal(await getAlignJobTitlesPreference(), true);
});
