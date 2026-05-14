/**
 * Document Reminder Generation Utility
 * 
 * Automatically generates reminders for documents with expiry dates
 * Uses database function for consistency
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Generate reminders for a document with expiry date
 * Creates 10 reminders: 60, 45, 30, 20, 15, 10, 5, 3, 2, 1 days before expiry
 * 
 * @param userId - User ID
 * @param documentId - Document ID
 * @param documentName - Document filename
 * @param expiryDate - Expiry date (YYYY-MM-DD)
 */
export async function generateRemindersForDocument(
  userId: string,
  documentId: string,
  documentName: string,
  expiryDate: string
): Promise<void> {
  try {

    // Use service role client for database function
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Call database function to create reminders
    const { error } = await supabase.rpc('create_document_reminders', {
      p_user_id: userId,
      p_document_id: documentId,
      p_document_name: documentName,
      p_expiry_date: expiryDate,
    });

    if (error) {
      console.error('❌ Error creating reminders:', error);
      throw error;
    }

  } catch (error) {
    console.error('❌ Failed to generate reminders:', error);
    // Don't throw - reminders are nice-to-have, not critical
  }
}

/**
 * Calculate reminder dates.
 *
 * ISS-019: normalizes both the expiry and "today" to UTC midnight before
 * comparing so DST shifts and local-timezone edge cases don't drop or duplicate
 * reminders firing at day boundaries.
 */
export function calculateReminderDates(expiryDate: string): Date[] {
  // Parse as YYYY-MM-DD into UTC midnight
  const [y, m, d] = expiryDate.slice(0, 10).split('-').map((s) => parseInt(s, 10));
  if (!y || !m || !d) return [];
  const expiry = new Date(Date.UTC(y, m - 1, d));

  // "Today" at UTC midnight — same coordinate system as expiry
  const now = new Date();
  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  const reminderOffsets = [60, 45, 30, 20, 15, 10, 5, 3, 2, 1];

  return reminderOffsets
    .map((days) => new Date(expiry.getTime() - days * 24 * 60 * 60 * 1000))
    .filter((date) => date.getTime() >= todayUtc.getTime());
}

/**
 * Get reminder type label
 */
export function getReminderLabel(daysBefore: number): string {
  const labels: Record<number, string> = {
    60: '60 days',
    45: '45 days',
    30: '30 days',
    20: '20 days',
    15: '15 days',
    10: '10 days',
    5: '5 days',
    3: '3 days',
    2: '2 days',
    1: '1 day',
  };

  return labels[daysBefore] || `${daysBefore} days`;
}

/**
 * Format reminder message
 */
export function formatReminderMessage(
  documentName: string,
  daysBefore: number
): string {
  const label = getReminderLabel(daysBefore);

  return `Your document "${documentName}" will expire in ${label}. Please renew it soon.`;
}

/**
 * Check if reminders exist for a document
 */
export async function documentHasReminders(documentId: string): Promise<boolean> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('document_reminders')
      .select('id')
      .eq('document_id', documentId)
      .limit(1);

    if (error) throw error;

    return (data?.length || 0) > 0;
  } catch (error) {
    console.error('Error checking reminders:', error);
    return false;
  }
}

