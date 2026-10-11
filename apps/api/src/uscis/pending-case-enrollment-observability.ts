/** Report only a fixed diagnostic; no applicant data or database error leaves the worker. */
export async function reportPendingCaseEnrollmentFailure(
  cronSecret: string | undefined,
): Promise<boolean> {
  if (!cronSecret) return false;
  try {
    const response = await fetch(
      'https://www.trackmyopt.com/api/internal/pending-case-enrollment-failure',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${cronSecret}` },
        redirect: 'error',
        signal: AbortSignal.timeout(4_000),
      },
    );
    return response.ok;
  } catch {
    return false;
  }
}
