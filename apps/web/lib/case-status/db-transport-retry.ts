type PostgrestResultLike = {
  status: number;
  error: { code?: string | null } | null;
};

/**
 * supabase-js resolves a request that never received an HTTP response (reset
 * or closed keep-alive socket, DNS blip) with `status: 0` instead of throwing.
 * Retry such idempotent requests once; any HTTP response, including a
 * PostgREST/Postgres error, is returned unchanged.
 */
export async function retryOnDbTransportFailure<T extends PostgrestResultLike>(
  run: () => PromiseLike<T>,
  delayMs = 250
): Promise<T> {
  const first = await run();
  if (!first.error || first.status !== 0) return first;
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  return run();
}

/** Fixed diagnostic label: transport vs. an HTTP/SQLSTATE code, never text. */
export function dbFailureKind(result: PostgrestResultLike): string {
  if (result.status === 0) return 'transport';
  const code = result.error?.code;
  return code && /^(?:[0-9A-Z]{5}|PGRST\d{3})$/.test(code)
    ? `http ${result.status} ${code}`
    : `http ${result.status}`;
}
