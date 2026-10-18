import { beforeEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const m = vi.hoisted(() => ({ load: vi.fn() }));
vi.mock('@/lib/policy-news/store', () => ({ loadCoverImage: m.load }));

import { GET } from './route';

const get = (file: string) =>
  GET(new NextRequest(`https://example.test/blog-covers/${file}`), { params: Promise.resolve({ file }) });

beforeEach(() => vi.clearAllMocks());

it('serves a stored cover as cacheable WebP', async () => {
  m.load.mockResolvedValue(Buffer.from('webp'));
  const response = await get('dhs-opt-fees.webp');
  expect(m.load).toHaveBeenCalledWith('dhs-opt-fees');
  expect(response.status).toBe(200);
  expect(response.headers.get('Content-Type')).toBe('image/webp');
  expect(response.headers.get('Cache-Control')).toContain('s-maxage');
  expect(Buffer.from(await response.arrayBuffer()).toString()).toBe('webp');
});

it('404s for other extensions and missing covers', async () => {
  expect((await get('dhs-opt-fees.png')).status).toBe(404);
  expect(m.load).not.toHaveBeenCalled();
  m.load.mockResolvedValue(null);
  expect((await get('missing.webp')).status).toBe(404);
});
