import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TemplatePdfPreview } from './TemplatePdfPreview';
import assets from '@/lib/documents/template-preview-assets.json';

const { renderPage, destroyDocument, getDocument } = vi.hoisted(() => ({ renderPage: vi.fn(), destroyDocument: vi.fn(), getDocument: vi.fn() }));
vi.mock('pdfjs-dist/legacy/build/pdf.mjs', () => ({
  GlobalWorkerOptions: {},
  getDocument,

}));

afterEach(() => {
  cleanup();
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
  destroyDocument.mockReset().mockResolvedValue(undefined);
  getDocument.mockReset().mockImplementation(() => {
    const doc = {
      numPages: 1,
      loadingTask: { destroy: destroyDocument },
      getPage: async () => ({
        getViewport: () => ({ width: 612, height: 792 }),
        render: renderPage,
      }),
    };
    const task = { destroy: destroyDocument, promise: Promise.resolve(doc) };
    doc.loadingTask = task;
    return task;
  });
  renderPage.mockReset().mockReturnValue({ promise: Promise.resolve(), cancel: vi.fn() });
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
  });  it.each(['RenderingCancelledException', 'UnexpectedCleanupError'])('consumes document cleanup rejection: %s', async (name) => {
    setup();
    const report = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = Object.assign(new Error('private PDF details'), { name });
    destroyDocument.mockRejectedValue(error);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) }));
    const view = render(<TemplatePdfPreview templateId="professional" />);
    await waitFor(() => expect(renderPage).toHaveBeenCalled());
    view.unmount();
    await act(async () => Promise.resolve());
    expect(destroyDocument).toHaveBeenCalled();
    if (name === 'RenderingCancelledException') expect(report).not.toHaveBeenCalled();
    else expect(report).toHaveBeenCalledWith('[TemplatePdfPreview] document cleanup failed');
  });
  it('destroys a pending PDF loading task immediately when the preview closes', async () => {
    setup();
    getDocument.mockReturnValue({ destroy: destroyDocument, promise: new Promise(() => {}) });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) }));
    const view = render(<TemplatePdfPreview templateId="tech" />);
    await waitFor(() => expect(getDocument).toHaveBeenCalled());
    view.unmount();
    await act(async () => Promise.resolve());
    expect(destroyDocument).toHaveBeenCalledOnce();
  });

});
