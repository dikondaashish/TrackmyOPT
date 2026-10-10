import { readFileSync, readdirSync } from 'node:fs';

/**
 * Source-text tests assert on patterns across a feature that is split into an
 * entry file plus sibling modules. Return the entry source followed by every
 * .ts file in the sibling folder so those assertions see the whole feature.
 */
export function readSplitSource(entryFile: string, moduleDir: string): string {
  const parts = [readFileSync(entryFile, 'utf8')];
  for (const name of readdirSync(moduleDir).filter((n) => n.endsWith('.ts')).sort()) {
    parts.push(readFileSync(`${moduleDir}/${name}`, 'utf8'));
  }
  return parts.join('\n');
}

export const readTrackerWidgetSource = (): string =>
  readSplitSource('src/job-portal/job-portal-tracker-widget.ts', 'src/job-portal/tracker-widget');

export const readContentPortalSource = (): string =>
  readSplitSource('src/content-job-portal.ts', 'src/job-portal/content-runtime');
