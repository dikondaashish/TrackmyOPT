import assert from 'node:assert/strict';
import { isJobFitLimitResponse, normalizeJobFitAnalysis } from '../src/job-fit';

assert.deepEqual(
  normalizeJobFitAnalysis({
    matchScore: 81.6,
    foundKeywords: ['TypeScript', 'React', 'React', '  '],
    missingKeywords: ['AWS', 'Kubernetes', 'AWS'],
    gapAnalysis: 'Add cloud deployment evidence.',
  }),
  {
    matchScore: 82,
    matchedKeywords: ['TypeScript', 'React'],
    missingKeywords: ['AWS', 'Kubernetes'],
    gapSummary: 'Add cloud deployment evidence.',
  },
);

assert.equal(isJobFitLimitResponse(402, 'ats_scan_limit_reached'), true);
assert.equal(isJobFitLimitResponse(429), true);
assert.equal(isJobFitLimitResponse(500, 'ats_scan_limit_reached'), true);
assert.equal(isJobFitLimitResponse(200), false);

console.log('job-fit: response normalization and quota detection passed');
