import assert from 'node:assert/strict';
import { candidateMatches } from '../src/sensitive-autofill';

assert.equal(candidateMatches('Yes, I am authorized to work', 'yes'), true);
assert.equal(candidateMatches('No, I require sponsorship', 'yes'), false);
assert.equal(candidateMatches('H-1B visa holder', 'h1b'), true);
assert.equal(candidateMatches('OPT employment authorization', 'opt'), true);
assert.equal(candidateMatches('Female', 'male'), false);
assert.equal(candidateMatches('Male', 'male'), true);
assert.equal(
  candidateMatches('I do not wish to disclose', 'prefer_not_to_answer'),
  true
);
assert.equal(
  candidateMatches('Not a protected veteran', 'protected_veteran'),
  false
);

console.log(
  'sensitive-dropdown-matching: visa, consent, gender, and EEO exact matches passed'
);
