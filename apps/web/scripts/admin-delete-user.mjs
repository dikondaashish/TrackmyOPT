/**
 * Delete a Supabase auth user and all related public data (same steps as /api/auth/delete-account).
 *
 * Requires apps/web/.env.local with:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:
 *   cd apps/web
 *   node scripts/admin-delete-user.mjs <USER_UUID> --confirm
 *
 * Options:
 *   --no-block   Do not add email to blocked_emails (allows re-signup with same email)
 *
 * Example:
 *   node scripts/admin-delete-user.mjs 358d878b-fa34-4bfd-aa11-97ec9e08d537 --confirm
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env.local') });

const args = process.argv.slice(2).filter((a) => a !== '--confirm');
const hasConfirm = process.argv.includes('--confirm');
const noBlock = args.includes('--no-block');
const filtered = args.filter((a) => a !== '--no-block');
const userId = filtered[0];

function requireEnv(name) {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing ${name} in environment (.env.local).`);
    process.exit(1);
  }
  return v;
}

async function safeDelete(supabase, table, userId) {
  const { error } = await supabase.from(table).delete().eq('user_id', userId);
  if (error) {
    console.warn(`  [warn] ${table}:`, error.message);
  }
}

async function main() {
  if (!userId || !/^[0-9a-f-]{36}$/i.test(userId)) {
    console.error('Usage: node scripts/admin-delete-user.mjs <USER_UUID> --confirm');
    console.error('Optional: --no-block (skip blocked_emails)');
    process.exit(1);
  }

  if (!hasConfirm) {
    console.error('Refusing to run without --confirm (safety).');
    process.exit(1);
  }

  const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
  const serviceKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: userData, error: getErr } = await supabase.auth.admin.getUserById(userId);
  if (getErr || !userData?.user) {
    console.error('User not found in auth:', getErr?.message ?? 'unknown');
    process.exit(1);
  }

  const email = userData.user.email;
  console.log('Deleting user:', userId);
  console.log('Email:', email ?? '(none)');

  if (email && !noBlock) {
    const { error: blockErr } = await supabase.from('blocked_emails').upsert(
      {
        email: email.toLowerCase(),
        reason: 'account_deleted',
        deleted_at: new Date().toISOString(),
      },
      { onConflict: 'email' }
    );
    if (blockErr) console.warn('  [warn] blocked_emails:', blockErr.message);
  }

  const tables = [
    'profiles',
    'opt_status',
    'employment_spans',
    'case_status',
    'document_reminders',
    'documents',
    'document_passcodes',
    'email_preferences',
    'email_queue',
    'notification_settings',
    'payment_transactions',
    'subscriptions',
    'user_sessions',
    'export_otps',
    'passcode_otps',
    'insurance_eligibility',
    'policy_consents',
    'tool_reminders',
  ];

  for (const t of tables) {
    await safeDelete(supabase, t, userId);
  }

  const { error: delErr } = await supabase.auth.admin.deleteUser(userId);
  if (delErr) {
    console.error('auth.admin.deleteUser failed:', delErr.message);
    process.exit(1);
  }

  console.log('Done. User removed from auth and related rows cleared.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
