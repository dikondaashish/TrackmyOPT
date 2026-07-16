import assert from 'node:assert/strict';
import test from 'node:test';

import { buildContactAutofillProfile } from '../src/prefill-contact-source';
import type {
  BasicContactProfile,
  ResumeAutofillSnapshotV1,
} from '../src/resume-autofill-contract';

const fallback: BasicContactProfile = {
  firstName: 'Profile',
  lastName: 'Person',
  fullName: 'Profile Person',
  email: 'profile@example.com',
  phone: '+1 555 0100',
  city: 'Boston',
  state: 'MA',
  yearsExperience: '4',
  linkedinUrl: 'https://linkedin.com/in/profile-person',
  portfolioUrl: 'https://profile.example.com',
};

test('contact fields prefer generated snapshot values and fall back only when missing', () => {
  const snapshot: ResumeAutofillSnapshotV1 = {
    contact: {
      firstName: 'Generated',
      phone: '+1 555 0199',
      city: 'New York',
      linkedinUrl: 'https://linkedin.com/in/generated-person',
    },
    totalYearsExperience: 8,
    skills: [],
    experience: [],
    education: [],
    certifications: [],
  };

  assert.deepEqual(buildContactAutofillProfile(snapshot, fallback), {
    firstName: 'Generated',
    lastName: 'Person',
    fullName: 'Generated Person',
    email: 'profile@example.com',
    phone: '+1 555 0199',
    city: 'New York',
    state: 'MA',
    yearsExperience: '8',
    linkedinUrl: 'https://linkedin.com/in/generated-person',
    portfolioUrl: 'https://profile.example.com',
  });
});

test('profile-only contact resolution preserves the application profile unchanged', () => {
  assert.deepEqual(buildContactAutofillProfile(undefined, fallback), fallback);
});
