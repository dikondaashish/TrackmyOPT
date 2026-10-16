import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as Sentry from '@sentry/nextjs';
import {
  BlogPostImage,
  reportUnavailableBlogImage,
  reportUnavailableCover,
  resetCoverFailureProbe,
} from './BlogPostImage';

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));
vi.mock('next/image', () => ({
  default: ({
    fill: _fill,
    priority: _priority,
    preload: _preload,
    unoptimized,
    ...props
  }: {
    fill?: boolean;
    priority?: boolean;
    preload?: boolean;
    unoptimized?: boolean;
    src: string;
    alt: string;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element -- Exercise the image-load error path.
    <img
      {...props}
      alt={props.alt}
      data-unoptimized={unoptimized ? 'true' : 'false'}
    />
  ),
}));

const fetchMock = vi.fn();
const served = (status: number, type = 'image/png') =>
  new Response(null, { status, headers: { 'content-type': type } });
beforeEach(() => {
  resetCoverFailureProbe();
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockResolvedValue(served(404, 'text/html'));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('blog cover failures', () => {
  it('recovers from optimizer failure through the original static cover before using a static fallback', async () => {
    render(
      <BlogPostImage
        src="/blog/october-2026/opt-fees-cover.webp"
        alt="Editorial illustration"
      />
    );
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      '/blog/october-2026/opt-fees-cover.webp'
    );
    expect(screen.getByRole('img')).toHaveAttribute('data-unoptimized', 'true');
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      '/blog/international-student-guidance-library-2026.png'
    );
    // Recovered stages are not failures the reader can see.
    expect(Sentry.captureException).not.toHaveBeenCalled();
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByRole('img')).toHaveTextContent('Cover unavailable');
    await waitFor(() =>
      expect(Sentry.captureException).toHaveBeenCalledTimes(1)
    );
    expect(fetchMock).toHaveBeenCalledWith(
      '/blog/october-2026/opt-fees-cover.webp',
      { method: 'HEAD', cache: 'no-store' }
    );
    const [error, context] = vi.mocked(Sentry.captureException).mock.calls[0];
    expect(error).toEqual(
      new Error('Blog cover image failed to load (stage=http, status=404)')
    );
    expect(context).toEqual({ tags: { feature: 'blog-cover-image' } });
  });

  it('does not report covers the server serves but the browser would not show', async () => {
    fetchMock.mockResolvedValue(served(200));
    await reportUnavailableCover('/blog/first.webp');
    await reportUnavailableCover('/blog/second.webp');
    expect(Sentry.captureException).not.toHaveBeenCalled();
    // One confirmation covers the page; crawlers do not probe every cover.
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('reports a cover served as a non-image response', async () => {
    fetchMock.mockResolvedValue(served(200, 'text/html'));
    await reportUnavailableCover('/blog/first.webp');
    expect(Sentry.captureException).toHaveBeenCalledWith(
      new Error('Blog cover image failed to load (stage=payload, status=200)'),
      { tags: { feature: 'blog-cover-image' } }
    );
  });

  it('marks a probe without any response as a network-stage failure', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    await reportUnavailableCover('/blog/first.webp');
    await reportUnavailableCover('/blog/second.webp');
    expect(Sentry.captureException).toHaveBeenCalledOnce();
    expect(Sentry.captureException).toHaveBeenCalledWith(
      new Error('Blog cover image failed to load (stage=network, status=none)'),
      { tags: { feature: 'blog-cover-image' } }
    );
  });

  it('loads a new source after a previous source failed', () => {
    const { rerender } = render(
      <BlogPostImage src="/blog/first.webp" alt="First cover" />
    );
    fireEvent.error(screen.getByRole('img'));
    fireEvent.error(screen.getByRole('img'));
    rerender(<BlogPostImage src="/blog/second.webp" alt="Second cover" />);
    expect(screen.getByRole('img')).toHaveAttribute('src', '/blog/second.webp');
    expect(screen.getByRole('img')).toHaveAttribute(
      'data-unoptimized',
      'false'
    );
  });
});

describe('reportUnavailableBlogImage', () => {
  it('names the image kind and feature in the report', async () => {
    fetchMock.mockResolvedValue(served(404, 'text/html'));
    await reportUnavailableBlogImage(
      '/blog/flow.webp',
      'Blog process illustration',
      'blog-flow-figure'
    );
    expect(Sentry.captureException).toHaveBeenCalledWith(
      new Error('Blog process illustration failed to load (stage=http, status=404)'),
      { tags: { feature: 'blog-flow-figure' } }
    );
  });
});
