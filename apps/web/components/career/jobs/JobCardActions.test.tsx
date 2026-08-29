import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { saveVerifiedJobToTracker, setVerifiedJobFollowup } from '@/app/dashboard/career/job-tracker/actions';
import { JobCardActions } from './JobCardActions';

vi.mock('@/app/dashboard/career/job-tracker/actions', () => ({
  saveVerifiedJobToTracker: vi.fn(),
  setVerifiedJobFollowup: vi.fn(),
}));

const saveJob = vi.mocked(saveVerifiedJobToTracker);
const setFollowup = vi.mocked(setVerifiedJobFollowup);

describe('JobCardActions', () => {
  beforeEach(() => {
    saveJob.mockReset();
    setFollowup.mockReset();
    saveJob.mockResolvedValue({ applicationId: 'application-1', wasCreated: true });
    setFollowup.mockResolvedValue({ applicationId: 'application-1' });
  });

  it('uses clear tracker and ATS labels in compact list rows', () => {
    render(
      <JobCardActions
        jobId="0fb994bb-353a-4792-8018-05e7f564bc33"
        companyName="North Beam, Inc."
        title="Director of Customer Success"
        jobUrl="https://job-boards.greenhouse.io/northbeam/jobs/4603154006"
        sponsorId="north-beam-inc"
        variant="list"
      />,
    );

    expect(screen.getByRole('button', { name: 'Add to tracker' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Apply on ATS/ })).toHaveAttribute(
      'href',
      'https://job-boards.greenhouse.io/northbeam/jobs/4603154006',
    );
    expect(screen.getByText('More tools')).toBeInTheDocument();
  });

  it('maps every action to an existing manual product surface', async () => {
    render(
      <JobCardActions
        jobId="0fb994bb-353a-4792-8018-05e7f564bc33"
        companyName="North Beam, Inc."
        title="Director of Customer Success"
        jobUrl="https://job-boards.greenhouse.io/northbeam/jobs/4603154006"
        sponsorId="north-beam-inc"
      />,
    );

    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View role/ })).toHaveAttribute('href', 'https://job-boards.greenhouse.io/northbeam/jobs/4603154006');
    expect(screen.getByRole('link', { name: /View role/ })).toHaveAttribute('target', '_blank');
    fireEvent.click(screen.getByText('More tools'));
    expect(screen.getByRole('link', { name: /Tailor resume/ })).toHaveAttribute(
      'href',
      '/dashboard/career/resume-generator?company=North+Beam%2C+Inc.&role=Director+of+Customer+Success',
    );
    expect(screen.getByRole('link', { name: /Compare sponsor profile/ })).toHaveAttribute(
      'href',
      '/dashboard/career/h1b-sponsors/north-beam-inc',
    );
    expect(screen.getByRole('button', { name: /Set follow-up date/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Record interview or application manually/ })).toHaveAttribute(
      'href',
      '/dashboard/career/job-tracker',
    );
    expect(screen.getByText(/They never submit an application or contact an employer/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(saveJob).toHaveBeenCalledWith('0fb994bb-353a-4792-8018-05e7f564bc33'));
    expect(await screen.findByRole('button', { name: 'Saved' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Set follow-up date/ }));
    fireEvent.change(screen.getByLabelText('Follow-up date'), { target: { value: '2026-09-03' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save follow-up' }));
    await waitFor(() => expect(setFollowup).toHaveBeenCalledWith('0fb994bb-353a-4792-8018-05e7f564bc33', '2026-09-03'));
  });

  it('withholds the sponsor comparison link until employer identity is confirmed', () => {
    render(
      <JobCardActions
        jobId="0fb994bb-353a-4792-8018-05e7f564bc33"
        companyName="Unresolved Careers"
        title="Engineer"
        jobUrl={null}
        sponsorId={null}
      />,
    );

    fireEvent.click(screen.getByText('More tools'));
    expect(screen.queryByRole('link', { name: /Compare sponsor profile/ })).not.toBeInTheDocument();
    expect(screen.getByText(/Sponsor profile unavailable until employer identity is confirmed/)).toBeInTheDocument();
  });

  it('marks an unsaved job as saved when setting a follow-up creates its tracker entry', async () => {
    const onSaved = vi.fn();
    render(
      <JobCardActions
        jobId="0fb994bb-353a-4792-8018-05e7f564bc33"
        companyName="North Beam, Inc."
        title="Director of Customer Success"
        jobUrl="https://job-boards.greenhouse.io/northbeam/jobs/4603154006"
        sponsorId="north-beam-inc"
        onSaved={onSaved}
      />,
    );

    fireEvent.click(screen.getByText('More tools'));
    fireEvent.click(screen.getByRole('button', { name: /Set follow-up date/ }));
    fireEvent.change(screen.getByLabelText('Follow-up date'), { target: { value: '2026-09-03' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save follow-up' }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('button', { name: 'Saved' })).toBeInTheDocument();
  });
});
