import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HelpFaqTab } from '@/components/dashboard/widgets/help/HelpFaqTab';
import { HelpFeaturesTab } from '@/components/dashboard/widgets/help/HelpFeaturesTab';
import PrivacyPage from '@/app/privacy/page';
import {
  EXTENSION_AUTOFILL_PLAN_NOTICE,
  EXTENSION_AUTOFILL_PRIVACY_PARAGRAPHS,
  PRIVATE_ANSWER_PREFILL_NOTICE,
} from './legal-config';

vi.mock('@/components/legal/LegalPageShell', () => ({
  LegalPageShell: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));

describe('extension privacy and help consistency', () => {
  it('shows the current behavior and shared allowances in expanded FAQs', () => {
    render(<HelpFaqTab />);
    fireEvent.click(screen.getByRole('button', { name: 'What does application Prefill change?' }));
    expect(screen.getByText(/No separate approval step/)).toHaveTextContent(PRIVATE_ANSWER_PREFILL_NOTICE);
    fireEvent.click(screen.getByRole('button', { name: 'Is the extension free?' }));
    expect(screen.getByText(/OPT tools and job tracking are free/)).toHaveTextContent(EXTENSION_AUTOFILL_PLAN_NOTICE);
  });

  it('shows updated safety and supported dropdown help', () => {
    render(<HelpFeaturesTab />);
    fireEvent.click(screen.getByRole('button', { name: 'Chrome Extension' }));
    expect(screen.getByText(/No separate approval step/)).toHaveTextContent(PRIVATE_ANSWER_PREFILL_NOTICE);
    expect(screen.getByText(/Supported dropdowns can select/)).toBeInTheDocument();
    expect(screen.getByText(/Free includes Step-by-step/)).toHaveTextContent(EXTENSION_AUTOFILL_PLAN_NOTICE);
  });

  it('renders each disclosure paragraph and links to the actual private-data settings', () => {
    render(<PrivacyPage />);
    for (const paragraph of EXTENSION_AUTOFILL_PRIVACY_PARAGRAPHS) {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    }
    expect(screen.getByRole('link', { name: 'Chrome Job Prefill' })).toHaveAttribute('href', '/dashboard/extension');
  });

  it.each([
    '../extension/README.md',
    '../extension/store-assets/LISTING-0.2.0.md',
    '../extension/store-assets/source/store-assets.html',
    '../../docs/pending-implementation-plan.md',
    'app/dashboard/extension/page.tsx',
    'components/dashboard/settings/PrivateApplicationAnswersSection.tsx',
    'components/dashboard/widgets/help/HelpFaqTab.tsx',
    'components/dashboard/widgets/help/HelpFeaturesTab.tsx',
  ])('does not restore the removed gate in %s', (file) => {
    const text = readFileSync(path.resolve(process.cwd(), file), 'utf8').replace(/\s+/g, ' ');
    expect(text).not.toMatch(/private answers (?:always require your approval|require approval|can fill only after)|Approve private answers for that application|must approve them for each application|masked until you explicitly approve them|encryption and require explicit review and approval|loaded only into the review panel|before anything is entered/i);
  });
});
