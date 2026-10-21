/** Merge fields for the Verified Jobs outreach note. Mirrors docs/marketing/updates/2026-10-20-verified-jobs/audience.sql. */

export type OutreachSegment = 'runway' | 'major' | 'general';

export interface OutreachRecipientInput {
  profileFirstName?: string | null;
  metadata?: Record<string, unknown> | null;
  majorName?: string | null;
  optEadEndDate?: string | null;
  stemEadEndDate?: string | null;
  lastSignInAt?: string | null;
}

export interface OutreachFields {
  segment: OutreachSegment;
  engaged: boolean;
  firstName: string;
  named: boolean;
  openingLine: string;
  linkIntro: string;
  jobsUrl: string;
}

const DAY_MS = 86_400_000;
const JOBS_URL = 'https://www.trackmyopt.com/dashboard/career/jobs';
const UTM = 'utm_source=outreach&utm_medium=email&utm_campaign=verified_jobs_2026_10';

function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

/** Profile name first, then sign-up metadata. Handles, initials and email-like values fall back to "there". */
export function outreachFirstName(profileFirstName: string | null | undefined, metadata: Record<string, unknown> | null | undefined) {
  const meta = metadata || {};
  const raw = [text(profileFirstName), text(meta.first_name), text(meta.firstName),
    text(meta.full_name).split(/\s+/)[0], text(meta.fullName).split(/\s+/)[0], text(meta.name).split(/\s+/)[0]]
    .find(Boolean) || '';
  if (raw.length < 2 || /[0-9@_.]/.test(raw)) return null;
  if (raw !== raw.toLowerCase() && raw !== raw.toUpperCase()) return raw;
  return raw.toLowerCase().replace(/(^|[\s'-])\p{L}/gu, match => match.toUpperCase());
}

function rolesFor(major: string) {
  const role = /data|analytic|statistic/i.test(major) ? 'data'
    : /computer|software|information (systems|technology)|cyber/i.test(major) ? 'engineering'
      : /business admin|management|supply chain|mba/i.test(major) ? 'operations' : null;
  const query = /electrical/i.test(major) ? 'electrical engineer'
    : /mechanical/i.test(major) ? 'mechanical engineer'
      : /civil/i.test(major) ? 'civil engineer'
        : /finance|accounting|econom/i.test(major) ? 'analyst' : null;
  const label = role === 'data' ? 'data and analytics' : role === 'engineering' ? 'software and IT'
    : role === 'operations' ? 'operations and business' : query;
  return { role, query, label };
}

export function outreachFields(input: OutreachRecipientInput, now = new Date()): OutreachFields {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const ends = [input.optEadEndDate, input.stemEadEndDate].filter((value): value is string => Boolean(value)).sort();
  const workEnd = ends.at(-1) || null;
  const daysLeft = workEnd ? Math.round((Date.parse(`${workEnd.slice(0, 10)}T00:00:00Z`) - today) / DAY_MS) : null;
  const major = text(input.majorName);
  const { role, query, label } = rolesFor(major);
  // Under 30 days a countdown opener reads as alarming, so those accounts get the major or general line.
  const segment: OutreachSegment = daysLeft !== null && daysLeft >= 30 && daysLeft <= 270 ? 'runway'
    : role || query ? 'major' : 'general';
  const name = outreachFirstName(input.profileFirstName, input.metadata);
  const endLabel = workEnd ? new Date(`${workEnd.slice(0, 10)}T00:00:00Z`).toLocaleDateString('en-US',
    { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : '';
  const openingLine = segment === 'runway'
    ? `The work authorization end date saved in your TrackMyOPT account is ${endLabel}, about ${daysLeft} days from now. I'm guessing the job search is on your mind, so I wanted to share something we built for exactly that.`
    : segment === 'major'
      ? `You mentioned you studied ${major}, so I wanted to share something we just built that should help with your job search.`
      : 'I wanted to share something we just built for students on OPT who are job hunting.';
  const params = ['experience=entry', role && `role=${role}`,
    query && `searchScope=title&query=${query.replace(/ /g, '+')}`, UTM].filter(Boolean).join('&');
  const lastSignIn = input.lastSignInAt ? Date.parse(input.lastSignInAt) : NaN;
  return {
    segment,
    engaged: segment !== 'general' || (Number.isFinite(lastSignIn) && now.getTime() - lastSignIn <= 30 * DAY_MS),
    firstName: name || 'there',
    named: Boolean(name),
    openingLine,
    linkIntro: label ? `I set up a link that opens it on entry-level ${label} roles:` : 'This link opens it on entry-level roles:',
    jobsUrl: `${JOBS_URL}?${params}`,
  };
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);

/** Splits email.txt into subjects and body; the body sits between the first two `---` lines. */
export function parseOutreachSource(source: string) {
  const sections = source.replace(/\r\n/g, '\n').split(/^---$/m);
  const header = sections[0] || '';
  const named = header.match(/^Subject \(named\):\s*(.+)$/m)?.[1]?.trim();
  const unnamed = header.match(/^Subject \(no name\):\s*(.+)$/m)?.[1]?.trim();
  const body = sections[1]?.trim();
  if (!named || !unnamed || !body) throw new Error('email.txt needs both subjects and a body between --- lines');
  return { subjects: { named, unnamed }, text: body };
}

export function renderOutreach(source: { subjects: { named: string; unnamed: string }; text: string; html: string },
  fields: OutreachFields, postalAddress: string) {
  const values: Record<string, string> = {
    firstName: fields.firstName, openingLine: fields.openingLine, linkIntro: fields.linkIntro,
    jobsUrl: fields.jobsUrl, POSTAL_ADDRESS: postalAddress.trim(),
  };
  const fill = (template: string, escape: (value: string) => string) =>
    template.replace(/\{\{(\w+)\}\}/g, (match, key: string) => key in values ? escape(values[key]) : match);
  const subject = fill(fields.named ? source.subjects.named : source.subjects.unnamed, value => value);
  const text = fill(source.text, value => value);
  const html = fill(source.html, escapeHtml);
  if (/\{\{[^{}]+\}\}|\[APPLY TIME/.test(subject + text + html)) throw new Error('Unresolved template field or placeholder');
  return { subject, text, html };
}
