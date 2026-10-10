// A conservative additional guard, not a complete factual verifier. The model
// still needs the grounding prompt and the applicant's final review.
const TOOLS =
  /\b(dbt|snowflake|bigquery|redshift|databricks|airflow|dagster|tableau|power\s*bi|looker|spark|pyspark|python|postgres(?:ql)?|mysql|kafka|terraform|kubernetes|docker|aws|azure|gcp|react|typescript)\b/gi;
function names(text: string): string[] {
  return (text.match(TOOLS) ?? []).map((name) =>
    name.toLowerCase().replace(/\s/g, '')
  );
}
function evidence(snapshot: unknown): string[] {
  if (!snapshot || typeof snapshot !== 'object') return [];
  const source = snapshot as Record<string, unknown>;
  return names(
    JSON.stringify({
      summary: source.summary,
      skills: source.skills,
      experience: source.experience,
      education: source.education,
      certifications: source.certifications,
    })
  );
}
export function hasQuestionEvidence(
  question: string,
  snapshot: unknown
): boolean {
  if (!/\b(you|your|experience|used|use|worked)\b/i.test(question)) return true;
  const known = evidence(snapshot);
  return names(question).every((name) => known.includes(name));
}
export function hasUnsupportedTools(draft: string, snapshot: unknown): boolean {
  const known = evidence(snapshot);
  return names(draft).some((name) => !known.includes(name));
}
