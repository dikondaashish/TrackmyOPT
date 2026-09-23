import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { OptEmailRemindersPanel } from './OptEmailRemindersPanel';
afterEach(cleanup);
it('labels static reminder numbers as examples, not the actual user countdown', () => {
  render(<OptEmailRemindersPanel isPremium toolEmails={{opt_apply:'',opt_clock:'',stem_apply:'',stem_clock:''}} editingTool={null} emailSaving={null} onEditTool={vi.fn()} onCancelEdit={vi.fn()} onSaveTool={vi.fn()} onStopTool={vi.fn()} onUpdateEmail={vi.fn()} onComparePlans={vi.fn()}/>);
  expect(screen.getByText(/I-765 filing window closes in 14 days/)).toHaveTextContent(/^Example:/);
  expect(screen.getByText(/28 unemployment days left/)).toHaveTextContent(/^Example:/);
});
