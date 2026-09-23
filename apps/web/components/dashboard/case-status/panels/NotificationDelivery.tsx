'use client';
import { useEffect, useState } from 'react';
import { formatCheckedAt } from '@/lib/case-status/safe-dates';
export function NotificationDelivery({
  caseId,
  checkedAt,
}: {
  caseId: string;
  checkedAt: string | null;
}) {
  const [state, setState] = useState<{ label: string; at?: string | null }>({
    label: 'Loading email history…',
  });
  useEffect(() => {
    const abort = new AbortController();
    fetch(
      `/api/case-status/notification-status?case_id=${encodeURIComponent(caseId)}`,
      { signal: abort.signal, credentials: 'include' }
    )
      .then(async (res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((body) => {
        if (abort.signal.aborted) return;
        const n = body.notification;
        const label = !n
          ? 'No case-change email recorded yet.'
          : n.status === 'sent'
            ? 'Latest case email accepted by the provider. Inbox delivery is not confirmed.'
            : n.status === 'failed'
              ? 'Latest case email failed. Check your status here and review your notification address.'
              : n.status === 'pending'
                ? 'Latest case email is pending. Delivery is not yet confirmed.'
                : 'Latest case email was not sent.';
        setState({ label, at: n?.sent_at ?? n?.created_at });
      })
      .catch(() => {
        if (!abort.signal.aborted)
          setState({
            label:
              'Email delivery history is unavailable. Check your case here.',
          });
      });
    return () => abort.abort();
  }, [caseId, checkedAt]);
  return (
    <p role="status" className="px-1 text-xs text-muted-foreground">
      {state.label}
      {state.at && ` (${formatCheckedAt(state.at)})`}
    </p>
  );
}
