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
  country: 'United States',
  streetAddress: '1 Profile Way',
  city: 'Boston',
  state: 'MA',
  postalCode: '02110',
  countyDistrict: 'Suffolk County',
  yearsExperience: '4',
  linkedinUrl: 'https://linkedin.com/in/profile-person',
  githubUrl: 'https://github.com/profile-person',
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
    country: 'United States',
    streetAddress: '1 Profile Way',
    city: 'New York',
    state: 'MA',
    postalCode: '02110',
    countyDistrict: 'Suffolk County',
    yearsExperience: '8',
    linkedinUrl: 'https://linkedin.com/in/generated-person',
    githubUrl: 'https://github.com/profile-person',
    portfolioUrl: 'https://profile.example.com',
  });
});

test('profile-only contact resolution preserves the application profile unchanged', () => {
  assert.deepEqual(buildContactAutofillProfile(undefined, fallback), fallback);
});
