import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ResetPasswordPage from './page';

const authMocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  updateUser: vi.fn(),
}));

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: authMocks,
  },
}));

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    authMocks.getSession.mockReset();
    authMocks.updateUser.mockReset();
  });

  it('keeps the form disabled when the recovery session is missing', async () => {
    authMocks.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    render(<ResetPasswordPage />);

    expect(screen.getByRole('button', { name: 'Verifying Reset Link...' })).toBeDisabled();
    expect(
      await screen.findByText(/password reset link is invalid or expired/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset Password' })).toBeDisabled();
    expect(screen.getByRole('link', { name: 'Request a new reset link' })).toHaveAttribute(
      'href',
      '/login',
    );
  });

  it('updates the password after Supabase establishes the recovery session', async () => {
    authMocks.getSession.mockResolvedValue({
      data: { session: { access_token: 'recovery-token' } },
      error: null,
    });
    authMocks.updateUser.mockResolvedValue({ data: { user: {} }, error: null });

    render(<ResetPasswordPage />);

    const submitButton = await screen.findByRole('button', { name: 'Reset Password' });
    await waitFor(() => expect(submitButton).toBeEnabled());

    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'new-password' },
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { value: 'new-password' },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authMocks.updateUser).toHaveBeenCalledWith({ password: 'new-password' });
    });
    expect(await screen.findByText('Password Reset Successful!')).toBeInTheDocument();
  });

  it('replaces Supabase auth-session errors with a useful recovery message', async () => {
    authMocks.getSession.mockResolvedValue({
      data: { session: { access_token: 'recovery-token' } },
      error: null,
    });
    const sessionError = new Error('Auth session missing!');
    sessionError.name = 'AuthSessionMissingError';
    authMocks.updateUser.mockResolvedValue({ data: { user: null }, error: sessionError });

    render(<ResetPasswordPage />);

    const submitButton = await screen.findByRole('button', { name: 'Reset Password' });
    await waitFor(() => expect(submitButton).toBeEnabled());

    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'new-password' },
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { value: 'new-password' },
    });
    fireEvent.click(submitButton);

    expect(
      await screen.findByText(/password reset link is invalid or expired/i),
    ).toBeInTheDocument();
    expect(screen.queryByText('Auth session missing!')).not.toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });
});
