import { findSimilarApplication } from '@/lib/career/job-tracker/application-match';

export type LinkedResumeCandidate = {
  id: string;
  filename: string;
  created_at: string;
  structuredData?: {
    applicationId?: string | null;
    jobDescription?: string | null;
    jobTitle?: string | null;
    atsScore?: number | null;
    atsAnalysis?: { score?: number | null } | null;
    resumeStatus?: string | null;
    type?: string | null;
    latexCode?: string | null;
    generatedLatex?: string | null;
  } | null;
};

type LinkedResumeMatch = {
  id: string;
  filename: string;
  atsScore: number | null;
  resumeStatus: string | null;
  created_at: string;
  matchReason: 'application_id' | 'job_details';
};

type JobForResumeLink = {
  id: string;
  company_name: string;
  role_title: string;
  job_description?: string | null;
};

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function companyAliases(companyName: string): string[] {
  const normalized = normalizeText(companyName);
  if (!normalized) return [];
  const withoutSuffix = normalized
    .replace(/\b(?:incorporated|inc|corporation|corp|company|co|limited|ltd|llc|plc)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return [...new Set([normalized, withoutSuffix].filter(Boolean))];
}

function roleOverlap(left: string, right: string): number {
  // Reuse the same company/role heuristics the extension already trusts for
  // "similar application" warnings, but score only the role half here.
  const probe = findSimilarApplication(
    [{ company_name: 'Same Co', role_title: right, status: 'Applied' }],
    { companyName: 'Same Co', roleTitle: left },
  );
  return probe?.similarity ?? 0;
}

function jdOverlap(left: string, right: string): number {
  const a = new Set(
    normalizeText(left)
      .split(' ')
      .filter((token) => token.length >= 4),
  );
  const b = new Set(
    normalizeText(right)
      .split(' ')
      .filter((token) => token.length >= 4),
  );
  if (a.size === 0 || b.size === 0) return 0;
  let hit = 0;
  for (const token of a) {
    if (b.has(token)) hit += 1;
  }
  return hit / Math.min(a.size, b.size);
}

function atsScoreOf(resume: LinkedResumeCandidate): number | null {
  const direct = resume.structuredData?.atsScore;
  if (typeof direct === 'number') return direct;
  const nested = resume.structuredData?.atsAnalysis?.score;
  return typeof nested === 'number' ? nested : null;
}

function isGenerated(resume: LinkedResumeCandidate): boolean {
  const data = resume.structuredData;
  return Boolean(
    data?.type === 'generated' ||
      data?.latexCode ||
      data?.generatedLatex,
  );
}

function mentionsCompany(resume: LinkedResumeCandidate, companyName: string): boolean {
  const aliases = companyAliases(companyName);
  if (aliases.length === 0) return false;
  const haystack = normalizeText(
    `${resume.filename} ${resume.structuredData?.jobDescription || ''} ${resume.structuredData?.jobTitle || ''}`,
  );
  return aliases.some((alias) => haystack.includes(alias));
}

/**
 * Prefer an exact applicationId link. Fall back to role + (company mention or
 * JD overlap) so extension-generated resumes still surface on the matching job.
 */
export function findLinkedResumeForApplication(
  resumes: LinkedResumeCandidate[],
  application: JobForResumeLink,
): LinkedResumeMatch | null {
  const byId = resumes.find(
    (resume) => resume.structuredData?.applicationId === application.id,
  );
  if (byId) {
    return {
      id: byId.id,
      filename: byId.filename,
      atsScore: atsScoreOf(byId),
      resumeStatus:
        byId.structuredData?.resumeStatus ??
        (isGenerated(byId) ? 'generated' : null),
      created_at: byId.created_at,
      matchReason: 'application_id',
    };
  }

  const appJd = (application.job_description || '').trim();
  const scored = resumes
    .filter(isGenerated)
    .map((resume) => {
      const resumeTitle = (resume.structuredData?.jobTitle || '').trim();
      const resumeJd = (resume.structuredData?.jobDescription || '').trim();
      const roleScore = Math.max(
        roleOverlap(resumeTitle, application.role_title),
        roleOverlap(resume.filename.replace(/^resume[_-]?/i, ' '), application.role_title),
      );
      const companyHit = mentionsCompany(resume, application.company_name);
      const jdScore =
        appJd && resumeJd ? jdOverlap(appJd, resumeJd) : 0;
      const strongEnough =
        roleScore >= 0.7 && (companyHit || jdScore >= 0.28);
      return {
        resume,
        roleScore,
        jdScore,
        companyHit,
        strongEnough,
        createdAt: Date.parse(resume.created_at) || 0,
        ats: atsScoreOf(resume) ?? -1,
      };
    })
    .filter((row) => row.strongEnough)
    .sort((a, b) => {
      if (b.roleScore !== a.roleScore) return b.roleScore - a.roleScore;
      if (b.jdScore !== a.jdScore) return b.jdScore - a.jdScore;
      if (b.ats !== a.ats) return b.ats - a.ats;
      return b.createdAt - a.createdAt;
    });

  const best = scored[0]?.resume;
  if (!best) return null;

  return {
    id: best.id,
    filename: best.filename,
    atsScore: atsScoreOf(best),
    resumeStatus:
      best.structuredData?.resumeStatus ??
      (isGenerated(best) ? 'generated' : null),
    created_at: best.created_at,
    matchReason: 'job_details',
  };
}

/**
 * Resume to hard-link when a job is saved after generate (common extension
 * flow: generate → prefill → apply → save). Prefer an existing applicationId
 * match; otherwise attach an unlinked generated resume that matches the JD.
 */
export function findResumeToAttachOnJobSave(
  resumes: LinkedResumeCandidate[],
  application: JobForResumeLink,
): LinkedResumeMatch | null {
  const alreadyLinked = resumes.find(
    (resume) => resume.structuredData?.applicationId === application.id,
  );
  if (alreadyLinked) {
    return {
      id: alreadyLinked.id,
      filename: alreadyLinked.filename,
      atsScore: atsScoreOf(alreadyLinked),
      resumeStatus:
        alreadyLinked.structuredData?.resumeStatus ??
        (isGenerated(alreadyLinked) ? 'generated' : null),
      created_at: alreadyLinked.created_at,
      matchReason: 'application_id',
    };
  }

  const unlinked = resumes.filter(
    (resume) => !String(resume.structuredData?.applicationId || '').trim(),
  );
  return findLinkedResumeForApplication(unlinked, application);
}
