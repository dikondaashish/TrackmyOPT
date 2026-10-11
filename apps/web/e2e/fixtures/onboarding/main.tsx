import React, { useState, useSyncExternalStore } from 'react';
import { createRoot } from 'react-dom/client';
import { OnboardingWizard } from '../../../components/dashboard/onboarding/OnboardingWizard';
import { CaseStatusReceiptPanel } from '../../../components/dashboard/case-status/CaseStatusReceiptPanel';
import '../../../app/globals.css';

// Synthetic, isolated UI fixture. No authenticated product route or database.
const subscribe = (callback: () => void) => {
  window.addEventListener('popstate', callback);
  return () => window.removeEventListener('popstate', callback);
};
function Preview() {
  const pathname = useSyncExternalStore(
    subscribe,
    () => window.location.pathname
  );
  const [open, setOpen] = useState(true);
  const [receipt, setReceipt] = useState('');
  return (
    <main className="min-h-screen bg-muted p-4">
      {pathname === '/dashboard/case-status' ? (
        <div style={{ maxWidth: 720, margin: '40px auto' }}>
          <CaseStatusReceiptPanel
            mode="onboarding"
            receiptNumber={receipt}
            filingCategory="initial_opt"
            onReceiptChange={setReceipt}
            onFilingCategoryChange={() => {}}
            onSave={() => {}}
            isSaving={false}
            isPolling={false}
            error={null}
            success={false}
          />
        </div>
      ) : (
        <OnboardingWizard
          isOpen={open}
          onSkip={() => setOpen(false)}
          onComplete={() => setOpen(false)}
        />
      )}
    </main>
  );
}
createRoot(document.getElementById('root')!).render(<Preview />);
