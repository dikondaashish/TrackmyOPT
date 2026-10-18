import { beforeEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const m = vi.hoisted(() => ({
  admin: vi.fn(),
  list: vi.fn(),
  setReview: vi.fn(),
  revalidate: vi.fn(),
}));

vi.mock('next/cache', () => ({ revalidatePath: m.revalidate }));
vi.mock('@/lib/policy-news/admin', () => ({ getBlogAdmin: m.admin }));
vi.mock('@/lib/policy-news/store', () => {
  class PolicyNewsStoreError extends Error {
    constructor(readonly code: string) {
      super(code);
    }
  }
  return { PolicyNewsStoreError, listAutoPostsForAdmin: m.list, setAutoPostReview: m.setReview };
});

import { GET, POST } from './route';

const post = (body: unknown) =>
  new NextRequest('https://example.test/api/admin/auto-blog-posts', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

beforeEach(() => {
  vi.clearAllMocks();
  m.admin.mockResolvedValue({ status: 'admin', email: 'dikondaashish@gmail.com' });
  m.list.mockResolvedValue([{ slug: 'a', title: 'A', publishedAt: '2026-10-18T16:40:00Z', reviewedAt: null, reviewedBy: null }]);
  m.setReview.mockResolvedValue(true);
});

it('hides the list from signed-out and non-admin users', async () => {
  m.admin.mockResolvedValue({ status: 'signed_out' });
  expect((await GET()).status).toBe(401);
  m.admin.mockResolvedValue({ status: 'forbidden' });
  expect((await GET()).status).toBe(403);
  expect((await POST(post({ slug: 'a', byline: 'vinay_kumar' }))).status).toBe(403);
  expect(m.setReview).not.toHaveBeenCalled();
});

it('lists automatic posts for the admin', async () => {
  const body = await (await GET()).json();
  expect(body.posts).toHaveLength(1);
});

it('records the review with the admin email and refreshes the post', async () => {
  const response = await POST(post({ slug: 'a', byline: 'vinay_kumar' }));
  expect(response.status).toBe(200);
  expect(m.setReview).toHaveBeenCalledWith('a', 'dikondaashish@gmail.com', expect.any(Date));
  expect(m.revalidate).toHaveBeenCalledWith('/blog/a');
  expect(m.revalidate).toHaveBeenCalledWith('/blog');
});

it('switches back to the News Desk byline', async () => {
  await POST(post({ slug: 'a', byline: 'news_desk' }));
  expect(m.setReview).toHaveBeenCalledWith('a', null, expect.any(Date));
});

it('rejects unknown bylines and missing posts', async () => {
  expect((await POST(post({ slug: 'a', byline: 'someone_else' }))).status).toBe(400);
  m.setReview.mockResolvedValue(false);
  expect((await POST(post({ slug: 'gone', byline: 'vinay_kumar' }))).status).toBe(404);
});
