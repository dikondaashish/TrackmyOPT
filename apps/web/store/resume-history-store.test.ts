import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('zustand', async () => {
  const actual = await vi.importActual<typeof import('zustand')>('zustand');
  return actual;
});

describe('resume history infinite scroll helpers', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('appends the next page without replacing the first page', async () => {
    const { useResumeHistoryStore } = await import('@/store/resume-history-store');
    useResumeHistoryStore.setState({
      resumes: [],
      totalCount: 0,
      isLoading: false,
      isLoadingMore: false,
      search: '',
      page: 1,
      pageSize: 2,
    });

    const page1 = [
      {
        id: '1',
        filename: 'a.pdf',
        content: 'a',
        created_at: '2026-01-01',
        file_path: null,
      },
      {
        id: '2',
        filename: 'b.pdf',
        content: 'b',
        created_at: '2026-01-02',
        file_path: null,
      },
    ];
    const page2 = [
      {
        id: '3',
        filename: 'c.pdf',
        content: 'c',
        created_at: '2026-01-03',
        file_path: null,
      },
    ];

    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ data: page1, total: 3 }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ data: page2, total: 3 }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          }),
        ),
    );

    await useResumeHistoryStore.getState().fetchResumes('user-1');
    expect(useResumeHistoryStore.getState().resumes).toHaveLength(2);
    expect(useResumeHistoryStore.getState().hasMore()).toBe(true);

    await useResumeHistoryStore.getState().fetchMoreResumes('user-1');
    expect(useResumeHistoryStore.getState().resumes.map((r) => r.id)).toEqual([
      '1',
      '2',
      '3',
    ]);
    expect(useResumeHistoryStore.getState().hasMore()).toBe(false);
  });
});
