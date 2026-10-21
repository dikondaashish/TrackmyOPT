import assert from 'node:assert/strict';
import test from 'node:test';

import {
  extractAtsJobIdentity,
  smartRecruitersPostingRef,
  smartRecruitersPublicationId,
} from '../src/job-portal/ats-job-identity';
import { jobUrlsReferToSameJob } from '../src/resume/resume-autofill-contract';
import { buildGeneratedResumeArtifactV1 } from '../src/resume/resume-artifact-lifecycle';
import { parseSmartRecruitersPosting, smartRecruitersPostingApiUrl } from '../src/job/smartrecruiters-posting';

// The real pair from AbbVie: "I'm interested" on the job page opens the
// one-click apply page, whose URL shares no id with the job page.
const JOB_PAGE = 'https://jobs.smartrecruiters.com/AbbVie/3743990016287966-senior-analyst-national-data-operations';
const PUBLICATION = '81c9ee5c-813a-494d-9ae7-d92851438091';
const APPLY_PAGE = `https://jobs.smartrecruiters.com/oneclick-ui/company/AbbVie/publication/${PUBLICATION}?dcr_ci=AbbVie`;

test('reads the company and publication id from the one-click apply page', () => {
  assert.deepEqual(extractAtsJobIdentity(APPLY_PAGE), { platform: 'smartrecruiters', tenant: 'abbvie', jobId: PUBLICATION });
  assert.equal(smartRecruitersPublicationId(APPLY_PAGE), PUBLICATION);
  assert.equal(smartRecruitersPublicationId(JOB_PAGE), undefined);
  assert.deepEqual(smartRecruitersPostingRef(JOB_PAGE), { company: 'AbbVie', postingId: '3743990016287966' });
  assert.deepEqual(smartRecruitersPostingRef(APPLY_PAGE), { company: 'AbbVie', postingId: PUBLICATION });
  assert.equal(
    smartRecruitersPostingApiUrl(APPLY_PAGE),
    `https://api.smartrecruiters.com/v1/companies/AbbVie/postings/${PUBLICATION}`,
  );
});

test('a resume made on the job page attaches on its one-click apply page', () => {
  assert.equal(jobUrlsReferToSameJob(JOB_PAGE, APPLY_PAGE, PUBLICATION), true);
  // Without the recorded publication id the two URLs cannot be linked.
  assert.equal(jobUrlsReferToSameJob(JOB_PAGE, APPLY_PAGE), false);
  // Another posting's apply page, or the same id at another company, never matches.
  assert.equal(
    jobUrlsReferToSameJob(JOB_PAGE, APPLY_PAGE.replace(PUBLICATION, '11111111-2222-4333-8444-555555555555'), PUBLICATION),
    false,
  );
  assert.equal(jobUrlsReferToSameJob(JOB_PAGE, APPLY_PAGE.replace('/AbbVie/', '/OtherCo/'), PUBLICATION), false);
  // A resume made on the apply page matches that page directly.
  assert.equal(jobUrlsReferToSameJob(APPLY_PAGE, APPLY_PAGE), true);
});

test('the generated artifact records the publication id for either page', async () => {
  const build = (jobUrl: string, requisitionId?: string) => buildGeneratedResumeArtifactV1({
    sourceResumeId: 'resume-1',
    sourceResumeFilename: 'resume.pdf',
    templateId: 'classic',
    jobKey: jobUrl,
    jobContext: { jobUrl, companyName: 'AbbVie', roleTitle: 'Senior Analyst' },
    requisitionId,
    finalLatex: '\\documentclass{article}',
    pdfBase64: 'JVBERi0xLjQK',
    pdfFilename: 'resume.pdf',
  });
  assert.equal((await build(JOB_PAGE, PUBLICATION)).artifact.job.requisitionId, PUBLICATION);
  assert.equal((await build(APPLY_PAGE)).artifact.job.requisitionId, PUBLICATION);
  assert.equal((await build(JOB_PAGE)).artifact.job.requisitionId, undefined);
});

test('turns a Posting API response into the publication id and plain-text job ad', () => {
  const posting = parseSmartRecruitersPosting({
    id: '3743990016287966',
    uuid: PUBLICATION.toUpperCase(),
    name: 'Senior Analyst, National Data Operations',
    jobAd: {
      sections: {
        companyDescription: { title: 'Company Description', text: '<p>AbbVie makes medicines.</p>' },
        jobDescription: { title: 'Job Description', text: '<ul><li>Own data operations &amp; reporting.</li></ul>' },
        qualifications: { title: 'Qualifications', text: '<p>Bachelor&#39;s degree.</p>' },
        additionalInformation: { title: 'Additional Information', text: '' },
      },
    },
  });
  assert.equal(posting?.publicationId, PUBLICATION);
  assert.match(posting?.description ?? '', /^Senior Analyst, National Data Operations\n\nCompany Description\nAbbVie makes medicines\./);
  assert.match(posting?.description ?? '', /Own data operations & reporting\./);
  assert.match(posting?.description ?? '', /Bachelor's degree\./);
  assert.doesNotMatch(posting?.description ?? '', /Additional Information/);
  assert.equal(parseSmartRecruitersPosting({ uuid: 'not-a-uuid' }), null);
});
