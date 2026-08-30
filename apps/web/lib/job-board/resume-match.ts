import { z } from 'zod';
import { normalizeJobText, type DegreeLevel, type FilterableJob, type JobFacts } from './filters';

const boundedText = z.string().trim().min(1).max(120);

export const ResumeJobProfileSchema = z.object({
  schemaVersion: z.literal(1),
  roleTitles: z.array(boundedText).max(12),
  skills: z.array(boundedText).max(80),
  certifications: z.array(boundedText).max(20),
  education: z.array(z.object({
    level: z.enum(['bachelor', 'master', 'doctorate']),
    field: z.string().trim().max(160).nullable(),
  }).strict()).max(10),
  yearsExperience: z.number().finite().min(0).max(80).nullable(),
  preferredLocations: z.array(boundedText).max(10).optional(),
  workplacePreferences: z.array(z.enum(['remote', 'hybrid', 'on_site'])).max(3).optional(),
}).strict();

export type ResumeJobProfile = z.infer<typeof ResumeJobProfileSchema>;

export type ResumeJobMatch = {
  score: number;
  label: 'Strong match' | 'Good match' | 'Possible match';
  matchedSkills: string[];
  missingSkills: string[];
  reasons: string[];
};

function removeJsonFence(value: string) {
  return value.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
}

function dedupe(values: string[], limit: number) {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = normalizeJobText(value);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, limit);
}

export function parseResumeJobProfile(value: unknown): ResumeJobProfile | null {
  let candidate = value;
  if (typeof value === 'string') {
    try {
      candidate = JSON.parse(removeJsonFence(value));
    } catch {
      return null;
    }
  }

  const parsed = ResumeJobProfileSchema.safeParse(candidate);
  if (!parsed.success) return null;
  return {
    ...parsed.data,
    roleTitles: dedupe(parsed.data.roleTitles, 12),
    skills: dedupe(parsed.data.skills, 80),
    certifications: dedupe(parsed.data.certifications, 20),
    preferredLocations: parsed.data.preferredLocations ? dedupe(parsed.data.preferredLocations, 10) : undefined,
    workplacePreferences: parsed.data.workplacePreferences ? [...new Set(parsed.data.workplacePreferences)] : undefined,
  };
}

