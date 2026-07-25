import { ResumeController } from './resume.controller';
import { ResumeService } from './resume.service';

describe('ResumeController trusted ownership', () => {
  const resumeService = {
    saveResume: jest.fn(),
    getDownloadUrl: jest.fn(),
    getResumes: jest.fn(),
    getResumeById: jest.fn(),
    deleteResume: jest.fn(),
  };
  const controller = new ResumeController(
    resumeService as unknown as ResumeService,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses the trusted proxy header instead of a save body user id', async () => {
    resumeService.saveResume.mockResolvedValue({ id: 'resume-1' });

    await (
      controller.saveResume as unknown as (
        userId: string,
        body: {
          userId?: string;
          filename: string;
          content: string;
          structuredData: Record<string, unknown>;
        },
      ) => Promise<unknown>
    )('authenticated-user', {
      userId: 'attacker-selected-user',
      filename: 'resume.pdf',
      content: 'content',
      structuredData: {},
    });

    expect(resumeService.saveResume).toHaveBeenCalledWith(
      'authenticated-user',
      {
        filename: 'resume.pdf',
        content: 'content',
        structuredData: {},
      },
    );
  });

  it('scopes download URLs to the authenticated user', async () => {
    resumeService.getDownloadUrl.mockResolvedValue('https://signed.example');

    await (
      controller.getDownloadUrl as unknown as (
        userId: string,
        body: { s3Key: string },
      ) => Promise<unknown>
    )('authenticated-user', { s3Key: 'resumes/file.pdf' });

    expect(resumeService.getDownloadUrl).toHaveBeenCalledWith(
      'authenticated-user',
      'resumes/file.pdf',
    );
  });
});
