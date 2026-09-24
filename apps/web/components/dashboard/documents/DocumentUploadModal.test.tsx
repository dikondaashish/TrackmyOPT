import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DocumentUploadModal } from './DocumentUploadModal';

afterEach(() => vi.unstubAllGlobals());

function selectFile(container: HTMLElement) {
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(input, { target: { files: [new File(['%PDF-1.4'], 'sample.pdf', { type: 'application/pdf' })] } });
}

describe('DocumentUploadModal', () => {
  it('keeps the manual expiry prompt visible until the user continues', async () => {
    const onComplete = vi.fn();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ document: { filename: 'sample.pdf', documentType: 'other', aiConfidence: 0 }, needsManualExpiry: true }),
    }));
    const { container } = render(<DocumentUploadModal open onClose={vi.fn()} onComplete={onComplete} />);
    selectFile(container);
    fireEvent.click(screen.getByRole('button', { name: 'Upload & Analyze' }));
    expect(await screen.findByText(/add or confirm its expiry date/i)).toBeInTheDocument();
    expect(onComplete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'View documents' }));
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it('lets the user retry a failed upload with the selected file', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Upload failed' }),
    }));
    const { container } = render(<DocumentUploadModal open onClose={vi.fn()} onComplete={vi.fn()} />);
    selectFile(container);
    fireEvent.click(screen.getByRole('button', { name: 'Upload & Analyze' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }));
    expect(screen.getByText('sample.pdf')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload & Analyze' })).toBeInTheDocument();
  });
});
