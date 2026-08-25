import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CaseInsightUpgradeDialog } from '@/components/dashboard/case-status/CaseInsightUpgradeDialog';

describe('CaseInsightUpgradeDialog', () => {
  afterEach(cleanup);

  it('connects the case context to a truthful Pro offer', () => {
    render(
      <CaseInsightUpgradeDialog
        open
        onOpenChange={vi.fn()}
        onUpgrade={vi.fn()}
        introEligible
        daysSinceFiled={42}
        typicalWaitDays={70}
        cohortSize={318}
      />
    );

    expect(
      screen.getByText('Stop wondering where your case stands.')
    ).toBeInTheDocument();
    expect(screen.getByText(/you are 42 days in/i)).toHaveTextContent(
      '318 comparable community cases'
    );
    expect(screen.getByText('$0.99 for your first 7 days')).toBeInTheDocument();
    expect(
      screen.getByText(/cannot speed up or influence a USCIS decision/i)
    ).toBeInTheDocument();
  });

  it('does not advertise the introductory price to an ineligible account', () => {
    render(
      <CaseInsightUpgradeDialog
        open
        onOpenChange={vi.fn()}
        onUpgrade={vi.fn()}
        introEligible={false}
      />
    );

    expect(screen.getByText('Pro starts at $7.99/month')).toBeInTheDocument();
    expect(
      screen.queryByText(/\$0\.99 for your first/i)
    ).not.toBeInTheDocument();
  });

  it('offers an obvious upgrade action and a respectful dismissal', () => {
    const onUpgrade = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <CaseInsightUpgradeDialog
        open
        onOpenChange={onOpenChange}
        onUpgrade={onUpgrade}
        introEligible
      />
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Unlock my case insights' })
    );
    expect(onUpgrade).toHaveBeenCalledOnce();

    fireEvent.click(
      screen.getByRole('button', { name: 'Keep checking manually' })
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
