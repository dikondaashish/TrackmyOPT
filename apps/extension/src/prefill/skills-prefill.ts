export const MAX_SKILLS_PREFILL_ITEMS = 50;
export const MAX_SKILLS_PREFILL_CHARACTERS = 1_000;

/** Build the bounded plain-text value permitted by Rule 8. */
export function buildSkillsPrefillValue(
  skills: readonly string[],
  enabled: boolean,
): string {
  if (!enabled) return '';

  const seen = new Set<string>();
  const accepted: string[] = [];
  let characterCount = 0;

  for (const rawSkill of skills) {
    const skill = rawSkill.trim().replace(/\s+/g, ' ');
    if (!skill) continue;
    const key = skill.toLocaleLowerCase('en-US');
    if (seen.has(key)) continue;
    const separatorLength = accepted.length > 0 ? 2 : 0;
    if (characterCount + separatorLength + skill.length > MAX_SKILLS_PREFILL_CHARACTERS) break;
    seen.add(key);
    accepted.push(skill);
    characterCount += separatorLength + skill.length;
    if (accepted.length >= MAX_SKILLS_PREFILL_ITEMS) break;
  }

  return accepted.join(', ');
}
