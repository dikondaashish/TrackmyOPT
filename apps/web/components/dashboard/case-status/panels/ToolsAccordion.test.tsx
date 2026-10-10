import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { ToolsAccordion } from './ToolsAccordion';
vi.mock('@/components/dashboard/case-status/WebPushEnableButton', () => ({
  WebPushEnableButton: () => null,
}));
afterEach(cleanup);
it('opens the actual email editor from monitoring setup and lets it close', () => {
  const onCancelEditEmail = vi.fn();
  const notifications = {
    isPremium: true,
    emailAlertsOn: true,
    emailAddress: 'example@example.com',
    isEditingEmail: false,
    emailSaving: false,
    onToggleEmail: vi.fn(),
    onStartEditEmail: vi.fn(),
    onCancelEditEmail,
    onSaveEmail: vi.fn(),
    onEmailChange: vi.fn(),
    onUpgrade: vi.fn(),
  };
  const { rerender } = render(<ToolsAccordion notifications={notifications} />);
  expect(
    screen.getByRole('button', { name: 'Notification Settings' })
  ).toHaveAttribute('aria-expanded', 'false');
  rerender(
    <ToolsAccordion
      notifications={{ ...notifications, isEditingEmail: true }}
    />
  );
  expect(screen.getByRole('textbox')).toHaveValue('example@example.com');
  expect(
    screen.getByRole('button', { name: 'Notification Settings' })
  ).toHaveAttribute('aria-expanded', 'true');
  fireEvent.click(
    screen.getByRole('button', { name: 'Notification Settings' })
  );
  expect(onCancelEditEmail).toHaveBeenCalledOnce();
});
