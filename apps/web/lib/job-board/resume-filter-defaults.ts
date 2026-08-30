import { EMPTY_JOB_FILTERS, normalizeJobText, type JobFilters, type RoleFamily } from './filters';
import type { ResumeJobProfile } from './resume-match';

const SEARCH_KEYWORDS = [
  'engineer', 'developer', 'analyst', 'scientist', 'manager', 'designer',
  'consultant', 'architect', 'accountant', 'recruiter', 'coordinator', 'specialist',
] as const;

function roleFamily(roleTitles: string[]): RoleFamily | 'all' {
  const titles = normalizeJobText(roleTitles.join(' '));
  if (/\b(data|analyst|analytics|scientist|machine learning|ml|artificial intelligence|ai)\b/.test(titles)) return 'data';
  if (/\b(engineer|developer|software|platform|security|devops|sre|firmware|architect)\b/.test(titles)) return 'engineering';
  if (/\b(product manager|product owner|product)\b/.test(titles)) return 'product';
  if (/\b(design|designer|ux|ui)\b/.test(titles)) return 'design';
  if (/\b(operations|strategy|customer success|support|deployment|program manager|project manager)\b/.test(titles)) return 'operations';
  if (/\b(sales|account executive|business development|revenue|solutions consultant)\b/.test(titles)) return 'sales';
  return roleTitles.length ? 'other' : 'all';
}

function searchKeyword(roleTitles: string[]) {
  const titles = normalizeJobText(roleTitles.join(' '));
  return SEARCH_KEYWORDS.find((keyword) => titles.includes(keyword)) || '';
}

function matchingLocation(preferredLocations: string[] | undefined, availableLocations: string[]) {
  for (const preference of preferredLocations || []) {
    const normalizedPreference = normalizeJobText(preference);
    if (!normalizedPreference) continue;
    const match = availableLocations.find((location) => {
      const normalizedLocation = normalizeJobText(location);
      return normalizedLocation === normalizedPreference
        || normalizedLocation.includes(normalizedPreference)
        || normalizedPreference.includes(normalizedLocation);
    });
    if (match) return match;
  }
  return 'all';
}

function experienceCeiling(yearsExperience: number | null): JobFilters['experience'] {
  if (yearsExperience === null) return 'all';
  if (yearsExperience <= 2) return 'entry';
  if (yearsExperience <= 5) return 'mid';
  return 'senior';
}

export function deriveResumeJobFilters(profile: ResumeJobProfile, availableLocations: string[]): JobFilters {
  return {
    ...EMPTY_JOB_FILTERS,
    query: searchKeyword(profile.roleTitles),
    date: '30d',
    location: matchingLocation(profile.preferredLocations, availableLocations),
    workplace: profile.workplacePreferences?.[0] || 'all',
    role: roleFamily(profile.roleTitles),
    experience: experienceCeiling(profile.yearsExperience),
  };
}
