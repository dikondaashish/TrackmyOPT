import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import AdminLoginForm from './login-form';
const navigation = vi.hoisted(() => ({ replace: vi.fn(), refresh: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => navigation }));
beforeEach(() => vi.clearAllMocks());
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it('signs in via the protected endpoint without storing the password', async () => {
  const fetch = vi
    .fn()
    .mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
  vi.stubGlobal('fetch', fetch);
  render(<AdminLoginForm />);
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'admin@example.invalid' },
  });
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: 'test-only-password' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
  await waitFor(() =>
    expect(navigation.replace).toHaveBeenCalledWith('/admin/email-campaigns')
  );
  expect(fetch).toHaveBeenCalledWith(
    '/api/admin/login',
    expect.objectContaining({
      method: 'POST',
      credentials: 'same-origin',
      body: JSON.stringify({
        email: 'admin@example.invalid',
        password: 'test-only-password',
      }),
    })
  );
  expect(screen.getByLabelText('Password')).toHaveValue('');
  expect(window.localStorage.getItem('password')).toBeNull();
});
it('shows denied access and clears the failed password', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue({
        ok: false,
        json: async () => ({
          error: 'Invalid email, password, or admin access',
        }),
      })
  );
  render(<AdminLoginForm />);
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'admin@example.invalid' },
  });
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: 'wrong-test-password' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Invalid email, password, or admin access'
  );
  expect(screen.getByLabelText('Password')).toHaveValue('');
  expect(navigation.replace).not.toHaveBeenCalled();
});