const SKILL_ALIASES: Array<[string, RegExp]> = [
  ['JavaScript', /\bjavascript\b/i],
  ['TypeScript', /\btypescript\b/i],
  ['React', /\breact(?:\.js|js)?\b/i],
  ['Next.js', /\bnext(?:\.js|js)\b/i],
  ['Node.js', /\bnode(?:\.js|js)\b/i],
  ['Python', /\bpython\b/i],
  ['Java', /\bjava\b/i],
  ['C++', /\bc\+\+\b/i],
  ['C#', /\bc#\b/i],
  ['Go', /\bgolang\b|\bgo programming\b/i],
  ['Ruby', /\bruby\b/i],
  ['Rails', /\bruby on rails\b|\brails\b/i],
  ['SQL', /\bsql\b/i],
  ['PostgreSQL', /\bpostgres(?:ql)?\b/i],
  ['MySQL', /\bmysql\b/i],
  ['MongoDB', /\bmongodb\b/i],
  ['Redis', /\bredis\b/i],
  ['AWS', /\baws\b|amazon web services/i],
  ['Azure', /\bazure\b/i],
  ['Google Cloud', /\bgcp\b|google cloud/i],
  ['Docker', /\bdocker\b/i],
  ['Kubernetes', /\bkubernetes\b|\bk8s\b/i],
  ['Terraform', /\bterraform\b/i],
  ['Git', /\bgit\b|\bgithub\b|\bgitlab\b/i],
  ['CI/CD', /\bci\s*\/\s*cd\b|continuous integration|continuous delivery/i],
  ['Linux', /\blinux\b/i],
  ['REST APIs', /\brest(?:ful)?\s+apis?\b/i],
  ['GraphQL', /\bgraphql\b/i],
  ['Machine Learning', /\bmachine learning\b|\bml\b/i],
  ['Data Analysis', /\bdata analysis\b|\banalytics\b/i],
  ['Tableau', /\btableau\b/i],
  ['Power BI', /\bpower\s*bi\b/i],
  ['Excel', /\bexcel\b/i],
  ['Figma', /\bfigma\b/i],
  ['Agile', /\bagile\b/i],
  ['Scrum', /\bscrum\b/i],
  ['Product Management', /\bproduct management\b/i],
  ['Project Management', /\bproject management\b/i],
  ['Salesforce', /\bsalesforce\b/i],
];

const ROLE_PATTERNS: Array<[string, RegExp]> = [
  ['Backend Engineer', /\bback[ -]?end (?:software )?(?:engineer|developer)\b/i],
  ['Frontend Engineer', /\bfront[ -]?end (?:software )?(?:engineer|developer)\b/i],
  ['Full Stack Engineer', /\bfull[ -]?stack (?:software )?(?:engineer|developer)\b/i],
  ['Software Engineer', /\bsoftware (?:engineer|developer)\b/i],
  ['Data Engineer', /\bdata engineer\b/i],
  ['Data Scientist', /\bdata scientist\b/i],
  ['Data Analyst', /\bdata analyst\b/i],
  ['Product Manager', /\bproduct manager\b/i],
  ['Project Manager', /\bproject manager\b/i],
  ['UX Designer', /\b(?:ux|user experience) designer\b/i],
  ['Security Engineer', /\bsecurity engineer\b/i],
  ['DevOps Engineer', /\bdevops engineer\b/i],
  ['Business Analyst', /\bbusiness analyst\b/i],
  ['Account Executive', /\baccount executive\b/i],
  ['Operations Manager', /\boperations manager\b/i],
];

function inferredEducation(text: string): ResumeJobProfile['education'] {
  const normalized = normalizeJobText(text);
  const education: ResumeJobProfile['education'] = [];
  const field = /computer science|software engineering|information systems|data science|business administration|electrical engineering|mechanical engineering/i.exec(text)?.[0] ?? null;
  if (/\bph\.?\s*d\.?\b|\bdoctorate\b|\bdoctoral\b/.test(normalized)) education.push({ level: 'doctorate', field });
  if (/\bmaster(?:'s|s)?\b|\bmaster of\b|\bm\.?s\.?\b|\bmba\b/.test(normalized)) education.push({ level: 'master', field });
  if (/\bbachelor(?:'s|s)?\b|\bbachelor of\b|\bb\.?s\.?\b|\bb\.?a\.?\b/.test(normalized)) education.push({ level: 'bachelor', field });
  return education;
}

export function extractResumeProfileFallback(text: string): ResumeJobProfile {
  const years = [...text.matchAll(/\b(\d{1,2})\s*\+?\s*(?:years?|yrs?)(?:\s+of)?\s+experience\b/gi)]
    .map((match) => Number(match[1]))
    .filter((value) => value <= 80);
  const certifications = dedupe(
    text.split(/\n/).filter((line) => /certif(?:ication|ied)/i.test(line)).map((line) => line.trim()).filter(Boolean),
    20,
  );

  return {
    schemaVersion: 1,
    roleTitles: ROLE_PATTERNS.filter(([, pattern]) => pattern.test(text)).map(([title]) => title).slice(0, 12),
    skills: SKILL_ALIASES.filter(([, pattern]) => pattern.test(text)).map(([skill]) => skill).slice(0, 80),
    certifications,
    education: inferredEducation(text),
    yearsExperience: years.length ? Math.max(...years) : null,
  };
}

const TITLE_STOP_WORDS = new Set(['and', 'the', 'of', 'for', 'to', 'a', 'an', 'senior', 'sr', 'junior', 'jr', 'staff', 'lead', 'principal', 'associate']);

function titleTokens(value: string) {
  return new Set(normalizeJobText(value).split(/[^a-z0-9+#.]+/).filter((token) => token.length > 1 && !TITLE_STOP_WORDS.has(token)));
}

function titleSimilarity(roleTitles: string[], jobTitle: string) {
  const jobTokens = titleTokens(jobTitle);
  let best = 0;
  for (const role of roleTitles) {
    const roleTokens = titleTokens(role);
    if (!roleTokens.size || !jobTokens.size) continue;
    const overlap = [...roleTokens].filter((token) => jobTokens.has(token)).length;
    best = Math.max(best, overlap / roleTokens.size);
  }
  return best;
}

const DEGREE_RANK: Record<DegreeLevel, number> = { bachelor: 1, master: 2, doctorate: 3 };

function containsSkill(jobText: string, skill: string) {
  const normalizedSkill = normalizeJobText(skill);
  if (!normalizedSkill) return false;
  const catalogPattern = SKILL_ALIASES.find(([label]) => normalizeJobText(label) === normalizedSkill)?.[1];
  return catalogPattern ? catalogPattern.test(jobText) : normalizeJobText(jobText).includes(normalizedSkill);
}

export function scoreJobForResume(profile: ResumeJobProfile, job: FilterableJob, facts: JobFacts): ResumeJobMatch {
  const jobText = [job.title, job.description, job.department].filter(Boolean).join(' ');
  const matchedSkills = profile.skills.filter((skill) => containsSkill(jobText, skill));
  const profileText = profile.skills.join(' ');
  const jobSkills = SKILL_ALIASES.filter(([, pattern]) => pattern.test(jobText)).map(([skill]) => skill);
  const missingSkills = jobSkills.filter((skill) => !containsSkill(profileText, skill)).slice(0, 8);
  const relevantSkillCount = Math.max(jobSkills.length, matchedSkills.length);
  const skillScore = relevantSkillCount ? (matchedSkills.length / relevantSkillCount) * 55 : 0;

  const similarity = titleSimilarity(profile.roleTitles, job.title);
  const titleScore = similarity * 25;

  let experienceScore = 6;
  if (profile.yearsExperience !== null && facts.minimumExperienceYears !== null) {
    const gap = facts.minimumExperienceYears - profile.yearsExperience;
    experienceScore = gap <= 0 ? 12 : gap <= 2 ? 5 : 0;
  } else if (profile.yearsExperience === null && facts.minimumExperienceYears !== null) {
    experienceScore = 0;
  }

  let educationScore = 4;
  if (facts.degreeLevels.length) {
    const candidateRank = Math.max(0, ...profile.education.map((item) => DEGREE_RANK[item.level]));
    const minimumRequired = Math.min(...facts.degreeLevels.map((level) => DEGREE_RANK[level]));
    educationScore = candidateRank >= minimumRequired ? 8 : 0;
  }

  const score = Math.max(0, Math.min(100, Math.round(skillScore + titleScore + experienceScore + educationScore)));
  const reasons: string[] = [];
  if (matchedSkills.length) reasons.push(`${matchedSkills.length} resume ${matchedSkills.length === 1 ? 'skill matches' : 'skills match'} this posting`);
  if (similarity >= 0.5) reasons.push('The role title aligns with your experience');
  if (profile.yearsExperience !== null && facts.minimumExperienceYears !== null) {
    reasons.push(profile.yearsExperience >= facts.minimumExperienceYears
      ? `Your ${profile.yearsExperience} years meet the stated experience requirement`
      : `The posting asks for ${facts.minimumExperienceYears} years; your resume shows ${profile.yearsExperience}`);
  }
  if (facts.degreeLevels.length && educationScore > 0) reasons.push('Your education meets the stated degree level');
  if (!reasons.length) reasons.push('Limited qualification overlap was found in the posting text');

  return {
    score,
    label: score >= 75 ? 'Strong match' : score >= 50 ? 'Good match' : 'Possible match',
    matchedSkills: matchedSkills.slice(0, 12),
    missingSkills,
    reasons: reasons.slice(0, 4),
  };
}
