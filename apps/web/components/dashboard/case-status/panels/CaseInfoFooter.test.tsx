import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { CaseInfoFooter } from './CaseInfoFooter';
import { UscisCaseStatusDisclaimer } from '@/components/legal/UscisCaseStatusDisclaimer';
import { CASE_STATUS_DISCLAIMER } from '@/lib/legal/legal-config';

it('keeps a single page disclaimer when case information is collapsed or expanded', () => {
  render(
    <>
      <CaseInfoFooter
        caseStatus={{
          receipt_number: 'IOE0000000000',
          filing_category: 'initial_opt',
          case_type: 'I-765',
        }}
      />
      <UscisCaseStatusDisclaimer />
    </>
  );
  expect(screen.getAllByText(CASE_STATUS_DISCLAIMER)).toHaveLength(1);
  fireEvent.click(screen.getByRole('button', { name: 'Case Information' }));
  expect(screen.getByText('IOE0000000000')).toBeVisible();
  expect(screen.getAllByText(CASE_STATUS_DISCLAIMER)).toHaveLength(1);
});
