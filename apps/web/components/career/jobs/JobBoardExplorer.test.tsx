import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { JobBoardExplorer } from './JobBoardExplorer';

vi.mock('./JobCardActions', () => ({
  JobCardActions: ({ initialSaved, onSaved }: { initialSaved?: boolean; onSaved?: () => void }) => (
    <button type="button" onClick={onSaved}>{initialSaved ? 'Saved action' : 'Save action'}</button>
  ),
}));

type TestJob = Parameters<typeof JobBoardExplorer>[0]['jobs'][number];

const jobs: TestJob[] = [
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
    company_website: 'https://northbeam.io',
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
    company_website: null,
    tracker_status: null,
    employer_match: null,
    visa_signals: [],
  },
];

function job(overrides: Partial<TestJob>): TestJob {
  return { ...jobs[0], ...overrides };
}

function openMoreFilters() {
  fireEvent.click(screen.getByText('More filters'));
}

function applyFilters() {
  fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }));
}

describe('JobBoardExplorer', () => {
  it('uses compact list rows and reveals posting details on demand', () => {
    render(<JobBoardExplorer jobs={jobs} runway={null} asOf="2026-08-29T12:00:00.000Z" />);

    const toggle = screen.getByRole('button', { name: 'Software Engineer' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('img', { name: 'North Beam, Inc. logo' })).toHaveAttribute('src', expect.stringContaining('northbeam.io'));
    expect(screen.getByRole('img', { name: 'Greenhouse logo' })).toHaveAttribute('src', expect.stringContaining('greenhouse.com'));
    expect(screen.queryByRole('heading', { name: 'Job description' })).not.toBeInTheDocument();

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('heading', { name: 'Job description' })).toBeInTheDocument();
    expect(screen.getByText(/Remote full-time role/)).toBeInTheDocument();
    expect(screen.getByText('Employer history found')).toBeInTheDocument();

    fireEvent.click(toggle);
    expect(screen.queryByRole('heading', { name: 'Job description' })).not.toBeInTheDocument();
  });

  it('applies search and every visible structured filter to verified jobs', () => {
    render(<JobBoardExplorer jobs={jobs} runway={null} asOf="2026-08-29T12:00:00.000Z" />);

    expect(screen.getByRole('combobox', { name: 'Date' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Location' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Workplace' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Company' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Role' })).toBeInTheDocument();

    fireEvent.click(screen.getByText('More filters'));

    expect(screen.getByRole('combobox', { name: 'Degree level' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Maximum experience' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Employer evidence' })).toBeInTheDocument();
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

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    fireEvent.click(screen.getByText('More filters'));
    fireEvent.change(screen.getByRole('combobox', { name: 'Employer evidence' }), { target: { value: 'source_backed' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }));

    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.queryByText('Data Product Analyst')).not.toBeInTheDocument();
  });

  it('uses the server reference time for inclusive date windows and rejects future timestamps', () => {
    const datedJobs = [
      job({ id: 'recent', title: 'Recent role', posted_at: '2030-01-02T12:00:00.000Z' }),
      job({ id: 'boundary', title: 'Boundary role', posted_at: '2030-01-01T12:00:00.000Z' }),
      job({ id: 'old', title: 'Old role', posted_at: '2030-01-01T11:59:59.000Z' }),
      job({ id: 'future', title: 'Future role', posted_at: '2030-01-02T12:00:01.000Z' }),
    ];
    render(<JobBoardExplorer jobs={datedJobs} runway={null} asOf="2030-01-02T12:00:00.000Z" />);

    fireEvent.change(screen.getByRole('combobox', { name: 'Date' }), { target: { value: '1' } });
    applyFilters();

    expect(screen.getByText('Recent role')).toBeInTheDocument();
    expect(screen.getByText('Boundary role')).toBeInTheDocument();
    expect(screen.queryByText('Old role')).not.toBeInTheDocument();
    expect(screen.queryByText('Future role')).not.toBeInTheDocument();
  });

  it('searches the selected scope and excludes matches from all job content', () => {
    render(<JobBoardExplorer jobs={jobs} runway={null} asOf="2026-08-29T12:00:00.000Z" />);

    fireEvent.change(screen.getByRole('combobox', { name: 'Search scope' }), { target: { value: 'company' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Search verified jobs' }), { target: { value: '  NORTH   beam ' } });
    applyFilters();
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.queryByText('Data Product Analyst')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    openMoreFilters();
    fireEvent.change(screen.getByRole('textbox', { name: 'Exclude jobs containing' }), { target: { value: 'engineering' } });
    applyFilters();
    expect(screen.queryByText('Software Engineer')).not.toBeInTheDocument();
    expect(screen.getByText('Data Product Analyst')).toBeInTheDocument();
  });

  it('matches every explicitly accepted degree and every applicable role family', () => {
    const multiFactJobs = [
      job({
        id: 'data-engineer',
        title: 'Data Engineer',
        description: "Bachelor's or Master's degree and 4 years of experience required.",
        tracker_status: null,
      }),
      job({ id: 'designer', title: 'Brand Designer', description: 'Portfolio required.', tracker_status: null }),
    ];
    render(<JobBoardExplorer jobs={multiFactJobs} runway={null} asOf="2026-08-29T12:00:00.000Z" />);

    fireEvent.change(screen.getByRole('combobox', { name: 'Role' }), { target: { value: 'data' } });
    openMoreFilters();
    fireEvent.change(screen.getByRole('combobox', { name: 'Degree level' }), { target: { value: 'bachelor' } });
    applyFilters();

    expect(screen.getByText('Data Engineer')).toBeInTheDocument();
    expect(screen.queryByText('Brand Designer')).not.toBeInTheDocument();
  });

  it('applies exact company and location choices and clears both draft and active filters', () => {
    render(<JobBoardExplorer jobs={jobs} runway={null} asOf="2026-08-29T12:00:00.000Z" />);

    fireEvent.change(screen.getByRole('combobox', { name: 'Company' }), { target: { value: 'Also, Inc.' } });
    fireEvent.change(screen.getByRole('combobox', { name: 'Location' }), { target: { value: 'Palo Alto, CA' } });
    applyFilters();
    expect(screen.getByText('Data Product Analyst')).toBeInTheDocument();
    expect(screen.queryByText('Software Engineer')).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole('combobox', { name: 'Company' }), { target: { value: 'North Beam, Inc.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByRole('combobox', { name: 'Company' })).toHaveValue('all');
    expect(screen.getByRole('combobox', { name: 'Location' })).toHaveValue('all');
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Data Product Analyst')).toBeInTheDocument();
  });

  it('keeps title-and-description search separate from title-only search', () => {
    render(<JobBoardExplorer jobs={jobs} runway={null} asOf="2026-08-29T12:00:00.000Z" />);

    fireEvent.change(screen.getByRole('textbox', { name: 'Search verified jobs' }), { target: { value: "master's" } });
    applyFilters();
    expect(screen.getByText('Data Product Analyst')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    fireEvent.change(screen.getByRole('combobox', { name: 'Search scope' }), { target: { value: 'title' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Search verified jobs' }), { target: { value: "master's" } });
    applyFilters();
    expect(screen.queryByText('Data Product Analyst')).not.toBeInTheDocument();
  });

  it('treats maximum experience as a ceiling instead of an exact bucket', () => {
    const experienceJobs = [
      job({ id: 'entry', title: 'Junior Engineer', description: '2 years of experience required.', tracker_status: null }),
      job({ id: 'mid', title: 'Engineer II', description: '4 years of experience required.', tracker_status: null }),
      job({ id: 'senior', title: 'Senior Engineer', description: '7 years of experience required.', tracker_status: null }),
      job({ id: 'unknown', title: 'Flexible Engineer', description: 'Experience welcomed.', tracker_status: null }),
    ];
    render(<JobBoardExplorer jobs={experienceJobs} runway={null} asOf="2026-08-29T12:00:00.000Z" />);

    openMoreFilters();
    fireEvent.change(screen.getByRole('combobox', { name: 'Maximum experience' }), { target: { value: 'mid' } });
    applyFilters();

    expect(screen.getByText('Junior Engineer')).toBeInTheDocument();
    expect(screen.getByText('Engineer II')).toBeInTheDocument();
    expect(screen.queryByText('Senior Engineer')).not.toBeInTheDocument();
    expect(screen.queryByText('Flexible Engineer')).not.toBeInTheDocument();
  });

  it('does not infer permanent employment or employer history without explicit evidence', () => {
    const evidenceJobs = [
      job({
        id: 'negative-signal',
        title: 'Explicit temporary role',
        description: 'Temporary assignment. Sponsorship is not available.',
        tracker_status: null,
        visa_signals: [{
          signal_type: 'no_sponsorship_stated',
          evidence_snippet: 'Sponsorship is not available.',
          source_url: 'https://example.com/negative',
          observed_date: '2026-08-29',
          confidence: 1,
          source: 'employer_posting',
        }],
      }),
      job({ id: 'unspecified', title: 'General role', description: 'Join our growing team.', tracker_status: null, visa_signals: [] }),
    ];
    render(<JobBoardExplorer jobs={evidenceJobs} runway={null} asOf="2026-08-29T12:00:00.000Z" />);

    openMoreFilters();
    fireEvent.change(screen.getByRole('combobox', { name: 'Employer evidence' }), { target: { value: 'source_backed' } });
    applyFilters();
    expect(screen.queryByText('Explicit temporary role')).not.toBeInTheDocument();
    expect(screen.queryByText('General role')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    openMoreFilters();
    fireEvent.change(screen.getByRole('combobox', { name: 'Job type' }), { target: { value: 'permanent' } });
    applyFilters();
    expect(screen.queryByText('General role')).not.toBeInTheDocument();
  });

  it('counts all tracker entries as saved and later pipeline stages as manually applied', () => {
    const trackerJobs = [
      job({ id: 'wishlist', title: 'Wishlist role', tracker_status: 'Wishlist' }),
      job({ id: 'interviewing', title: 'Interviewing role', tracker_status: 'Interviewing' }),
      job({ id: 'unsaved', title: 'Unsaved role', tracker_status: null }),
    ];
    render(<JobBoardExplorer jobs={trackerJobs} runway={null} asOf="2026-08-29T12:00:00.000Z" />);

    expect(screen.getByText('Saved 2')).toBeInTheDocument();
    openMoreFilters();
    fireEvent.change(screen.getByRole('combobox', { name: 'Tracker status' }), { target: { value: 'applied' } });
    applyFilters();
    expect(screen.getByText('Interviewing role')).toBeInTheDocument();
    expect(screen.queryByText('Wishlist role')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save action' }));
    expect(screen.getByText('Saved 3')).toBeInTheDocument();

    openMoreFilters();
    fireEvent.change(screen.getByRole('combobox', { name: 'Tracker status' }), { target: { value: 'saved' } });
    applyFilters();
    expect(screen.getByText('Unsaved role')).toBeInTheDocument();
  });

  it('uploads a resume, ranks jobs, and shows explainable match information without replacing manual filters', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, text: 'Software engineer with TypeScript experience.', filename: 'Asha Resume.pdf' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          filename: 'Asha Resume.pdf',
          source: 'ai',
          profile: {
            schemaVersion: 1,
            roleTitles: ['Software Engineer'],
            skills: ['TypeScript'],
            certifications: [],
            education: [{ level: 'bachelor', field: 'Computer Science' }],
            yearsExperience: 2,
          },
        }),
      });
    vi.stubGlobal('fetch', fetchMock);

    render(<JobBoardExplorer jobs={jobs} runway={null} asOf="2026-08-29T12:00:00.000Z" />);

    fireEvent.click(screen.getByRole('button', { name: 'Match from resume' }));
    const file = new File(['resume'], 'Asha Resume.pdf', { type: 'application/pdf' });
    fireEvent.change(screen.getByLabelText('Upload resume for job matching'), { target: { files: [file] } });

    expect(await screen.findByText('Matching from Asha Resume.pdf')).toBeInTheDocument();
    expect(screen.getAllByText(/% match/).length).toBeGreaterThan(0);
    expect(screen.getByRole('textbox', { name: 'Search verified jobs' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Workplace' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Software Engineer' }));
    expect(await screen.findByRole('heading', { name: 'Why this job matches' })).toBeInTheDocument();

    vi.unstubAllGlobals();
  });

  it('uses the existing OCR fallback for scanned PDF resumes before matching', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'pdf_no_extractable_text', can_ocr: true, fileBuffer: 'base64-pdf', filename: 'Scanned Resume.pdf' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, text: 'Data analyst with SQL and Tableau experience.', filename: 'Scanned Resume.pdf' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          filename: 'Scanned Resume.pdf',
          source: 'ai',
          profile: { schemaVersion: 1, roleTitles: ['Data Analyst'], skills: ['SQL', 'Tableau'], certifications: [], education: [], yearsExperience: 2 },
        }),
      });
    vi.stubGlobal('fetch', fetchMock);

    render(<JobBoardExplorer jobs={jobs} runway={null} asOf="2026-08-29T12:00:00.000Z" />);
    fireEvent.click(screen.getByRole('button', { name: 'Match from resume' }));
    fireEvent.change(screen.getByLabelText('Upload resume for job matching'), {
      target: { files: [new File(['scan'], 'Scanned Resume.pdf', { type: 'application/pdf' })] },
    });

    expect(await screen.findByText('Matching from Scanned Resume.pdf')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/proxy/ocr/direct', expect.objectContaining({ method: 'POST' }));
    vi.unstubAllGlobals();
  });
});
