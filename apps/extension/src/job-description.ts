export type JobDescriptionSource = 'frame' | 'specific' | 'outer';

export interface JobDescriptionCandidate {
  source: JobDescriptionSource;
  text: string;
}

const SOURCE_PRIORITY: Record<JobDescriptionSource, number> = {
  frame: 3,
  specific: 2,
  outer: 1,
};

/** Select the real posting text deterministically. Job-content frames outrank
 * outer branding/footer pages; within the same source, the fuller text wins. */
export function chooseJobDescriptionCandidate(
  candidates: JobDescriptionCandidate[],
  maxLength = 15_000,
): string {
  const valid = candidates
    .map((candidate) => ({ ...candidate, text: candidate.text.replace(/\r\n/g, '\n').trim() }))
    .filter((candidate) => candidate.text.length > 200)
    .sort((a, b) =>
      SOURCE_PRIORITY[b.source] - SOURCE_PRIORITY[a.source] || b.text.length - a.text.length
    );
  return (valid[0]?.text || '').slice(0, maxLength);
}
