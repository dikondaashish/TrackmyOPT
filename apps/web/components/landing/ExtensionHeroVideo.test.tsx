import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ExtensionHeroVideo } from './ExtensionHeroVideo';

beforeEach(() => {
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })));
  vi.stubGlobal('IntersectionObserver', class {
    observe() {}
    disconnect() {}
  });
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('toggles sound after the browser translates the label beside its icon', () => {
  const { container } = render(<ExtensionHeroVideo />);
  const button = screen.getByRole('button', { name: 'Unmute' });
  const walker = document.createTreeWalker(button, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node.textContent === 'Unmute') {
      const font = document.createElement('font');
      font.textContent = 'Activar sonido';
      node.parentNode!.replaceChild(font, node);
      break;
    }
  }
  expect(button).toHaveTextContent('Activar sonido');
  fireEvent.click(button);
  expect(button).toHaveTextContent('Mute');
  expect(container.querySelector('video')).toHaveProperty('muted', false);
  fireEvent.click(button);
  expect(button).toHaveTextContent('Unmute');
  expect(container.querySelector('video')).toHaveProperty('muted', true);
});
