import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createClient } from '@/lib/supabase/server';

import { DELETE, GET, POST } from './route';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

const authenticatedUserId = '11111111-1111-4111-8111-111111111111';
const attackerSuppliedUserId = '22222222-2222-4222-8222-222222222222';

describe('resume API proxy ownership boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: authenticatedUserId } },
          error: null,
        }),
      },
    } as never);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      ),
    );
  });

  it('replaces a caller-supplied list owner with the authenticated identity', async () => {
    const request = new NextRequest(
      `https://www.trackmyopt.com/api/proxy/resume/list?userId=${attackerSuppliedUserId}&limit=20`,
    );

    const response = await GET(request, {
      params: Promise.resolve({ path: ['resume', 'list'] }),
    });

    expect(response.status).toBe(200);
    expect(fetch).toHaveBeenCalledWith(
      expect.not.stringContaining('userId='),
      expect.objectContaining({
        headers: expect.objectContaining({}),
      }),
    );
    const [, options] = vi.mocked(fetch).mock.calls[0];
    expect(new Headers(options?.headers).get('x-trackmyopt-user-id')).toBe(
      authenticatedUserId,
    );
  });

  it('removes an untrusted owner from a resume save body', async () => {
    const request = new NextRequest(
      'https://www.trackmyopt.com/api/proxy/resume/save',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          userId: attackerSuppliedUserId,
          filename: 'resume.pdf',
          content: 'resume content',
          structuredData: {},
        }),
      },
    );

    const response = await POST(request, {
      params: Promise.resolve({ path: ['resume', 'save'] }),
    });

    expect(response.status).toBe(200);
    const [, options] = vi.mocked(fetch).mock.calls[0];
    expect(JSON.parse(String(options?.body))).toEqual({
      filename: 'resume.pdf',
      content: 'resume content',
      structuredData: {},
    });
    expect(new Headers(options?.headers).get('x-trackmyopt-user-id')).toBe(
      authenticatedUserId,
    );
  });

  it('streams an allowlisted backend response without buffering it', async () => {
    const upstream = new Response('streamed resume response', {
      status: 200,
      headers: { 'content-type': 'text/plain' },
    });
    const arrayBuffer = vi
      .spyOn(upstream, 'arrayBuffer')
      .mockRejectedValue(new Error('proxy attempted to buffer'));
    vi.mocked(fetch).mockResolvedValueOnce(upstream);

    const response = await GET(
      new NextRequest('https://www.trackmyopt.com/api/proxy/resume/list'),
      { params: Promise.resolve({ path: ['resume', 'list'] }) },
    );

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe('streamed resume response');
    expect(arrayBuffer).not.toHaveBeenCalled();
  });

  it('allowlists delete-by-filename and forwards the trusted user header', async () => {
    const request = new NextRequest(
      `https://www.trackmyopt.com/api/proxy/resume/by-filename?filename=${encodeURIComponent('resume.pdf')}&userId=${attackerSuppliedUserId}`,
      { method: 'DELETE' },
    );

    const response = await DELETE(request, {
      params: Promise.resolve({ path: ['resume', 'by-filename'] }),
    });

    expect(response.status).toBe(200);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/resume/by-filename?filename=resume.pdf'),
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.not.stringContaining('userId='),
      expect.anything(),
    );
    const [, options] = vi.mocked(fetch).mock.calls[0];
    expect(new Headers(options?.headers).get('x-trackmyopt-user-id')).toBe(
      authenticatedUserId,
    );
  });
});
