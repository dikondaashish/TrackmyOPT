import assert from 'node:assert/strict';
import {
  MAX_SKILLS_PREFILL_ITEMS,
  buildSkillsPrefillValue,
} from '../src/skills-prefill';

assert.equal(buildSkillsPrefillValue(['TypeScript', 'React'], false), '');
assert.equal(
  buildSkillsPrefillValue([' TypeScript ', 'React', 'typescript', '', 'Node.js'], true),
  'TypeScript, React, Node.js',
);

const oversized = Array.from({ length: MAX_SKILLS_PREFILL_ITEMS + 10 }, (_, index) => `Skill ${index}`);
const bounded = buildSkillsPrefillValue(oversized, true);
assert.equal(bounded.split(', ').length, MAX_SKILLS_PREFILL_ITEMS);
assert.ok(bounded.length <= 1_000);

console.log('skills-prefill: opt-in, normalization, dedupe, and bounds passed');
