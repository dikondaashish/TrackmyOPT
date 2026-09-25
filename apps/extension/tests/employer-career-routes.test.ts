import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { isCareerPage } from '../src/career-sites';

const manifest = JSON.parse(readFileSync('manifest.json', 'utf8')) as {
  content_scripts: Array<{ js: string[]; matches: string[] }>;
};
const assistant = manifest.content_scripts.find((script) =>
  script.js.includes('content-job-portal.js')
);
assert.ok(assistant);

// Chrome uses * as a path glob and either * or *.domain for wildcard hosts.
function matchesUrl(pattern: string, rawUrl: string): boolean {
  const parts = pattern.match(/^([^:]+):\/\/([^/]+)(\/.*)$/);
  assert.ok(parts, `Invalid match pattern: ${pattern}`);
  const [, scheme, hostPattern, pathPattern] = parts;
  const url = new URL(rawUrl);
  if (scheme !== '*' && scheme !== url.protocol.slice(0, -1)) return false;
  if (scheme === '*' && !['http:', 'https:'].includes(url.protocol)) return false;
  const host = url.hostname.toLowerCase();
  const hostMatches = hostPattern === '*' || hostPattern === host ||
    (hostPattern.startsWith('*.') &&
      (host === hostPattern.slice(2) || host.endsWith(hostPattern.slice(1))));
  if (!hostMatches) return false;
  const pathRegex = new RegExp(`^${pathPattern.split('*').map((part) =>
    part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  ).join('.*')}$`);
  return pathRegex.test(url.pathname + url.search);
}

test('assistant loads on representative US employer job routes', () => {
  for (const url of [
    'https://jobs.bechtel.com/us/en/job/297563/PIIM-Data-Engineer',
    'https://careers.walmart.com/us/en/jobs/R-2634300',
    'https://jobs.apple.com/en-us/details/200669112/software-development-engineer',
    'https://www.amazon.jobs/en/jobs/10539152/software-development-engineer',
    'https://careers.homedepot.com/job/8848146/warehouse-associate-onsite/',
    'https://jpmc.fa.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1001/jobs',
    'https://www.example.com/us/en/requisition/12345',
    'https://www.example.com/global/en/application/12345',
  ]) {
    assert.ok(assistant.matches.some((pattern) => matchesUrl(pattern, url)),
      `No static content script match for ${url}`);
  }
});

test('unrelated product pages are outside static career routes', () => {
  for (const url of [
    'https://www.walmart.com/ip/product-123',
    'https://www.apple.com/iphone/',
    'https://www.example.com/us/en/about/',
  ]) {
    assert.equal(assistant.matches.some((pattern) => matchesUrl(pattern, url)), false,
      `Unexpected content script match for ${url}`);
  }
});

test('dedicated career hosts on blocked retail domains are recognized', () => {
  const previousWindow = (globalThis as any).window;
  const previousLocation = (globalThis as any).location;
  try {
    (globalThis as any).window = {};
    for (const url of [
      'https://careers.walmart.com/us/en/jobs/R-2634300',
      'https://jobs.amazon.com/en/jobs/10539152/software-development-engineer',
    ]) {
      (globalThis as any).location = new URL(url);
      assert.match(isCareerPage() || '', /^career-subdomain:/);
    }
    (globalThis as any).location = new URL('https://www.walmart.com/ip/product-123');
    assert.equal(isCareerPage(), null);
  } finally {
    (globalThis as any).window = previousWindow;
    (globalThis as any).location = previousLocation;
  }
});
