import { ConfigService } from '@nestjs/config';
import type { Queue } from 'bull';
import { createClient } from '@supabase/supabase-js';
import { UscisService } from './uscis.service';

jest.mock('@supabase/supabase-js', () => ({ createClient: jest.fn() }));

describe('daily USCIS queue pagination', () => {
  function setup(failPage = false) {
    const ranges: Array<[string, number]> = [];
    const from = jest.fn((table: string) => {
      const query = {
        upsert: jest.fn().mockResolvedValue({ error: null }),
        update: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        then: (resolve: (value: unknown) => unknown) =>
          Promise.resolve({ error: null }).then(resolve),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn((start: number, end: number) => {
          ranges.push([table, start]);
          const count = table === 'case_status' ? 1681 : 1100;
          const data = Array.from(
            { length: Math.max(0, Math.min(end + 1, count) - start) },
            (_, i) => ({
              id: `case-${start + i}`,
              user_id: `user-${start + i}`,
              receipt_number: `receipt-${start + i}`,
            }),
          );
          return Promise.resolve({
            data,
            error:
              failPage && start > 0 ? { message: 'page unavailable' } : null,
          });
        }),
      };
      return query;
    });
    jest
      .mocked(createClient)
      .mockReturnValue({ from } as unknown as ReturnType<typeof createClient>);
    const addBulk = jest
      .fn<Promise<unknown[]>, [unknown[]]>()
      .mockResolvedValue([]);
    const service = new UscisService(new ConfigService(), {
      addBulk,
    } as unknown as Queue);
    return { service, addBulk, ranges };
  }

  it('queues eligible cases beyond the first 1000 and pages premium users too', async () => {
    const { service, addBulk, ranges } = setup();
    await expect(service.queueAllActiveCases()).resolves.toEqual({
      count: 1100,
      skippedFree: 581,
    });
    expect(ranges).toContainEqual(['case_status', 1000]);
    expect(ranges).toContainEqual(['profiles', 1000]);
    expect(addBulk.mock.calls[0][0]).toHaveLength(2200);
  });

  it('dry run reads every page but does not queue or persist jobs', async () => {
    const { service, addBulk } = setup();
    expect(await service.queueAllActiveCases(true)).toEqual({
      count: 1100,
      skippedFree: 581,
      dryRun: true,
    });
    expect(addBulk).not.toHaveBeenCalled();
  });

  it('does not queue an incomplete population after a page error', async () => {
    const { service, addBulk } = setup(true);
    await expect(service.queueAllActiveCases()).rejects.toThrow(
      'page unavailable',
    );
    expect(addBulk).not.toHaveBeenCalled();
  });
});
