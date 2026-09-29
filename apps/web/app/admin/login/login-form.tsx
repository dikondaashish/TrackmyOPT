'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminLoginForm({
  accessDenied = false,
  setupInvalid = false,
}: {
  accessDenied?: boolean;
  setupInvalid?: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(
    setupInvalid
      ? 'This setup link is invalid or expired. Use account recovery to set your password.'
      : accessDenied
        ? 'This account does not have email analytics access. Sign in with an approved admin account.'
        : ''
  );
  const [loading, setLoading] = useState(false);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
        signal: AbortSignal.timeout(20000),
      });
      const result = await response.json();
      setPassword('');
      if (!response.ok) throw new Error(result.error || 'Unable to sign in');
      router.replace('/admin/email-campaigns');
      router.refresh();
    } catch (err) {
      setPassword('');
      setError(err instanceof Error ? err.message : 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-slate-50 px-5 py-12 dark:bg-background">
      <div className="w-full max-w-md rounded-2xl border bg-card p-7 shadow-sm sm:p-9">
        <p className="mb-8 font-semibold text-blue-600 dark:text-blue-400">
          TrackMyOPT{' '}
          <span className="ml-2 text-xs font-normal uppercase tracking-widest text-muted-foreground">
            Admin
          </span>
        </p>
        <LockKeyhole
          aria-hidden="true"
          className="mb-4 h-7 w-7 text-blue-600"
        />
        <h1 className="text-2xl font-semibold tracking-tight">
          Sign in to email analytics
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Use your approved admin email and password to view campaign results.
        </p>
        <form onSubmit={signIn} className="ph-no-capture mt-7 space-y-5">
          <label className="block space-y-2 text-sm font-medium">
            Email
            <Input
              type="email"
              name="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={254}
              disabled={loading}
            />
          </label>
          <label className="block space-y-2 text-sm font-medium">
            Password
            <Input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              maxLength={256}
              disabled={loading}
            />
          </label>
          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <Button className="w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
        <Link
          href="/login"
          className="mt-5 block text-center text-sm text-blue-600 dark:text-blue-400"
        >
          Forgot password? Use account recovery
        </Link>
      </div>
    </main>
  );
}
