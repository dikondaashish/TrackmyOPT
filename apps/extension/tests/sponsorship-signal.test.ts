import assert from 'node:assert/strict';
import { classifySponsorship, type SponsorshipSignal } from '../src/sponsorship-signal';

// Filler that is itself sponsorship-neutral, used to push snippets past the
// 200-char minimum so the classifier engages (short text stays `unclear`).
const PAD =
  ' We are a fast-growing team building delightful products for our customers. ' +
  'You will collaborate across engineering, design, and product to ship features. ' +
  'This role is full-time and based in our office with hybrid flexibility. ';

function expect(label: string, jd: string, want: SponsorshipSignal) {
  const got = classifySponsorship(PAD + jd + PAD).signal;
  assert.equal(got, want, `[${label}] expected ${want}, got ${got} :: "${jd}"`);
}

// ---- no_sponsorship ----
expect('will-not-sponsor', 'We will not sponsor visas for this position.', 'no_sponsorship');
expect('unable-to-sponsor', 'We are unable to sponsor work visas at this time.', 'no_sponsorship');
expect('cannot-sponsor', 'Unfortunately we cannot sponsor candidates for this role.', 'no_sponsorship');
expect('does-not-offer', 'This company does not offer visa sponsorship.', 'no_sponsorship');
expect('no-visa-sponsorship', 'No visa sponsorship is available for this opening.', 'no_sponsorship');
expect('without-sponsorship', 'You must be able to work without sponsorship now or in the future.', 'no_sponsorship');
expect('not-considering', 'We are not considering candidates who require sponsorship.', 'no_sponsorship');
expect('us-citizens-only', 'This position is open to U.S. citizens only.', 'no_sponsorship');
expect('citizenship-required', 'US citizenship is required for this federal contract.', 'no_sponsorship');
expect('must-be-citizen', 'Applicants must be a US citizen to be considered.', 'no_sponsorship');
expect('gc-holders-only', 'Green card holders or permanent residents only.', 'no_sponsorship');
expect('clearance-required', 'An active security clearance is required for this role.', 'no_sponsorship');
// negation guard: a sponsors keyword inside a negative phrase must stay red
expect('no-h1b-sponsorship', 'Please note: no H-1B sponsorship is provided.', 'no_sponsorship');
expect('do-not-offer-h1b', 'We do not offer H-1B visa sponsorship for this position.', 'no_sponsorship');

// ---- sponsors ----
expect('sponsorship-available', 'Visa sponsorship is available for exceptional candidates.', 'sponsors');
expect('will-sponsor', 'We will sponsor the right candidate for an H-1B visa.', 'sponsors');
expect('happy-to-sponsor', 'We are happy to sponsor visas for strong applicants.', 'sponsors');
expect('h1b-transfer', 'We support H-1B transfer and green card processing.', 'sponsors');
expect('immigration-support', 'We provide immigration support and relocation assistance.', 'sponsors');
expect('opt-welcome', 'OPT and CPT candidates are welcome to apply.', 'sponsors');
expect('open-to-sponsoring', 'We are open to sponsoring qualified international candidates.', 'sponsors');
expect('visa-candidates-welcome', 'Visa candidates welcome — we assist with the process.', 'sponsors');

// ---- unclear ----
expect('authorized-not-exclusion', 'You must be authorized to work in the United States.', 'unclear');
expect('citizenship-not-required', 'U.S. citizenship is not required for this position.', 'unclear');
expect('no-citizenship-required', 'No U.S. citizenship is required to join this commercial team.', 'unclear');
expect('clearance-not-required', 'A security clearance is not required for this role.', 'unclear');
expect('no-clearance-required', 'No active security clearance is required to start.', 'unclear');
expect('does-not-require-clearance', 'This position does not require a security clearance.', 'unclear');
expect(
  'citizenship-negation-plus-sponsorship',
  'U.S. citizenship is not required, and visa sponsorship is available for qualified candidates.',
  'sponsors',
);
expect('generic', 'Strong communication skills and 3+ years of experience required.', 'unclear');
assert.equal(classifySponsorship('short jd').signal, 'unclear', 'sub-200-char text stays unclear');

// tooltip metadata is present for decided signals
const decided = classifySponsorship(PAD + 'We will not sponsor visas.' + PAD);
assert.ok(decided.matchedSentence && decided.matchedSentence.length > 0, 'matched sentence present');

console.log('sponsorship-signal: 31 classification cases passed');
