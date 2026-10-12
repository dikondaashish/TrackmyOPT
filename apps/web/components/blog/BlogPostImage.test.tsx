import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as Sentry from '@sentry/nextjs';
import { BlogPostImage } from './BlogPostImage';

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

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('blog cover failures', () => {
  it('recovers from optimizer failure through the original static cover before using a static fallback', () => {
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
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByRole('img')).toHaveTextContent('Cover unavailable');
    expect(Sentry.captureException).toHaveBeenCalledTimes(3);
    for (const [error, context] of vi.mocked(Sentry.captureException).mock
      .calls) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('Blog cover image failed to load');
      expect(context).toEqual({ tags: { feature: 'blog-cover-image' } });
    }
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
