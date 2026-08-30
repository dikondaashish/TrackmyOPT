import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { JobDescriptionContent } from './JobDescriptionContent';

describe('JobDescriptionContent', () => {
  it('preserves headings, paragraphs, lists, and employer emphasis from ATS HTML', () => {
    render(
      <JobDescriptionContent
        description={`
          <h2>About ALSO.</h2>
          <p>We build efficient electric mobility products.</p>
          <h2>What You'll Do</h2>
          <ul>
            <li>Lead field integration.</li>
            <li>Travel up to <strong>50% of the time</strong>.</li>
          </ul>
          <script>alert('unsafe')</script>
          &lt;script&gt;alert('encoded unsafe')&lt;/script&gt;
        `}
      />,
    );

    expect(screen.getByRole('heading', { name: 'About ALSO.' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: "What You'll Do" })).toBeInTheDocument();
    const list = screen.getByRole('list');
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('50% of the time').tagName).toBe('STRONG');
    expect(within(list).getAllByRole('listitem')[1]).toHaveTextContent('Travel up to 50% of the time.');
    expect(screen.queryByText(/unsafe/)).not.toBeInTheDocument();
  });

  it('decodes ATS entities and keeps separate source paragraphs', () => {
    render(
      <JobDescriptionContent description="<p>DVP&amp;R testing.</p><p>Salary: $200,000 &ndash; $220,000.</p>" />,
    );

    expect(screen.getByText('DVP&R testing.')).toBeInTheDocument();
    expect(screen.getByText('Salary: $200,000 – $220,000.')).toBeInTheDocument();
  });

  it('recognizes common section headings in legacy plain-text descriptions', () => {
    render(
      <JobDescriptionContent description="About ALSO. We build mobility products. What You'll Bring Five years of relevant experience. Minimum Qualifications A relevant degree. Perks &amp; Benefits Flexible time off." />,
    );

    expect(screen.getByRole('heading', { name: 'About ALSO.' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: "What You'll Bring" })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Minimum Qualifications' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Perks & Benefits' })).toBeInTheDocument();
  });

  it('shows a clear fallback when the source board provides no description', () => {
    render(<JobDescriptionContent description={null} />);

    expect(screen.getByText('The employer has not provided a job description on this authorized board.')).toBeInTheDocument();
  });
});
