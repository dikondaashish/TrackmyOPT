import { readFileSync } from 'node:fs';
import * as path from 'node:path';

/**
 * apps/web shows job badges and scores resume matches with the same text
 * inference the API stores as filter flags. The two copies must stay
 * identical so a card never disagrees with the filter that returned it.
 */
describe('shared job-facts module', () => {
  it('is identical in apps/api and apps/web', () => {
    const api = readFileSync(path.join(__dirname, 'job-facts.ts'), 'utf8');
    const web = readFileSync(
      path.resolve(__dirname, '../../../web/lib/job-board/job-facts.ts'),
      'utf8',
    );
    expect(web).toBe(api);
  });
});

/**
 * apps/web filters loaded jobs and maps resume locations to places with the
 * same reading the API uses to hide non-US jobs and match places.
 */
describe('shared us-location module', () => {
  it('is identical in apps/api and apps/web', () => {
    const api = readFileSync(path.join(__dirname, 'us-location.ts'), 'utf8');
    const web = readFileSync(
      path.resolve(__dirname, '../../../web/lib/job-board/us-location.ts'),
      'utf8',
    );
    expect(web).toBe(api);
  });
});
