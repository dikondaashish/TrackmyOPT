import { ResumeService } from './resume.service';

type ResumeServiceWithMocks = ResumeService & {
  supabase: unknown;
};

function createOwnedSingleQuery(row: Record<string, unknown>) {
  const eq = jest.fn();
  const single = jest.fn().mockResolvedValue({ data: row, error: null });
  const query = {
    select: jest.fn(),
    eq,
    single,
  };
  query.select.mockReturnValue(query);
  eq.mockReturnValue(query);
  return query;
}

describe('ResumeService ownership enforcement', () => {
  it('scopes a resume lookup by both resume id and authenticated user id', async () => {
    const query = createOwnedSingleQuery({ id: 'resume-1' });
    const service = Object.create(
      ResumeService.prototype,
    ) as ResumeServiceWithMocks;
    service.supabase = {
      from: jest.fn().mockReturnValue(query),
    };

    await (
      service.getResumeById as unknown as (
        id: string,
        userId: string,
      ) => Promise<unknown>
    )('resume-1', 'user-1');

    expect(query.eq).toHaveBeenCalledWith('id', 'resume-1');
    expect(query.eq).toHaveBeenCalledWith('user_id', 'user-1');
  });
});
