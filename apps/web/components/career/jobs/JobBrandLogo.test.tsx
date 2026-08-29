import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AtsSourceLogo, JobCompanyLogo } from './JobBrandLogo';
import { companyLogoUrl, domainFromWebsite } from './JobBrandLogo.utils';

describe('JobBrandLogo', () => {
  it('builds the approved 256px favicon URL from a verified company website', () => {
    expect(domainFromWebsite('https://www.northbeam.io/careers')).toBe('northbeam.io');
    expect(companyLogoUrl('northbeam.io')).toBe(
      'https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://northbeam.io&size=256',
    );
  });

  it('renders company and ATS branding without guessing a missing company domain', () => {
    const { rerender } = render(<JobCompanyLogo companyName="North Beam" website="northbeam.io" />);
    expect(screen.getByRole('img', { name: 'North Beam logo' })).toHaveAttribute('src', expect.stringContaining('northbeam.io'));

    rerender(<JobCompanyLogo companyName="Unknown Employer" website={null} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Unknown Employer logo unavailable')).toHaveTextContent('UE');

    rerender(<AtsSourceLogo sourceAts="greenhouse" />);
    expect(screen.getByRole('img', { name: 'Greenhouse logo' })).toHaveAttribute('src', expect.stringContaining('greenhouse.com'));
  });
});
