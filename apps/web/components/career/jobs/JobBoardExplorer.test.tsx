import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { JobBoardExplorer } from './JobBoardExplorer';

vi.mock('./JobCardActions', () => ({
  JobCardActions: ({ initialSaved }: { initialSaved?: boolean }) => <span>{initialSaved ? 'Saved action' : 'Save action'}</span>,
}));

const jobs = [
  {
    id: 'job-1',
    title: 'Software Engineer',
    company_name: 'North Beam, Inc.',
    employer_board_name: 'North Beam',
    location: 'Remote, United States',
    department: 'Engineering',
    description: 'Remote full-time role. Bachelor\'s degree and 2 years of experience required.',
    job_url: 'https://example.com/one',
    posted_at: '2026-08-29T12:00:00.000Z',
    first_seen_at: '2026-08-29T12:00:00.000Z',
    last_confirmed_at: '2026-08-29T12:00:00.000Z',
    source_ats: 'greenhouse',
    tracker_status: 'Wishlist',
    employer_match: { canonical_h1b_sponsor_id: 'north-beam', confidence: 1, review_status: 'confirmed' },
    visa_signals: [{ signal_type: 'historical_h1b_filing', evidence_snippet: 'Dated filing history.', source_url: 'https://example.com/source', observed_date: '2026-08-29', confidence: 0.9, source: 'DOL' }],
  },
  {
    id: 'job-2',
    title: 'Data Product Analyst',
    company_name: 'Also, Inc.',
    employer_board_name: 'Also',
    location: 'Palo Alto, CA',
    department: 'Product',
    description: 'Hybrid part-time contract role. Master\'s degree and 4 years of experience required.',
    job_url: 'https://example.com/two',
    posted_at: '2026-08-28T12:00:00.000Z',
    first_seen_at: '2026-08-28T12:00:00.000Z',
    last_confirmed_at: '2026-08-29T12:00:00.000Z',
    source_ats: 'ashby',
    tracker_status: null,
    employer_match: null,
    visa_signals: [],
  },
];

describe('JobBoardExplorer', () => {
  it('applies search and every visible structured filter to verified jobs', () => {
    render(<JobBoardExplorer jobs={jobs} runway={null} />);

    expect(screen.getByRole('combobox', { name: 'Date' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Location' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Workplace' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Company' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Degree level' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Maximum experience' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Employer evidence' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Role' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Job type' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Employment type' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Tracker status' })).toBeInTheDocument();

    fireEvent.change(screen.getByRole('textbox', { name: 'Search verified jobs' }), { target: { value: 'data' } });
    fireEvent.change(screen.getByRole('combobox', { name: 'Workplace' }), { target: { value: 'hybrid' } });
    fireEvent.change(screen.getByRole('combobox', { name: 'Degree level' }), { target: { value: 'master' } });
    fireEvent.change(screen.getByRole('combobox', { name: 'Maximum experience' }), { target: { value: 'mid' } });
    fireEvent.change(screen.getByRole('combobox', { name: 'Role' }), { target: { value: 'data' } });
    fireEvent.change(screen.getByRole('combobox', { name: 'Job type' }), { target: { value: 'contract' } });
    fireEvent.change(screen.getByRole('combobox', { name: 'Employment type' }), { target: { value: 'part_time' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }));

    expect(screen.getByText('Data Product Analyst')).toBeInTheDocument();
    expect(screen.queryByText('Software Engineer')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Clear/ }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Employer evidence' }), { target: { value: 'source_backed' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }));

    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.queryByText('Data Product Analyst')).not.toBeInTheDocument();
  });
});
