import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmployerEvidencePanel } from './EmployerEvidencePanel';

const signal = {
  signal_type: 'historical_h1b_filing',
  evidence_snippet: 'The employer had 14 approved H-1B petitions in FY 2025.',
  source_url: 'https://www.dol.gov/agencies/eta/foreign-labor/performance',
  observed_date: '2026-08-29',
  confidence: 0.9,
  source: 'Department of Labor',
};

describe('EmployerEvidencePanel', () => {
  it('renders dated, source-backed history only for a confirmed employer match', () => {
    render(
      <EmployerEvidencePanel
        employerBoardName="North Beam, Inc."
        match={{
          canonical_h1b_sponsor_id: 'north-beam-inc',
          confidence: 1,
          review_status: 'confirmed',
        }}
        signals={[signal]}
      />,
    );

    expect(screen.getByText('Employer history found')).toBeInTheDocument();
    expect(screen.getByText('E-Verify status')).toBeInTheDocument();
    expect(screen.getByText(/Needs employer confirmation/)).toBeInTheDocument();
    expect(screen.getByText(/Why this is a potential sponsor \(1 evidence item\)/)).toBeInTheDocument();
    expect(screen.getByText(signal.evidence_snippet)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sponsor profile/ })).toHaveAttribute(
      'href',
      '/dashboard/career/h1b-sponsors/north-beam-inc',
    );
    expect(screen.getByRole('link', { name: /Source · observed 2026-08-29/ })).toHaveAttribute(
      'href',
      signal.source_url,
    );
  });

  it('withholds sponsorship evidence for an unconfirmed employer identity', () => {
    render(
      <EmployerEvidencePanel
        employerBoardName="Unresolved Careers"
        match={{
          canonical_h1b_sponsor_id: null,
          confidence: 0,
          review_status: 'pending_review',
        }}
        signals={[signal]}
      />,
    );

    expect(screen.getByText('Employer identity not confirmed')).toBeInTheDocument();
    expect(screen.getByText(/No sponsorship history is shown/)).toBeInTheDocument();
    expect(screen.queryByText('Employer history found')).not.toBeInTheDocument();
    expect(screen.queryByText(/Why this is a potential sponsor/)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Sponsor profile/ })).not.toBeInTheDocument();
  });
});
