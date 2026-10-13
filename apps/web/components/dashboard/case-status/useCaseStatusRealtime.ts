'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseRealtimeSupported } from '@/lib/supabase/realtime-supported';
import type { CaseStatus } from '@/components/dashboard/case-status/case-status-section-helpers';

export function useCaseStatusRealtime(
  caseStatus: CaseStatus | null,
  reload: () => void,
  enabled: boolean
) {
  // ── Supabase Realtime: Instant UI updates when cron updates DB ──
  useEffect(() => {
    if (
      !enabled ||
      !caseStatus?.receipt_number ||
      !isSupabaseRealtimeSupported()
    )
      return;

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
            filter: `id=eq.${caseStatus.id}`,
          },
          () => reload() // Revalidate the live plan through the owned-case API.
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
  }, [caseStatus?.receipt_number, caseStatus?.id, reload, enabled]);
}
