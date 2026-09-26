import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TemplatePdfPreview } from './TemplatePdfPreview';
import assets from '@/lib/documents/template-preview-assets.json';

const { renderPage } = vi.hoisted(() => ({ renderPage: vi.fn() }));
vi.mock('pdfjs-dist/legacy/build/pdf.mjs', () => ({
  GlobalWorkerOptions: {},
  getDocument: () => ({
    promise: Promise.resolve({
      numPages: 1,
      destroy: vi.fn(),
      getPage: async () => ({
        getViewport: () => ({ width: 612, height: 792 }),
        render: renderPage,
      }),
    }),
  }),
}));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function setup() {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(private callback: ResizeObserverCallback) {}
      observe() {
        this.callback(
          [{ contentRect: { width: 600 } }] as ResizeObserverEntry[],
          this as unknown as ResizeObserver
        );
      }
      disconnect() {}
    }
  );
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    {} as CanvasRenderingContext2D
  );
  renderPage.mockReturnValue({ promise: Promise.resolve(), cancel: vi.fn() });
}

describe('static PDF previews', () => {
  it('retries download failures using the static PDF without calling the compiler API', async () => {
    setup();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(8),
      });
    vi.stubGlobal('fetch', fetchMock);
    render(<TemplatePdfPreview templateId="academic" />);
    fireEvent.click(
      await screen.findByRole('button', { name: 'Retry preview' })
    );
    await waitFor(() => expect(renderPage).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledTimes(2);
    for (const [url] of fetchMock.mock.calls)
      expect(url).toBe(assets.academic.pdf);
  });
  it('shows a retry action when canvas rendering fails', async () => {
    setup();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    renderPage.mockImplementation(() => ({
      promise: Promise.reject(new Error('render failed')),
      cancel: vi.fn(),
    }));
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue({
          ok: true,
          arrayBuffer: async () => new ArrayBuffer(8),
        })
    );
    render(<TemplatePdfPreview templateId="creative" />);
    expect(
      await screen.findByRole('button', { name: 'Retry preview' })
    ).toBeInTheDocument();
  });
});
