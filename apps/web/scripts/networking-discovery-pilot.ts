/** Run from apps/web with: pnpm exec tsx scripts/networking-discovery-pilot.ts openai all */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import dotenv from 'dotenv';
import { discoverContacts, lookupWorkEmail, type DiscoveryProvider } from '../lib/career/networking/providers';

dotenv.config({ path: '.env.local', quiet: true });

const companies = [
  { companyName: 'Microsoft', companyDomain: 'microsoft.com', targetRole: 'Software Engineer' },
  { companyName: 'Amazon', companyDomain: 'amazon.com', targetRole: 'Software Engineer' },
  { companyName: 'Google', companyDomain: 'google.com', targetRole: 'Software Engineer' },
  { companyName: 'Asana', companyDomain: 'asana.com', targetRole: 'Software Engineer' },
  { companyName: 'Browserbase', companyDomain: 'browserbase.com', targetRole: 'Software Engineer' },
  { companyName: 'Zine', companyDomain: null, targetRole: 'Software Engineer' },
  { companyName: 'Quasar Finch Labs', companyDomain: null, targetRole: 'Software Engineer' },
] as const;

async function main() {
  const provider = process.argv[2];
  const selected = process.argv[3] ?? 'all';
  if (provider !== 'gemini' && provider !== 'openai') throw new Error('Select gemini or openai');
  const cases = selected === 'all' ? companies : companies.filter((company) =>
    company.companyName.toLowerCase() === selected.toLowerCase());
  if (!cases.length) throw new Error(`Unknown company: ${selected}`);
  const findings = [];
  for (const company of cases) {
    const started = Date.now();
    try {
      const result = await discoverContacts({ ...company, userId: 'networking-discovery-pilot' }, provider as DiscoveryProvider);
      const applyBolt = await Promise.all(result.contacts.map(async (contact) => ({
        name: contact.name, linkedinUrl: contact.linkedinUrl,
        status: (await lookupWorkEmail(contact.linkedinUrl, company.companyName)).status,
      })));
      findings.push({ provider, ...company, metrics: result.metrics,
        proposedContacts: result.diagnostics.proposedContacts,
        validatedContacts: result.contacts, sources: result.diagnostics.sources,
        searchQueries: result.diagnostics.searchQueries, applyBolt });
    } catch (error) {
      findings.push({ provider, ...company, error: error instanceof Error ? error.message : String(error),
        latency_ms: Date.now() - started });
    }
    const current = findings[findings.length - 1];
    console.log(JSON.stringify(current));
  }
  const output = join(process.env.NETWORKING_PILOT_OUTPUT_DIR || '/tmp',
    `networking-discovery-${provider}-${selected.toLowerCase()}-${Date.now()}.json`);
  writeFileSync(output, JSON.stringify(findings, null, 2));
  console.log(`Pilot findings saved to ${output}`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
