/** Trusted operator CLI. Grants one explicitly selected account; never sends email. */
import { createClient } from '@supabase/supabase-js';
import { mkdir, writeFile, access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { z } from 'zod';

async function main() {
  const { values } = parseArgs({
    options: { email: { type: 'string' }, 'setup-file': { type: 'string' } },
    strict: true,
  });
  const email = z.string().trim().email().parse(values.email).toLowerCase();
  const setupFile = values['setup-file'];
  if (setupFile) {
    if (!isAbsolute(setupFile))
      throw new Error(
        'Use an absolute private setup-file path outside the repository'
      );
    const repository = execFileSync('git', ['rev-parse', '--show-toplevel'], {
      encoding: 'utf8',
    }).trim();
    const relativePath = relative(repository, resolve(setupFile));
    if (!relativePath.startsWith('../') && !isAbsolute(relativePath))
      throw new Error('Never store setup credentials inside the repository');
    const exists = await access(setupFile).then(
      () => true,
      () => false
    );
    if (exists)
      throw new Error('Setup file already exists; use a new private filename');
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key)
    throw new Error('Server Supabase configuration is required');
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const blocked = await supabase
    .from('blocked_emails')
    .select('email')
    .eq('email', email)
    .maybeSingle();
  if (blocked.error || blocked.data)
    throw new Error('Account suppression could not be cleared; no grant made');
  let user;
  for (let page = 1; ; page++) {
    const result = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (result.error) throw new Error('Unable to find the selected account');
    user = result.data.users.find(
      (candidate) => candidate.email?.toLowerCase() === email
    );
    if (user || result.data.users.length < 1000) break;
  }
  let setupUrl: string | undefined;
  if (!user) {
    if (!setupFile)
      throw new Error(
        'Account not found. Provide a private setup-file path to create an invited account'
      );
    const invite = await supabase.auth.admin.generateLink({
      type: 'invite',
      email,
    });
    if (
      invite.error ||
      !invite.data.user ||
      !invite.data.properties.hashed_token
    )
      throw new Error('Unable to generate the invited account setup link');
    user = invite.data.user;
    const link = new URL('/admin/setup', 'https://www.trackmyopt.com');
    link.searchParams.set('token_hash', invite.data.properties.hashed_token);
    setupUrl = link.toString();
  } else if (setupFile) {
    throw new Error(
      'Account already exists; grant without setup-file and use normal account recovery if needed'
    );
  }
  const granted = await supabase.auth.admin.updateUserById(user.id, {
    app_metadata: { ...user.app_metadata, email_campaign_admin: true },
  });
  if (
    granted.error ||
    granted.data.user?.app_metadata.email_campaign_admin !== true
  )
    throw new Error('Admin grant failed');
  const verified = await supabase.auth.admin.getUserById(user.id);
  if (
    verified.error ||
    verified.data.user?.app_metadata.email_campaign_admin !== true
  )
    throw new Error('Admin grant verification failed');
  if (setupUrl && setupFile) {
    await mkdir(dirname(setupFile), { recursive: true, mode: 0o700 });
    await writeFile(
      setupFile,
      `TrackMyOPT email analytics admin\nEmail: ${email}\n\nOpen this one-time link privately to choose your password:\n${setupUrl}\n\nAfter setting the password, open https://www.trackmyopt.com/admin/login\nNo email was sent by this setup command.\n`,
      { flag: 'wx', mode: 0o600 }
    );
    console.log(
      'Admin access verified. One-time setup instructions saved to the private output file.'
    );
  } else {
    console.log('Admin access verified for the selected existing account.');
  }
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Admin setup failed');
  process.exitCode = 1;
});
