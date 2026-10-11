import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { deleteAccountData } from './delete-account-data';

const m = vi.hoisted(() => ({ storage: vi.fn() }));
vi.mock('../aws/s3', () => ({ deleteManyFromS3: m.storage }));

function database({ fail = '', count = 1, foreignKey = false, bucket = '' } = {}) {
  const removed: string[] = [];
  const filters: Array<[string, string, unknown]> = [];
  const pages: number[] = [];
  const from = vi.fn((table: string) => {
    const query = {
      select: () => query, order: () => query,
      delete() { removed.push(table); return query; },
      eq(column: string, value: unknown) { filters.push([table, column, value]); return query; },
      range(start: number, end: number) {
        pages.push(start);
        return { overrideTypes: () => Promise.resolve({ data: Array.from({ length: Math.max(0, Math.min((table === 'documents' ? count : 0) - start, end - start + 1)) },
          (_, index) => ({ s3_key: `documents/${foreignKey ? 'other' : 'owner'}/${start + index}.pdf`, s3_bucket: bucket || null })),
          error: fail === 'lookup' ? { message: 'private' } : null }) };
      },
      then(resolve: (value: unknown) => unknown) {
        return Promise.resolve({ error: table === fail ? { message: 'private' } : null }).then(resolve);
      },
    };
    return query;
  });
  return { client: { from } as unknown as SupabaseClient, removed, filters, pages };
}
beforeEach(() => { m.storage.mockReset().mockResolvedValue(undefined); });
describe('ordinary account cleanup', () => {
  it('removes owned files first, every scoped row, and the ordinary email block', async () => {
    const db = database();
    await deleteAccountData(db.client, 'owner', 'Owner@Example.test');
    expect(m.storage).toHaveBeenCalledWith(['documents/owner/0.pdf']);
    expect(db.removed).toContain('case_status');
    expect(db.removed.indexOf('profiles')).toBeGreaterThan(db.removed.indexOf('case_status'));
    expect(db.filters).toContainEqual(['case_status', 'user_id', 'owner']);
    expect(db.filters).toContainEqual(['blocked_emails', 'reason', 'account_deleted']);
    expect(db.filters).toContainEqual(['blocked_emails', 'email', 'owner@example.test']);
  });
  it('keeps all database pointers on a partial S3 failure so deletion can retry', async () => {
    m.storage.mockRejectedValue(new Error('private-key'));
    const db = database();
    await expect(deleteAccountData(db.client, 'owner')).rejects.toThrow('storage cleanup failed');
    expect(db.removed).toEqual([]);
  });
  it('never deletes foreign storage keys or rows after a failed lookup', async () => {
    for (const db of [database({ foreignKey: true }), database({ fail: 'lookup' }), database({ bucket: 'wrong-synthetic-bucket' })]) {
      await expect(deleteAccountData(db.client, 'owner')).rejects.toThrow();
      expect(db.removed).toEqual([]);
    }
    expect(m.storage).not.toHaveBeenCalled();
  });
  it('stops on returned database errors, retaining the profile for a retry', async () => {
    const db = database({ fail: 'case_status' });
    await expect(deleteAccountData(db.client, 'owner')).rejects.toThrow('case_status cleanup failed');
    expect(db.removed).toEqual(['case_status']);
  });
  it('paginates beyond the REST row limit and skips S3 for an empty vault', async () => {
    const db = database({ count: 1001 });
    await deleteAccountData(db.client, 'owner');
    expect(db.pages).toEqual([0, 1000, 0]);
    expect(m.storage.mock.calls[0][0]).toHaveLength(1001);
    m.storage.mockClear();
    await deleteAccountData(database({ count: 0 }).client, 'owner');
    expect(m.storage).not.toHaveBeenCalled();
  });
});
