import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CompanyLogo } from './CompanyLogo';
import { trackerLogoDomain } from './CompanyLogo.utils';

describe('job tracker company logos', () => {
  it('does not mistake a job board for the hiring company', () => {
    expect(
      trackerLogoDomain('Microsoft', 'https://www.linkedin.com/jobs/view/123')
    ).toBeNull();
    expect(
      trackerLogoDomain('Microsoft', 'https://acme-recruiting.com/openings/123')
    ).toBeNull();
    render(
      <CompanyLogo
        companyName="Microsoft"
        jobUrl="https://www.linkedin.com/jobs/view/123"
      />
    );
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(
      screen.getByLabelText('Microsoft logo unavailable')
    ).toHaveTextContent('M');
  });

  it('uses a direct company website and falls back when its icon fails', () => {
    render(
      <CompanyLogo
        companyName="North Beam"
        jobUrl="https://northbeam.io/careers"
      />
    );
    const logo = screen.getByRole('img', { name: 'North Beam logo' });
    expect(new URL(logo.getAttribute('src')!).searchParams.get('url')).toBe(
      'https://northbeam.io'
    );
    fireEvent.error(logo);
    expect(
      screen.getByLabelText('North Beam logo unavailable')
    ).toHaveTextContent('NB');
  });
});
