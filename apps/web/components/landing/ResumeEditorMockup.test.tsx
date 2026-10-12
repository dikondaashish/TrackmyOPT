import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { ResumeEditorMockup } from './ResumeEditorMockup';

// Browser translation replaces text nodes; React must retain the parent element
// when updating a label beside an icon or conditionally inserting another child.
function translateText(parent: Element, text: string, translated: string) {
  const walker = document.createTreeWalker(parent, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node.textContent === text) {
      const font = document.createElement('font');
      font.textContent = translated;
      node.parentNode!.replaceChild(font, node);
      return;
    }
  }
  throw new Error(`Missing fixture text: ${text}`);
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it('updates the translated enhancement label and description through completion', () => {
  vi.useFakeTimers();
  render(<ResumeEditorMockup />);
  const button = screen.getByRole('button', { name: 'Enhance with AI' });
  translateText(button, 'Enhance with AI', 'Mejorar con IA');
  const description = screen.getByText('Description');
  translateText(description, 'Description', 'Descripción');
  const editorText = screen.getByText(/^Software Engineer Used React and Node.js/);
  translateText(editorText, editorText.textContent!, 'Experiencia original');

  fireEvent.click(button);
  expect(button).toHaveTextContent('Enhancing...');
  act(() => vi.advanceTimersByTime(1500));
  expect(button).toHaveTextContent('AI Enhanced');
  expect(button).toBeDisabled();
  expect(screen.getByText('Improved')).toBeInTheDocument();
  expect(screen.getByText('Descripción')).toBeInTheDocument();
  expect(screen.getByText(/^Software Engineer • Architected scalable/)).toBeInTheDocument();
});
