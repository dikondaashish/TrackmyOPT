'use client';

/**
 * Document Grid Component
 * 
 * Displays documents in a responsive grid layout
 */

import { useState } from 'react';
import { DocumentCard } from './DocumentCard';
import { DocumentViewModal } from './DocumentViewModal';

interface Document {
  id: string;
  filename: string;
  documentType: string;
  category: string;
  issueDate: string | null;
  expiryDate: string | null;
  summary: string;
  extractedFields: Record<string, any>;
  aiConfidence: number;
  uploadedAt: string;
}

interface DocumentGridProps {
  documents: Document[];
  loading: boolean;
  onDocumentDelete: (id: string) => void;
  onRefresh: () => void;
}

export function DocumentGrid({
  documents,
  loading,
  onDocumentDelete,
  onRefresh,
}: DocumentGridProps) {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [openEditExpiry, setOpenEditExpiry] = useState(false);

  function handleOpenWithExpiry(doc: Document) {
    setSelectedDocument(doc);
    setOpenEditExpiry(true);
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete document');
      }

      onDocumentDelete(id);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete document');
    }
  }

  if (loading) {
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

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="w-24 h-24 text-gray-300 mx-auto mb-4"
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
        <h3 className="text-xl font-bold text-gray-900 mb-2">No documents yet</h3>
        <p className="text-gray-600">
          Upload your first document to get started
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <DocumentCard
            key={doc.id}
            document={doc}
            onView={() => {
              setOpenEditExpiry(false);
              setSelectedDocument(doc);
            }}
            onDelete={() => handleDelete(doc.id)}
            onAddExpiry={() => handleOpenWithExpiry(doc)}
          />
        ))}
      </div>

      {selectedDocument && (
        <DocumentViewModal
          document={selectedDocument}
          onClose={() => {
            setSelectedDocument(null);
            setOpenEditExpiry(false);
          }}
          onDelete={() => {
            handleDelete(selectedDocument.id);
            setSelectedDocument(null);
          }}
          onUpdate={(updatedDoc) => {
            // Update the selected document with new data
            setSelectedDocument(updatedDoc);
            // Refresh the document list to reflect changes
            onRefresh();
          }}
          autoEditExpiry={openEditExpiry}
        />
      )}
    </>
  );
}

