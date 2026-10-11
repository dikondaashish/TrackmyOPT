import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as Sentry from '@sentry/nextjs';
import { BlogFlowFigure } from './BlogFlowFigure';

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));
vi.mock('next/image', () => ({
  default: ({
    unoptimized: _unoptimized,
    ...props
  }: {
    unoptimized?: boolean;
    src: string;
    alt: string;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element -- Exercise load failures without the Next image loader.
    <img {...props} alt={props.alt} />
  ),
}));

const visual = {
  src: '/blog/flows/case-monitoring.gif',
  poster: '/blog/flows/case-monitoring.png',
  alt: 'Case monitoring steps',
  caption: 'Monitoring does not speed up a decision.',
  steps: ['Save receipt', 'Check status', 'Read notice', 'Choose action'],
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('blog process animation', () => {
  it('starts static and supports explicit play and pause while keeping the text steps', () => {
    render(<BlogFlowFigure visual={visual} />);
    expect(screen.getByRole('img')).toHaveAttribute('src', visual.poster);
    fireEvent.click(screen.getByRole('button', { name: 'Play animation' }));
    expect(screen.getByRole('img')).toHaveAttribute('src', visual.src);
    expect(
      screen.getByRole('button', { name: 'Pause animation' })
    ).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Pause animation' }));
    expect(screen.getByRole('img')).toHaveAttribute('src', visual.poster);
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
  });

  it('keeps readable instructions and reports a load failure without applicant data', () => {
    render(<BlogFlowFigure visual={visual} />);
    fireEvent.error(screen.getByRole('img'));
    expect(screen.getByRole('status')).toHaveTextContent(
      'Follow the steps above'
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(Sentry.captureException).toHaveBeenCalledOnce();
    expect(Sentry.captureException).toHaveBeenCalledWith(expect.any(Error), {
      tags: { feature: 'blog-flow-figure' },
    });
  });
});
