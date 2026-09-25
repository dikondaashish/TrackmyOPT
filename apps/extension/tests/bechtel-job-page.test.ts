import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

test('Bechtel nested job pages receive the job assistant content script', () => {
  const manifest = JSON.parse(readFileSync('manifest.json', 'utf8')) as {
    content_scripts: Array<{ js: string[]; matches: string[] }>;
  };
  const assistant = manifest.content_scripts.find((script) =>
    script.js.includes('content-job-portal.js')
  );
  assert.ok(assistant);
  assert.ok(assistant.matches.includes('*://jobs.bechtel.com/us/en/job/*'));
});
