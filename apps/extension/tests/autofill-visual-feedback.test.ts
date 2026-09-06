import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  autofillStaggerDelay,
  autofillVisualStatus,
} from '../src/autofill-visual-feedback';

assert.equal(autofillStaggerDelay(0, false), 0);
assert.equal(autofillStaggerDelay(5, false), 300);
assert.equal(
  autofillStaggerDelay(50, false),
  720,
  'long forms cap the visual delay instead of slowing the actual fill'
);
assert.equal(
  autofillStaggerDelay(5, true),
  0,
  'reduced-motion users never receive staggered motion'
);

assert.equal(
  autofillVisualStatus({
    state: 'filling',
    filled: 3,
    needsUser: 0,
    group: 'experience',
  }),
  'Filling work experience · 3 ready'
);
assert.equal(
  autofillVisualStatus({
    state: 'complete',
    filled: 12,
    needsUser: 0,
  }),
  '12 fields ready for your review'
);
assert.equal(
  autofillVisualStatus({
    state: 'needs_user',
    filled: 12,
    needsUser: 2,
  }),
  '12 filled · 2 need your review'
);
assert.equal(
  autofillVisualStatus({
    state: 'complete',
    filled: 0,
    needsUser: 0,
  }),
  'No empty supported fields found'
);

const source = readFileSync('src/autofill-visual-feedback.ts', 'utf8');
assert.match(source, /prefers-reduced-motion:\s*reduce/);
assert.match(source, /role',\s*'status'/);
assert.match(source, /aria-live',\s*'polite'/);
assert.match(source, /data-tmo-autofill-visual/);
assert.match(source, /attachShadow/);
assert.doesNotMatch(source, /innerHTML|textContent\s*=\s*.*value/);

const engine = readFileSync('src/easy-apply-engine.ts', 'utf8');
const engineForm = readFileSync('src/easy-apply-form.ts', 'utf8');
assert.match(engine, /createAutofillVisualFeedback/);
assert.match(engine, /visual\.markFieldFilled/);
assert.match(engineForm, /visual\?\.markNeedsUser/);

const sensitive = readFileSync('src/sensitive-autofill.ts', 'utf8');
assert.match(sensitive, /flashAutofillField/);

const screening = readFileSync('src/screening-question-drafts.ts', 'utf8');
assert.match(screening, /flashAutofillField/);

const trackerWidget = readFileSync('src/job-portal-tracker-widget.ts', 'utf8');
assert.match(trackerWidget, /tmo-prefill-chip-pulse/);
assert.match(trackerWidget, /prefillBtn\.setAttribute\('aria-busy', 'true'\)/);
assert.match(trackerWidget, /prefillBtn\.classList\.add\('tmo-is-filling'\)/);
assert.match(trackerWidget, /prefillBtn\.classList\.remove\('tmo-is-filling'\)/);

console.log(
  'autofill-visual-feedback: accessible progress, field states, and reduced motion passed'
);
