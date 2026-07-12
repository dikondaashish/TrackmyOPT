import assert from 'node:assert/strict';
import { chooseJobDescriptionCandidate } from '../src/job-description';

const outerPage = `
  Skip Branding Footer Accessibility Statement TrackMyOPT
  Generate custom resume Choose the resume and template
`.repeat(8);
const actualPosting = `
  Product Analyst I
  Overview
  Position Summary: Analyze product performance and identify opportunities.
  Responsibilities
  Build reports and dashboards using SQL and PowerBI.
  Qualifications
  Required 1+ years of analytical experience.
`.repeat(8);

assert.equal(
  chooseJobDescriptionCandidate([
    { source: 'outer', text: outerPage },
    { source: 'frame', text: actualPosting },
  ]),
  actualPosting.trim(),
  'job iframe content must beat outer page and extension UI text',
);

console.log('job-description: iframe source priority passed');

assert.equal(
  chooseJobDescriptionCandidate([{ source: 'frame', text: 'J'.repeat(20_000) }]).length,
  15_000,
  'preview must match the generator API payload limit',
);
