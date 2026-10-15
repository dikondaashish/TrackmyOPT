import { ConfigService } from '@nestjs/config';
import {
  FAILURE_REPORT_COOLDOWN_MS,
  JobBoardFailureReporter,
} from './job-board-failure-reporter';

function reporter(values: Record<string, string | undefined>) {
  const instance = new JobBoardFailureReporter({
    get: (key: string) => values[key],
  } as unknown as ConfigService);
  const fetchImpl = jest
    .fn<Promise<Response>, Parameters<typeof fetch>>()
    .mockResolvedValue(new Response(null, { status: 200 }));
  let now = 1_000_000;
  instance.fetchImpl = fetchImpl as unknown as typeof fetch;
  instance.clock = () => now;
  (instance as unknown as { logger: unknown }).logger = { error: jest.fn() };
  return { instance, fetchImpl, advance: (ms: number) => (now += ms) };
}

describe('JobBoardFailureReporter', () => {
  it('posts a fixed, body-free signal for the kind to the web bridge', async () => {
    const { instance, fetchImpl } = reporter({
      API_SECRET_KEY: 'k',
      NEXT_PUBLIC_SITE_URL: 'https://site.test',
    });
    await instance.report('source-stalled');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe(
      'https://site.test/api/internal/job-board-worker-failure/source-stalled',
    );
    expect(init).toMatchObject({
      method: 'POST',
      headers: { 'x-api-key': 'k' },
    });
    expect(init?.body).toBeUndefined();
  });

  it('sends each kind at most once per cooldown window', async () => {
    const { instance, fetchImpl, advance } = reporter({ API_SECRET_KEY: 'k' });
    await instance.report('queue-error');
    await instance.report('queue-error');
    await instance.report('redis-eviction');
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    advance(FAILURE_REPORT_COOLDOWN_MS);
    await instance.report('queue-error');
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it('never throws when reporting fails or is not configured', async () => {
    const failing = reporter({ API_SECRET_KEY: 'k' });
    failing.fetchImpl.mockRejectedValue(new Error('network down'));
    await expect(
      failing.instance.report('queue-error'),
    ).resolves.toBeUndefined();
    const unconfigured = reporter({});
    await expect(
      unconfigured.instance.report('queue-error'),
    ).resolves.toBeUndefined();
    expect(unconfigured.fetchImpl).not.toHaveBeenCalled();
  });
});
