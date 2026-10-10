'use client';

import { useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseRealtimeSupported } from '@/lib/supabase/realtime-supported';
import type { CaseStatus } from '@/components/dashboard/case-status/case-status-section-helpers';
import { withNormalizedStatusHistory } from '@/lib/case-status/normalize-status-history';

export function useCaseStatusRealtime(
  caseStatus: CaseStatus | null,
  setCaseStatus: Dispatch<SetStateAction<CaseStatus | null>>
) {
  // ── Supabase Realtime: Instant UI updates when cron updates DB ──
  useEffect(() => {
    if (!caseStatus?.receipt_number || !isSupabaseRealtimeSupported()) return;

    let channel: ReturnType<typeof supabase.channel> | null = null;

    try {
      channel = supabase
        .channel(`case-status-realtime-${caseStatus.receipt_number}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'case_status',
            filter: `receipt_number=eq.${caseStatus.receipt_number}`,
          },
          (payload) => {
            setCaseStatus((prev) => {
              if (!prev) return prev;
              return withNormalizedStatusHistory({
                ...prev,
                ...(payload.new as Partial<CaseStatus>),
              });
            });
          }
        )
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.warn('Case status realtime unavailable:', status);
          }
        });
    } catch (error) {
      console.warn('Case status realtime subscription skipped:', error);
    }

    return () => {
      if (channel) {
        try {
          supabase.removeChannel(channel);
        } catch {
          /* non-blocking */
        }
      }
    };
  }, [caseStatus?.receipt_number, setCaseStatus]);
}
