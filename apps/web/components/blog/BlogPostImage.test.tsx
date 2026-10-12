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
    ...props
  }: {
    fill?: boolean;
    priority?: boolean;
    preload?: boolean;
    src: string;
    alt: string;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element -- Exercise the image-load error path.
    <img {...props} alt={props.alt} />
  ),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('blog cover failures', () => {
  it('reports both the cover and fallback failure without including asset or reader data', () => {
    render(
      <BlogPostImage
        src="/blog/october-2026/opt-fees-cover.webp"
        alt="Editorial illustration"
      />
    );
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      '/blog/international-student-guidance-library-2026.png'
    );
    fireEvent.error(screen.getByRole('img'));
    expect(Sentry.captureException).toHaveBeenCalledTimes(2);
    for (const [error, context] of vi.mocked(Sentry.captureException).mock
      .calls) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('Blog cover image failed to load');
      expect(context).toEqual({ tags: { feature: 'blog-cover-image' } });
    }
  });
});
