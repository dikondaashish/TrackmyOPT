import { fetchAllPages } from './paginate';

describe('fetchAllPages', () => {
  it('reads beyond the Supabase 1,000-row REST page cap', async () => {
    const rows = Array.from({ length: 1_100 }, (_, index) => index);
    const ranges: Array<[number, number]> = [];
    const result = await fetchAllPages((from, to) => {
      ranges.push([from, to]);
      return { data: rows.slice(from, to + 1), error: null };
    });

    expect(result).toHaveLength(1_100);
    expect(ranges).toEqual([
      [0, 999],
      [1_000, 1_999],
    ]);
  });

  it('surfaces page errors without returning partial data', async () => {
    await expect(
      fetchAllPages(() => ({
        data: null,
        error: { message: 'temporary database failure' },
      })),
    ).rejects.toThrow('temporary database failure');
  });
});
