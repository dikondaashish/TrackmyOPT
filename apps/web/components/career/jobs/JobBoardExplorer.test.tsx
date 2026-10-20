import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EMPTY_JOB_FILTERS } from '@/lib/job-board/filters';
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
    description: '<h2>About North Beam.</h2><p>Remote full-time role. Bachelor\'s degree and 2 years of experience required.</p><h2>What You\'ll Do</h2><ul><li>Build reliable software.</li></ul>',
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
  it('renders a lazily fetched description after expanding a job', async () => {
    const description = '<p>Fetched from the description route</p>';
    const lazyJob = job({ description: null });
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ description }), { status: 200, headers: { 'content-type': 'application/json' } }),
    );

    render(<JobBoardExplorer jobs={[lazyJob]} runway={null} asOf="2026-08-29T12:00:00.000Z" />);

    fireEvent.click(screen.getByRole('button', { name: lazyJob.title }));

    expect(await screen.findByText('Fetched from the description route')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(`/api/job-board/jobs/${lazyJob.id}/description`, { cache: 'no-store' });
    fetchMock.mockRestore();
  });
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
    expect(screen.getByRole('heading', { name: 'About North Beam.' })).toBeInTheDocument();
    expect(screen.getByText(/Remote full-time role/)).toBeInTheDocument();
    expect(screen.getByText('Build reliable software.').closest('li')).toBeInTheDocument();
    expect(screen.getByText('Employer history found')).toBeInTheDocument();

    fireEvent.click(toggle);
    expect(screen.queryByRole('heading', { name: 'Job description' })).not.toBeInTheDocument();
  });

  it('applies search and every visible structured filter to verified jobs', () => {
    render(<JobBoardExplorer jobs={jobs} runway={null} asOf="2026-08-29T12:00:00.000Z" />);

    expect(screen.getByRole('combobox', { name: 'Date' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Location' })).toBeInTheDocument();
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
      job({ id: 'boundary', title: 'Boundary role', posted_at: '2030-01-02T11:00:00.000Z' }),
      job({ id: 'old', title: 'Old role', posted_at: '2030-01-02T10:59:59.000Z' }),
      job({ id: 'future', title: 'Future role', posted_at: '2030-01-02T12:00:01.000Z' }),
    ];
    render(<JobBoardExplorer jobs={datedJobs} runway={null} asOf="2030-01-02T12:00:00.000Z" />);

    const dateFilter = screen.getByRole('combobox', { name: 'Date' });
    expect(dateFilter).toHaveTextContent('Past hour');
    expect(dateFilter).toHaveTextContent('Past 6 hours');
    expect(dateFilter).toHaveTextContent('Past 12 hours');
    expect(dateFilter).toHaveTextContent('Past 24 hours');
    expect(dateFilter).toHaveTextContent('Past 48 hours');
    expect(dateFilter).toHaveTextContent('Past week');
    expect(dateFilter).toHaveTextContent('Past month');

    fireEvent.change(dateFilter, { target: { value: '1h' } });
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

  it('applies company and location choices and clears both draft and active filters', () => {
    render(<JobBoardExplorer jobs={jobs} runway={null} asOf="2026-08-29T12:00:00.000Z" />);

    fireEvent.change(screen.getByRole('combobox', { name: 'Company' }), { target: { value: 'Also, Inc.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Location' }));
    fireEvent.click(screen.getByRole('checkbox', { name: /Palo Alto, CA/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    applyFilters();
    expect(screen.getByText('Data Product Analyst')).toBeInTheDocument();
    expect(screen.queryByText('Software Engineer')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Palo Alto, CA' })).toBeInTheDocument();

    fireEvent.change(screen.getByRole('combobox', { name: 'Company' }), { target: { value: 'North Beam, Inc.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByRole('combobox', { name: 'Company' })).toHaveValue('all');
    expect(screen.getByRole('button', { name: 'Location' })).toBeInTheDocument();
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Data Product Analyst')).toBeInTheDocument();
  });

  it('hides jobs located only outside the US, unless they are saved', () => {
    const londonJob = job({ id: 'job-london', title: 'London Analyst', location: 'London, UK', tracker_status: 'Wishlist' });
    render(<JobBoardExplorer jobs={[...jobs, londonJob]} runway={null} asOf="2026-08-29T12:00:00.000Z" />);

    expect(screen.queryByText('London Analyst')).not.toBeInTheDocument();
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();

    openMoreFilters();
    fireEvent.change(screen.getByRole('combobox', { name: 'Tracker status' }), { target: { value: 'saved' } });
    applyFilters();
    expect(screen.getByText('London Analyst')).toBeInTheDocument();
  });

  it('searches US places, shows popular ones first, and sends every selected place', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ jobs: [], total: 0, page: 1 }), { status: 200, headers: { 'content-type': 'application/json' } }),
    );
    render(
      <JobBoardExplorer
        jobs={jobs}
        totalJobs={120}
        serverMode
        runway={null}
        asOf="2026-08-29T12:00:00.000Z"
        placeOptions={[
          { key: 'state:CA', kind: 'state', label: 'California', count: 2969 },
          { key: 'city:San Francisco, CA', kind: 'city', label: 'San Francisco, CA', count: 1755 },
          { key: 'remote:us', kind: 'remote', label: 'Remote (US)', count: 801 },
          { key: 'state:MA', kind: 'state', label: 'Massachusetts', count: 243 },
          { key: 'city:Boston, MA', kind: 'city', label: 'Boston, MA', count: 129 },
          { key: 'city:Austin, TX', kind: 'city', label: 'Austin, TX', count: 206 },
        ]}
        companyOptions={['Notion', 'Anthropic', 'Anyscale, Inc.']}
      />,
    );

    const companyOptions = [...screen.getByRole('combobox', { name: 'Company' }).querySelectorAll('option')].map((option) => option.value);
    expect(companyOptions).toEqual(['all', 'Anthropic', 'Anyscale, Inc.', 'Notion']);

    fireEvent.click(screen.getByRole('button', { name: 'Location' }));
    const dialog = screen.getByRole('dialog', { name: 'Choose US locations' });
    const popular = [...dialog.querySelectorAll('ul')[0].querySelectorAll('li')].map((item) => item.textContent);
    expect(popular[0]).toContain('Remote (US)');
    expect(popular[1]).toContain('California');

    fireEvent.change(screen.getByPlaceholderText('Search states and cities…'), { target: { value: 'mass' } });
    expect(screen.getByRole('checkbox', { name: /Massachusetts/ })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Boston, MA/ })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: /Austin, TX/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: /Massachusetts/ }));
    fireEvent.change(screen.getByPlaceholderText('Search states and cities…'), { target: { value: 'san f' } });
    fireEvent.click(screen.getByRole('checkbox', { name: /San Francisco, CA/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.getByRole('button', { name: 'Massachusetts +1' })).toBeInTheDocument();

    fireEvent.change(screen.getByRole('combobox', { name: 'Company' }), { target: { value: 'Anyscale, Inc.' } });
    applyFilters();

    expect(await screen.findByText('No verified jobs match these filters')).toBeInTheDocument();
    const params = new URL(String(fetchMock.mock.calls[0][0]), 'https://example.test').searchParams;
    expect(params.get('company')).toBe('Anyscale, Inc.');
    expect(params.getAll('place')).toEqual(['state:MA', 'city:San Francisco, CA']);
    expect(params.has('location')).toBe(false);
    expect(params.get('page')).toBe('1');
    expect(params.get('resumeId')).toBe('none');
    // The address bar keeps the applied search for reloads and shared links.
    expect(new URLSearchParams(window.location.search).get('company')).toBe('Anyscale, Inc.');
    fetchMock.mockRestore();
  });

  it('offers a retry when a description fails to load, and says when a listing closed', async () => {
    const fetchMock = vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: 'Unable to load job description' }), { status: 500 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ description: '<p>Loaded on retry</p>' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: 'Job not found' }), { status: 404 }));
    render(<JobBoardExplorer jobs={[job({ description: null }), job({ id: 'job-closed', title: 'Closed role', description: null })]} runway={null} asOf="2026-08-29T12:00:00.000Z" />);

    fireEvent.click(screen.getByRole('button', { name: 'Software Engineer' }));
    expect(await screen.findByText('Couldn’t load the job description.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('Loaded on retry')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Closed role' }));
    expect(await screen.findByText('This listing is no longer open on the employer board.')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(3);
    fetchMock.mockRestore();
  });

  it('pages with the server page size, shows loading, and keeps the tracker-wide saved count', async () => {
    let resolvePage: (response: Response) => void = () => {};
    const fetchMock = vi.spyOn(global, 'fetch').mockImplementationOnce(() => new Promise((resolve) => { resolvePage = resolve; }));
    render(<JobBoardExplorer jobs={jobs} totalJobs={45} pageSize={20} savedCount={12} serverMode runway={null} asOf="2026-08-29T12:00:00.000Z" />);

    expect(screen.getByText('Saved 12')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Loading jobs…')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();

    resolvePage(new Response(JSON.stringify({ jobs: [job({ id: 'page-2', title: 'Second page role', tracker_status: null })], total: 45, page: 2, pageSize: 20 }), { status: 200 }));
    expect(await screen.findByText('Second page role')).toBeInTheDocument();
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
    expect(screen.getByText('Saved 12')).toBeInTheDocument();
    expect(new URL(String(fetchMock.mock.calls[0][0]), 'https://example.test').searchParams.get('page')).toBe('2');
    fetchMock.mockRestore();
  });

  it('says how much of the feed the server ranked for the resume', () => {
    const initialResumeMatch = {
      resumeId: '44444444-4444-4444-8444-444444444444',
      filename: 'Stored Resume.pdf',
      source: 'ai' as const,
      profile: { schemaVersion: 1 as const, roleTitles: ['Software Engineer'], skills: [], certifications: [], education: [], yearsExperience: 2 },
    };
    render(<JobBoardExplorer jobs={jobs} totalJobs={900} rankedCount={300} serverMode initialFilters={{ ...EMPTY_JOB_FILTERS }} initialResumeMatch={initialResumeMatch} runway={null} asOf="2026-08-29T12:00:00.000Z" />);
    expect(screen.getByText('900 jobs · newest 300 ranked for your resume, then by date')).toBeInTheDocument();
    // Server-applied filters are shown as given, not replaced by resume defaults.
    expect(screen.getByRole('textbox', { name: 'Search verified jobs' })).toHaveValue('');
  });

  it('keeps the newest server results when an earlier request finishes last', async () => {
    let resolveFirst: (response: Response) => void = () => {};
    const first = new Promise<Response>((resolve) => { resolveFirst = resolve; });
    const respond = (title: string, total: number) => new Response(
      JSON.stringify({ jobs: [job({ id: title, title, tracker_status: null })], total, page: 1 }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    );
    const fetchMock = vi.spyOn(global, 'fetch')
      .mockImplementationOnce(() => first)
      .mockImplementationOnce(() => Promise.resolve(respond('Newest filter result', 1)));
    render(<JobBoardExplorer jobs={jobs} totalJobs={2} serverMode runway={null} asOf="2026-08-29T12:00:00.000Z" />);

    fireEvent.change(screen.getByRole('textbox', { name: 'Search verified jobs' }), { target: { value: 'old' } });
    applyFilters();
    fireEvent.change(screen.getByRole('textbox', { name: 'Search verified jobs' }), { target: { value: 'new' } });
    applyFilters();
    expect(await screen.findByText('Newest filter result')).toBeInTheDocument();

    resolveFirst(respond('Stale filter result', 40));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.queryByText('Stale filter result')).not.toBeInTheDocument();
    expect(screen.getByText('1 job')).toBeInTheDocument();
    fetchMock.mockRestore();
  });

  it('labels a missing posting date with the first-seen date', () => {
    render(<JobBoardExplorer jobs={[job({ posted_at: null, first_seen_at: '2026-08-27T12:00:00.000Z' })]} runway={null} asOf="2026-08-29T12:00:00.000Z" />);
    expect(screen.getByText(/First seen Aug 27, 2026/)).toBeInTheDocument();
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

  it('saves an uploaded resume, prefills filters, ranks jobs, and shows explainable match information', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, text: 'Software engineer with TypeScript experience.', filename: 'Asha Resume.pdf' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          resumeId: '33333333-3333-4333-8333-333333333333',
          updatedAt: '2026-08-30T12:00:00.000Z',
          filename: 'Asha Resume.pdf',
          source: 'ai',
          profile: {
            schemaVersion: 1,
            roleTitles: ['Software Engineer'],
            skills: ['TypeScript'],
            certifications: [],
            education: [{ level: 'bachelor', field: 'Computer Science' }],
            yearsExperience: 2,
            preferredLocations: ['Remote'],
            workplacePreferences: ['remote'],
          },
        }),
      });
    vi.stubGlobal('fetch', fetchMock);

    render(<JobBoardExplorer jobs={jobs} runway={null} asOf="2026-08-29T12:00:00.000Z" />);

    fireEvent.click(screen.getByRole('button', { name: 'Match from resume' }));
    const file = new File(['resume'], 'Asha Resume.pdf', { type: 'application/pdf' });
    fireEvent.change(screen.getByLabelText('Upload resume for job matching'), { target: { files: [file] } });
    expect(fetchMock).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Analyze and save Asha Resume.pdf' }));

    expect(await screen.findByText('Matching from Asha Resume.pdf')).toBeInTheDocument();
    expect(screen.getAllByText(/% match/).length).toBeGreaterThan(0);
    expect(screen.getByRole('textbox', { name: 'Search verified jobs' })).toHaveValue('engineer');
    expect(screen.getByRole('combobox', { name: 'Date' })).toHaveValue('30d');
    expect(screen.getByRole('button', { name: 'Remote (US)' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Workplace' })).toHaveValue('remote');
    expect(screen.getByRole('combobox', { name: 'Role' })).toHaveValue('engineering');

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
          resumeId: '55555555-5555-4555-8555-555555555555',
          updatedAt: '2026-08-30T12:00:00.000Z',
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
    fireEvent.click(screen.getByRole('button', { name: 'Analyze and save Scanned Resume.pdf' }));

    expect(await screen.findByText('Matching from Scanned Resume.pdf')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/proxy/ocr/direct', expect.objectContaining({ method: 'POST' }));
    vi.unstubAllGlobals();
  });

  it('restores a stored match on return and can remove that saved resume', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true, deleted: 1 }) });
    vi.stubGlobal('fetch', fetchMock);
    const initialResumeMatch = {
      resumeId: '44444444-4444-4444-8444-444444444444',
      filename: 'Stored Resume.pdf',
      source: 'ai' as const,
      profile: {
        schemaVersion: 1 as const,
        roleTitles: ['Software Engineer'],
        skills: ['TypeScript'],
        certifications: [],
        education: [],
        yearsExperience: 2,
      },
    };

    render(
      <JobBoardExplorer
        jobs={jobs}
        runway={null}
        asOf="2026-08-29T12:00:00.000Z"
        savedResumes={[{ id: initialResumeMatch.resumeId, filename: initialResumeMatch.filename, updatedAt: '2026-08-30T12:00:00.000Z' }]}
        initialResumeMatch={initialResumeMatch}
      />,
    );

    expect(screen.getByText('Matching from Stored Resume.pdf')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Search verified jobs' })).toHaveValue('engineer');
    fireEvent.click(screen.getByRole('button', { name: 'Change resume' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remove Stored Resume.pdf' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm remove resume' }));

    expect(await screen.findByText('No saved resumes yet')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/proxy/resume/44444444-4444-4444-8444-444444444444', expect.objectContaining({ method: 'DELETE' }));
    vi.unstubAllGlobals();
  });
});
