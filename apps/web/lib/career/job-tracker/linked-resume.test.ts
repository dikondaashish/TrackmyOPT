import { describe, expect, it } from 'vitest';
import {
  findLinkedResumeForApplication,
  findResumeToAttachOnJobSave,
} from './linked-resume';

describe('findLinkedResumeForApplication', () => {
  it('prefers an exact applicationId link', () => {
    const match = findLinkedResumeForApplication(
      [
        {
          id: 'r1',
          filename: 'other.pdf',
          created_at: '2026-08-01T00:00:00.000Z',
          structuredData: {
            type: 'generated',
            jobTitle: 'Data Engineer',
            jobDescription: 'Build pipelines at Acme',
            latexCode: '\\documentclass{article}',
          },
        },
        {
          id: 'r2',
          filename: 'linked.pdf',
          created_at: '2026-08-01T01:00:00.000Z',
          structuredData: {
            applicationId: 'app-1',
            type: 'generated',
            latexCode: '\\documentclass{article}',
            atsScore: 88,
            resumeStatus: 'ready',
          },
        },
      ],
      {
        id: 'app-1',
        company_name: 'Acme',
        role_title: 'Data Engineer',
        job_description: 'Build pipelines at Acme',
      },
    );

    expect(match).toMatchObject({
      id: 'r2',
      matchReason: 'application_id',
      atsScore: 88,
    });
  });

  it('falls back to role + company/JD overlap for extension resumes', () => {
    const match = findLinkedResumeForApplication(
      [
        {
          id: 'r3',
          filename: 'resume_Ashish_Acme_Data_Engineer.pdf',
          created_at: '2026-08-02T00:00:00.000Z',
          structuredData: {
            type: 'generated',
            jobTitle: 'Data Engineer at Acme',
            jobDescription:
              'Acme is hiring a Data Engineer to build ETL pipelines with Snowflake and dbt across analytics teams.',
            latexCode: '\\documentclass{article}',
            atsScore: 81,
          },
        },
      ],
      {
        id: 'app-9',
        company_name: 'Acme Inc',
        role_title: 'Senior Data Engineer',
        job_description:
          'Acme is hiring a Data Engineer to build ETL pipelines with Snowflake and dbt across analytics teams.',
      },
    );

    expect(match).toMatchObject({
      id: 'r3',
      matchReason: 'job_details',
      atsScore: 81,
    });
  });

  it('does not link unrelated generated resumes', () => {
    const match = findLinkedResumeForApplication(
      [
        {
          id: 'r4',
          filename: 'resume_other.pdf',
          created_at: '2026-08-02T00:00:00.000Z',
          structuredData: {
            type: 'generated',
            jobTitle: 'Nurse Practitioner',
            jobDescription: 'Hospital night shift clinical care',
            latexCode: '\\documentclass{article}',
          },
        },
      ],
      {
        id: 'app-2',
        company_name: 'Acme',
        role_title: 'Data Engineer',
        job_description: 'Snowflake pipelines and dbt models',
      },
    );

    expect(match).toBeNull();
  });

  it('attaches an unlinked generated resume when the job is saved later', () => {
    const match = findResumeToAttachOnJobSave(
      [
        {
          id: 'r5',
          filename: 'resume_Ashish_Acme.pdf',
          created_at: '2026-08-02T02:00:00.000Z',
          structuredData: {
            type: 'generated',
            jobTitle: 'Data Engineer at Acme',
            jobDescription:
              'Acme is hiring a Data Engineer to build ETL pipelines with Snowflake and dbt across analytics teams.',
            latexCode: '\\documentclass{article}',
            atsScore: 84,
          },
        },
        {
          id: 'r6',
          filename: 'already-linked.pdf',
          created_at: '2026-08-02T03:00:00.000Z',
          structuredData: {
            applicationId: 'other-app',
            type: 'generated',
            jobTitle: 'Data Engineer at Acme',
            jobDescription:
              'Acme is hiring a Data Engineer to build ETL pipelines with Snowflake and dbt across analytics teams.',
            latexCode: '\\documentclass{article}',
          },
        },
      ],
      {
        id: 'app-new',
        company_name: 'Acme Inc',
        role_title: 'Senior Data Engineer',
        job_description:
          'Acme is hiring a Data Engineer to build ETL pipelines with Snowflake and dbt across analytics teams.',
      },
    );

    expect(match).toMatchObject({
      id: 'r5',
      matchReason: 'job_details',
    });
  });
});
