import assert from 'node:assert/strict';
import { shouldRunContinuousPrefill } from '../src/continuous-prefill';

assert.equal(shouldRunContinuousPrefill({
  mode: 'step_by_step',
  signature: 'page:a|field:email',
  previousSignature: '',
  inFlight: false,
}), false);

assert.equal(shouldRunContinuousPrefill({
  mode: 'continuous',
  signature: 'page:a|field:email',
  previousSignature: '',
  inFlight: false,
}), true);

assert.equal(shouldRunContinuousPrefill({
  mode: 'continuous',
  signature: 'page:a|field:email',
  previousSignature: 'page:a|field:email',
  inFlight: false,
}), false);

assert.equal(shouldRunContinuousPrefill({
  mode: 'continuous',
  signature: 'page:b|field:phone',
  previousSignature: 'page:a|field:email',
  inFlight: true,
}), false);

assert.equal(shouldRunContinuousPrefill({
  mode: 'continuous',
  signature: '',
  previousSignature: '',
  inFlight: false,
}), false);

console.log('continuous-prefill: opt-in, idempotence, and in-flight guard passed');
