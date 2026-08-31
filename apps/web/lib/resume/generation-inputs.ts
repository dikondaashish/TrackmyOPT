export const MIN_RESUME_GENERATION_INPUT_CHARS = 50;

/** Returns whether both source inputs are substantial enough to begin generation. */
export function hasResumeGenerationInputs(
  resumeText: string,
  jobDescription: string,
): boolean {
  return (
    resumeText.trim().length >= MIN_RESUME_GENERATION_INPUT_CHARS &&
    jobDescription.trim().length >= MIN_RESUME_GENERATION_INPUT_CHARS
  );
}
