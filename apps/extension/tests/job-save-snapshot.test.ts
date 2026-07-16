import assert from 'node:assert/strict';
import {
  JOB_DESCRIPTION_MAX_LENGTH,
  buildJobSaveSnapshot,
} from '../src/job-save-snapshot';

const currentDescription = 'Current page description with TypeScript and React.'.repeat(20);

assert.deepEqual(
  buildJobSaveSnapshot(
    {
      company_name: 'Acme',
      role_title: 'Software Engineer',
      salary_text: '  $120,000 – $150,000 / year  ',
    },
    currentDescription,
  ),
  {
    company_name: 'Acme',
    role_title: 'Software Engineer',
    salary_text: '$120,000 – $150,000 / year',
    job_description: currentDescription,
  },
  'manual saves include normalized salary and the current posting text',
);

const preservedDescription = 'Original posting captured before the apply flow.'.repeat(20);
assert.equal(
  buildJobSaveSnapshot(
    { company_name: 'Acme', role_title: 'Engineer', job_description: preservedDescription },
    'Application submitted successfully.',
  ).job_description,
  preservedDescription,
  'auto-add keeps the original posting instead of the confirmation-page text',
);

assert.equal(
  buildJobSaveSnapshot(
    { company_name: 'Acme', role_title: 'Engineer' },
    'J'.repeat(JOB_DESCRIPTION_MAX_LENGTH + 500),
  ).job_description?.length,
  JOB_DESCRIPTION_MAX_LENGTH,
  'extension payload caps the description at 15,000 characters',
);

console.log('job-save-snapshot: salary/JD payload and cap passed');
