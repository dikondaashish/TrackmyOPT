import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { ExtensionHeroVideo } from './ExtensionHeroVideo';

afterEach(cleanup);

it('shows the poster first and loads the YouTube player only after a click', () => {
  const { container } = render(<ExtensionHeroVideo />);
  expect(container.querySelector('iframe')).toBeNull();

  fireEvent.click(screen.getByRole('button', { name: 'Play the TrackMyOPT video' }));

  const frame = container.querySelector('iframe');
  expect(frame?.getAttribute('src')).toBe(
    'https://www.youtube-nocookie.com/embed/GoaFPpoygoQ?autoplay=1&mute=1&rel=0&playsinline=1',
  );
  expect(screen.queryByRole('button', { name: 'Play the TrackMyOPT video' })).toBeNull();
});

it('links to the same video on YouTube', () => {
  render(<ExtensionHeroVideo />);
  expect(screen.getByRole('link', { name: /Watch on YouTube/ })).toHaveAttribute('href', 'https://youtu.be/GoaFPpoygoQ');
});
