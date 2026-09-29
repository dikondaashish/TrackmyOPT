/** Read-only candidate export. Outputs only account UUIDs to a private file, never emails. */
import { execFileSync } from 'node:child_process';
import { realpath, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative } from 'node:path';
import { parseArgs } from 'node:util';
import { createClient } from '@supabase/supabase-js';
import { config as loadEnv } from 'dotenv';
import { isInactiveAccount } from '../lib/notifications/campaign-audience';

async function main() {
  const { values } = parseArgs({ strict: true, options: { output: { type: 'string' }, 'env-file': { type: 'string' }, help: { type: 'boolean' } } });
  if (values.help) {
    console.log('export-product-update-candidates --env-file /private/operator/server.env --output /private/operator/recipients.json');
    console.log('Read-only: verified Free accounts with no sign-in in 14 days, unused Pro intro, no product-email opt-out or blocked address. Outputs private UUIDs only.');
    return;
  }
  if (!values.output || !isAbsolute(values.output)) throw new Error('Use an absolute output path outside every Git repository');
  const root = await realpath(execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim());
  const parent = await realpath(dirname(values.output));
  const rel = relative(root, parent);
  if (!rel.startsWith('../') && !isAbsolute(rel)) throw new Error('Keep recipient lists outside the repository');
  let otherRepository = '';
  try { otherRepository = execFileSync('git', ['-C', parent, 'rev-parse', '--show-toplevel'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
  catch { /* The private directory need not be a Git checkout. */ }
  if (otherRepository) throw new Error('Keep recipient lists outside every Git repository');
  if (values['env-file']) {
    if (!isAbsolute(values['env-file'])) throw new Error('Use an absolute server environment file path');
    const loaded = loadEnv({ path: values['env-file'], quiet: true });
    if (loaded.error) throw new Error('Unable to load the server environment file');
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Server Supabase configuration is required');
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const candidateIds: string[] = [];
  for (let page = 1; ; page++) {
    const auth = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (auth.error) throw new Error('Unable to inspect account activity');
    const inactive = auth.data.users.filter(user => isInactiveAccount(user, cutoff));
    for (let offset = 0; offset < inactive.length; offset += 100) {
      const batch = inactive.slice(offset, offset + 100);
      const profiles = await supabase.from('profiles').select('user_id,email').in('user_id', batch.map(user => user.id))
        .eq('premium_status', false).eq('pro_free_trial_consumed', false).not('email', 'is', null);
      if (profiles.error) throw new Error('Unable to inspect Free or intro offer eligibility');
      if (!profiles.data?.length) continue;
      const ids = profiles.data.map(row => row.user_id);
      const prefs = await supabase.from('email_preferences').select('user_id').in('user_id', ids).eq('marketing_emails', false);
      if (prefs.error) throw new Error('Unable to inspect product-email opt-outs');
      const blocked = await supabase.from('blocked_emails').select('email').in('email', profiles.data.map(row => row.email.trim().toLowerCase()));
      if (blocked.error) throw new Error('Unable to inspect blocked addresses');
      const optedOut = new Set((prefs.data || []).map(row => row.user_id));
      const suppressed = new Set((blocked.data || []).map(row => row.email.toLowerCase()));
      const confirmedEmail = new Map(batch.map(user => [user.id, user.email!.trim().toLowerCase()]));
      for (const row of profiles.data) {
        const profileEmail = row.email.trim().toLowerCase();
        if (confirmedEmail.get(row.user_id) === profileEmail &&
          !optedOut.has(row.user_id) && !suppressed.has(profileEmail)) candidateIds.push(row.user_id);
      }
    }
    if (auth.data.users.length < 1000) break;
  }
  if (candidateIds.length > 100) throw new Error('More than 100 candidates; review and split the audience before preparing requests');
  candidateIds.sort();
  await writeFile(values.output, JSON.stringify(candidateIds, null, 2) + '\n', { mode: 0o600, flag: 'wx' });
  console.log(`Saved ${candidateIds.length} candidate account IDs to ${values.output}. No recipient emails displayed; no campaign registered or sent.`);
  console.log('This activity signal does not prove product non-use or marketing consent. Review the private list before sending.');
}

main().catch(error => { console.error(error instanceof Error ? error.message : 'Candidate export failed'); process.exitCode = 1; });
