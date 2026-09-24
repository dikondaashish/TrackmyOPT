import React from 'react';
import { createRoot } from 'react-dom/client';
import { DocumentVaultClient } from '../../../components/dashboard/documents/DocumentVaultClient';
import '../../../app/globals.css';

// Only served by the Playwright fixture, never included in the Next.js app.
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: 16 }}>
      <DocumentVaultClient />
    </main>
  </React.StrictMode>,
);
