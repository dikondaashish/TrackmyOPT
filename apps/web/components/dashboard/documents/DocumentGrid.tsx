'use client';

/**
 * Document Grid Component
 * 
 * Displays documents in a responsive grid layout
 */

import { useState, useRef, useEffect } from 'react';
import { triggerBrowserDownload } from '@/lib/browser-download';
import { DocumentCard } from './DocumentCard';
import { DocumentViewModal } from './DocumentViewModal';

import type { VaultDocument as Document } from '@/lib/documents/vault-utils';

interface DocumentGridProps {
  documents: Document[];
  loading: boolean;
  hasFilters?: boolean;
  onDocumentDelete: (id: string) => void;
  onRefresh: () => void;
  onUpload: () => void;
  onClearFilters: () => void;
}

export function DocumentGrid({
  documents,
  loading,
  hasFilters = false,
  onDocumentDelete,
  onRefresh,
  onUpload,
  onClearFilters,
}: DocumentGridProps) {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [openEditExpiry, setOpenEditExpiry] = useState(false);

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Document | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [notice, setNotice] = useState('');
  const deleteDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = deleteDialogRef.current;
    if (deleteTarget && dialog && !dialog.open) dialog.showModal();
    return () => { if (dialog?.open) dialog.close(); };
  }, [deleteTarget]);

  function requestDelete(doc: Document) {
    setDeleteError('');
    setDeleteTarget(doc);
  }

  function handleOpenWithExpiry(doc: Document) {
    setActionError('');
    setSelectedDocument(doc);
    setOpenEditExpiry(true);
  }

  async function handleDownload(doc: Document) {
    if (downloadingId) return;
    setDownloadingId(doc.id);
    setActionError('');
    setNotice('');
    try {
      const res = await fetch(`/api/documents/${doc.id}/download`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to download document. Please try again.');
      }
      triggerBrowserDownload(await res.blob(), doc.filename || 'document');
      setNotice('Download started.');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to download document. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch(`/api/documents/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete document. Please try again.');
      }
      onDocumentDelete(deleteTarget.id);
      if (selectedDocument?.id === deleteTarget.id) setSelectedDocument(null);
      setDeleteTarget(null);
      setNotice('Document deleted.');
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete document. Please try again.');
    } finally {
      setDeleting(false);
    }
  }

  if (loading && documents.length === 0 && !selectedDocument && !deleteTarget) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-lg border p-4 animate-pulse">
            <div className="h-32 bg-gray-200 rounded mb-4" />
            <div className="h-4 bg-gray-200 rounded mb-2" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (documents.length === 0 && !selectedDocument && !deleteTarget) {
    return (
      <div className="text-center py-10">
        <svg
          className="w-14 h-14 text-gray-300 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{hasFilters ? 'No matching documents' : 'No documents yet'}</h3>
        <p className="text-gray-600 dark:text-slate-300">
          {hasFilters ? 'Try another category or search term.' : 'Upload your first document to get started.'}
        </p>
        <button onClick={hasFilters ? onClearFilters : onUpload} className="mt-4 min-h-11 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          {hasFilters ? 'Clear filters' : 'Upload document'}
        </button>
        {notice && <p role="status" className="mt-3 text-sm text-gray-600 dark:text-slate-300">{notice}</p>}
      </div>
    );
  }

  return (
    <>
      {actionError && !selectedDocument && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-700 dark:bg-red-900/30 dark:text-red-400">{actionError}</p>}
      {notice && <p role="status" className="text-sm text-gray-600 dark:text-slate-300">{notice}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <DocumentCard
            key={doc.id}
            document={doc}
            onView={() => {
              setActionError('');
              setOpenEditExpiry(false);
              setSelectedDocument(doc);
            }}
            onDelete={() => requestDelete(doc)}
            downloading={downloadingId === doc.id}
            downloadDisabled={downloadingId !== null}
            onAddExpiry={() => handleOpenWithExpiry(doc)}
            onDownload={() => handleDownload(doc)}
          />
        ))}
      </div>

      {selectedDocument && (
        <DocumentViewModal
          key={selectedDocument.id}
          document={selectedDocument}
          onDownload={() => handleDownload(selectedDocument)}
          downloading={downloadingId === selectedDocument.id}
          actionError={actionError}
          onClose={() => {
            setSelectedDocument(null);
            setOpenEditExpiry(false);
          }}
          onDelete={() => requestDelete(selectedDocument)}
          onUpdate={(updatedDoc) => {
            // Update the selected document with new data
            setSelectedDocument(updatedDoc);
            // Refresh the document list to reflect changes
            onRefresh();
          }}
          autoEditExpiry={openEditExpiry}
        />
      )}
      {deleteTarget && (
        <dialog ref={deleteDialogRef} aria-labelledby="delete-document-title" aria-describedby="delete-document-description" onCancel={event => { event.preventDefault(); if (!deleting) setDeleteTarget(null); }} className="w-[calc(100%-2rem)] max-w-md rounded-lg bg-white p-5 dark:bg-slate-800 backdrop:bg-black/50">
          <h2 id="delete-document-title" className="text-lg font-semibold text-gray-900 dark:text-white">Delete document?</h2>
          <p id="delete-document-description" className="mt-2 break-words text-sm text-gray-600 dark:text-slate-300">“{deleteTarget.filename}” and its expiry reminders will be permanently deleted. This cannot be undone.</p>
          {deleteError && <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">{deleteError}</p>}
          <div className="mt-5 flex justify-end gap-3">
            <button autoFocus disabled={deleting} onClick={() => setDeleteTarget(null)} className="min-h-11 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 dark:border-slate-600 dark:text-slate-300">Cancel</button>
            <button disabled={deleting} onClick={handleDelete} className="min-h-11 rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/30 disabled:opacity-50">{deleting ? 'Deleting…' : 'Delete permanently'}</button>
          </div>
        </dialog>
      )}
    </>
  );
}
